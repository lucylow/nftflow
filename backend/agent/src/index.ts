import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { detectOpportunities } from "./detector";
import { proposeOpportunity } from "./proposer";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const RPC = process.env.SOMNIA_RPC || "http://localhost:8545";
const provider = new ethers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
const routerAddress = process.env.ARBITRAGE_ROUTER || "";

app.get("/opportunities", async (req, res) => {
  try {
    const ops = await detectOpportunities(provider);
    res.json(ops);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/propose", async (req, res) => {
  try {
    const opp = req.body as any;
    const env = process.env;
    const receipt = await proposeOpportunity(provider, signer, routerAddress, opp, env);
    res.json({ ok: true, receipt });
  } catch (err:any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 4011;
app.listen(PORT, () => {
  console.log(`Arbitrage agent running on http://localhost:${PORT}`);
});
