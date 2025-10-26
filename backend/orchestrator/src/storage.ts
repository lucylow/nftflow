// src/storage.ts
import fs from "fs";
import path from "path";
import { Execution, Workflow } from "./types";
import { AllWorkflows } from "./workflows";

const DATA_DIR = path.join(__dirname, "../data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const EXEC_FILE = path.join(DATA_DIR, "executions.json");

let executions: Execution[] = [];

// load on startup
try {
  if (fs.existsSync(EXEC_FILE)) {
    const raw = fs.readFileSync(EXEC_FILE, "utf8");
    executions = JSON.parse(raw);
  } else {
    executions = [];
    fs.writeFileSync(EXEC_FILE, JSON.stringify(executions, null, 2));
  }
} catch (err) {
  console.error("Failed to load executions store", err);
  executions = [];
}

export const getWorkflows = (): Workflow[] => {
  return AllWorkflows;
};

export const saveExecutions = () => {
  fs.writeFileSync(EXEC_FILE, JSON.stringify(executions, null, 2));
};

export const addExecution = (exec: Execution) => {
  executions.push(exec);
  saveExecutions();
};

export const updateExecution = (id: string, patch: Partial<Execution>) => {
  const idx = executions.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  executions[idx] = { ...executions[idx], ...patch, updatedAt: new Date().toISOString() };
  saveExecutions();
  return executions[idx];
};

export const getExecution = (id: string) => executions.find((e) => e.id === id);
export const listExecutions = () => executions;

export const clearExecutions = () => {
  executions = [];
  saveExecutions();
};

