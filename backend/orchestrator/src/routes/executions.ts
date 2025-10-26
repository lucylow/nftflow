// src/routes/executions.ts
import express from "express";
import { listExecutions, getExecution, updateExecution } from "../storage";

export const executionRouter = express.Router();

// list all executions
executionRouter.get("/", (req, res) => {
  const all = listExecutions();
  res.json(all);
});

// get single execution
executionRouter.get("/:id", (req, res) => {
  const e = getExecution(req.params.id);
  if (!e) return res.status(404).json({ error: "not found" });
  res.json(e);
});

// approve
executionRouter.post("/:id/approve", async (req, res) => {
  try {
    const orchestrator = (req as any).orchestrator;
    const approver = req.body.approver || "operator";
    const note = req.body.note || "";
    const result = await orchestrator.approveExecution(req.params.id, approver, note);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// reject
executionRouter.post("/:id/reject", async (req, res) => {
  try {
    const orchestrator = (req as any).orchestrator;
    const approver = req.body.approver || "operator";
    const reason = req.body.reason || "";
    const result = await orchestrator.rejectExecution(req.params.id, approver, reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

