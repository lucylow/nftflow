import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { recommendationsRouter } from "./routes/recommendations";
import { proposalsRouter } from "./routes/proposals";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "nftflow-agent-service" });
});

// Agent endpoints
app.use("/api/agent", recommendationsRouter);
app.use("/api/agent", proposalsRouter);

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`🚀 NFTFlow Agent Service running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

