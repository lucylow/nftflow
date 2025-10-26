// src/types.ts
export type Step = {
  id: string;
  name: string;
  action: string; // e.g., 'analyze_market', 'create_listing', 'finalize_onchain'
  agent?: string; // which agent runs it
  parameters?: Record<string, any>;
  dependencies?: string[]; // previous step ids
  timeoutSeconds?: number;
  retryCount?: number;
};

export type Workflow = {
  id: string;
  name: string;
  description?: string;
  humanApprovalRequired?: boolean; // <--- IMPORTANT FLAG
  steps: Step[];
};

export type ExecutionStatus =
  | "pending"
  | "running"
  | "waiting_approval"
  | "approved"
  | "rejected"
  | "completed"
  | "failed";

export type Execution = {
  id: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
  status: ExecutionStatus;
  currentStepIndex: number; // index into workflow.steps or -1 if not started
  stepResults: Record<string, any>; // step.id -> result
  agentTrace: any[]; // list of agent decisions, for audit
  humanApproval?: {
    requestedAt?: string;
    requestedByAgent?: string;
    approver?: string;
    approvedAt?: string;
    rejectedAt?: string;
    reason?: string;
    rejectionReason?: string;
  };
};

