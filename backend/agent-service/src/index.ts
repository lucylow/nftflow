import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { recommendationsRouter } from "./routes/recommendations";
import { proposalsRouter } from "./routes/proposals";
import { initializeBlockchain } from "./tools/blockchain";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize blockchain connection
initializeBlockchain();

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "nftflow-agent-service",
    version: "1.0.0"
  });
});

// Agent endpoints
app.use("/api/agent", recommendationsRouter);
app.use("/api/agent", proposalsRouter);

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`🚀 NFTFlow Agent Service running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📍 Endpoints:`);
  console.log(`   - POST http://localhost:${port}/api/agent/recommendations`);
  console.log(`   - POST http://localhost:${port}/api/agent/propose-price`);
});

