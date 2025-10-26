// src/index.ts
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { Orchestrator } from "./orchestrator";
import { executionRouter } from "./routes/executions";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const orchestrator = new Orchestrator();

// attach orchestrator to request for routes
app.use((req, res, next) => {
  (req as any).orchestrator = orchestrator;
  next();
});

app.use("/executions", executionRouter);

// Admin-only: start a new execution
app.post("/start/:workflowId", async (req, res) => {
  try {
    const wfId = req.params.workflowId;
    const context = req.body.context || {};
    const exec = await orchestrator.startExecution(wfId, context);
    res.json(exec);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
  console.log(`Orchestrator API listening on http://localhost:${PORT}`);
});

