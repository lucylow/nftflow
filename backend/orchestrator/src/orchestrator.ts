// src/orchestrator.ts
import EventEmitter from "events";
import { Workflow, Execution, Step } from "./types";
import { v4 as uuidv4 } from "uuid";
import { getWorkflows } from "./workflows";
import { addExecution, updateExecution, getExecution } from "./storage";
import { notifyOperator } from "./notify";
import { finalizeOnchain } from "./blockchain";

export class Orchestrator extends EventEmitter {
  workflows: Workflow[];

  constructor() {
    super();
    this.workflows = getWorkflows();
  }

  findWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.find((w) => w.id === workflowId);
  }

  /**
   * Start an execution of a workflow
   */
  async startExecution(workflowId: string, context: any = {}) {
    const wf = this.findWorkflow(workflowId);
    if (!wf) throw new Error("workflow not found");

    const exec: Execution = {
      id: uuidv4(),
      workflowId: wf.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      currentStepIndex: -1,
      stepResults: {},
      agentTrace: []
    };

    addExecution(exec);

    // Kick off execute loop asynchronously
    this.executeWorkflow(exec.id, context).catch((err) => {
      console.error("Execution loop failed", err);
      updateExecution(exec.id, { status: "failed" });
    });

    return exec;
  }

  /**
   * The main workflow execution loop.
   * It executes each step serially (for simplicity) and pauses before final action
   * if humanApprovalRequired is true.
   */
  async executeWorkflow(executionId: string, context: any = {}) {
    const exec = getExecution(executionId);
    if (!exec) throw new Error("execution not found");

    const wf = this.findWorkflow(exec.workflowId)!;
    updateExecution(exec.id, { status: "running", currentStepIndex: 0 });

    for (let i = 0; i < wf.steps.length; i++) {
      const step = wf.steps[i];
      // update active step
      updateExecution(exec.id, { currentStepIndex: i });

      try {
        // Simulate dispatch to agent — in production call corresponding agent service/tool
        const result = await this.runStep(step, context, exec);

        // store result
        const stored = getExecution(exec.id);
        const stepResults = stored?.stepResults || {};
        stepResults[step.id] = result;
        updateExecution(exec.id, { stepResults });

        // If this workflow requires human approval AND we are at the last step (policy),
        // pause execution and set waiting_approval state.
        const isLastStep = i === wf.steps.length - 1;

        if (wf.humanApprovalRequired && isLastStep) {
          // set waiting approval and notify operator
          updateExecution(exec.id, {
            status: "waiting_approval",
            humanApproval: {
              requestedAt: new Date().toISOString(),
              requestedByAgent: step.agent || "agent"
            }
          });
          // emit event for UI or listeners
          this.emit("workflow:approval_required", exec.id);
          await notifyOperator(
            `Workflow ${wf.name} (${exec.id}) is waiting for human approval (last step: ${step.name})`
          );
          // PAUSE: do not continue; finalization must wait for operator to call approve endpoint
          return getExecution(exec.id);
        }

        // If not waiting for approval, continue and, if it's final, finalize onchain if defined
        if (isLastStep && step.action === "finalize_onchain") {
          // final on-chain payload may be returned in result.payload
          const payload = result?.payload;
          // Finalize immediately (if no HITL required)
          const receipt = await finalizeOnchain(exec.id, payload);
          updateExecution(exec.id, { status: "completed" });
          this.emit("workflow:completed", exec.id);
          return getExecution(exec.id);
        }
      } catch (err: any) {
        console.error("Step failed", step.id, err);
        updateExecution(exec.id, {
          status: "failed",
          // also append agentTrace or failure details
          agentTrace: [
            ...(getExecution(exec.id)?.agentTrace || []),
            { step: step.id, error: (err && err.message) || String(err) }
          ]
        });
        this.emit("workflow:failed", exec.id);
        return getExecution(exec.id);
      }
    }

    // if reached here (no finalization) mark completed
    updateExecution(executionId, { status: "completed" });
    this.emit("workflow:completed", executionId);
    return getExecution(executionId);
  }

  /**
   * Simulated step runner: in real systems this dispatches to agent microservices,
   * calls subgraph, embeddings, etc. Here we simulate and return a payload.
   */
  async runStep(step: Step, context: any, exec: any) {
    // In prod: map 'action' to actual agent or tool
    console.log(`Running step ${step.id} (${step.action})`);
    // Simulated results:
    switch (step.action) {
      case "gather_metadata":
        // example: gather nft metadata & traits
        return { ok: true, metadata: { name: "My NFT", traits: [] } };

      case "pricing_analysis":
        // example: compute price suggestion
        return { ok: true, suggestedPricePerSecond: "1000000000000", rationale: "floor/rarity" };

      case "generate_proposal":
        // combine metadata and pricing into proposal
        return {
          ok: true,
          proposal: {
            nftContract: context.nftContract || "0xNFT",
            tokenId: context.tokenId || "1",
            pricePerSecond: "1000000000000",
            duration: 86400
          },
          payload: {
            action: "finalize_listing",
            listing: {
              nftContract: context.nftContract || "0xNFT",
              tokenId: context.tokenId || "1",
              pricePerSecond: "1000000000000",
              duration: 86400
            }
          }
        };

      case "finalize_onchain":
        // return payload prepared for the finalization
        return { ok: true, payload: context.finalPayload || {} };

      default:
        return { ok: true, info: `simulated ${step.action}` };
    }
  }

  /**
   * Called by operator/DAO to approve a waiting execution.
   * This will either mark approved and optionally trigger final on-chain call (execute final step).
   */
  async approveExecution(executionId: string, approver: string, note?: string) {
    const exec = getExecution(executionId);
    if (!exec) throw new Error("execution not found");
    if (exec.status !== "waiting_approval") throw new Error("execution not waiting approval");

    // mark approved
    updateExecution(executionId, {
      status: "approved",
      humanApproval: {
        ...(exec.humanApproval || {}),
        approver,
        approvedAt: new Date().toISOString(),
        reason: note || ""
      }
    });

    // optionally execute final on-chain action here.
    // We look up the final step's payload and call finalizeOnchain
    const wf = this.findWorkflow(exec.workflowId)!;
    const finalStep = wf.steps[wf.steps.length - 1];
    const stepResult = exec.stepResults[finalStep.id];

    // if stepResult contains payload to finalize, execute it
    const payload = stepResult?.payload;
    if (payload) {
      try {
        const receipt = await finalizeOnchain(exec.id, payload);
        updateExecution(exec.id, { status: "completed" });
        this.emit("workflow:completed", exec.id);
        return { ok: true, tx: receipt };
      } catch (err: any) {
        updateExecution(exec.id, { status: "failed" });
        return { ok: false, error: err.message || String(err) };
      }
    } else {
      // nothing to do, just mark completed
      updateExecution(exec.id, { status: "completed" });
      this.emit("workflow:completed", exec.id);
      return { ok: true };
    }
  }

  async rejectExecution(executionId: string, approver: string, rejectionReason?: string) {
    const exec = getExecution(executionId);
    if (!exec) throw new Error("execution not found");
    if (exec.status !== "waiting_approval") throw new Error("execution not waiting approval");

    updateExecution(executionId, {
      status: "rejected",
      humanApproval: {
        ...(exec.humanApproval || {}),
        approver,
        rejectedAt: new Date().toISOString(),
        rejectionReason
      }
    });

    this.emit("workflow:rejected", executionId);
    // optionally add cleanup / rollback logic here
    return { ok: true };
  }
}

