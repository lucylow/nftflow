import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { detectOpportunities } from "./detector";
import { proposeOpportunity } from "./proposer";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const RPC = process.env.SOMNIA_RPC || "http://localhost:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("ERROR: PRIVATE_KEY environment variable is not set");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const routerAddress = process.env.ARBITRAGE_ROUTER || "";

console.log("Agent initialized with address:", signer.address);
console.log("Arbitrage Router:", routerAddress);

app.get("/health", (req, res) => {
  res.json({ status: "ok", address: signer.address });
});

app.get("/opportunities", async (req, res) => {
  try {
    const ops = await detectOpportunities(provider);
    res.json(ops);
  } catch (err) {
    console.error("Error detecting opportunities:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/propose", async (req, res) => {
  try {
    const opp = req.body as any;
    
    if (!opp || !opp.nftContract || !opp.tokenId) {
      return res.status(400).json({ error: "Invalid opportunity data" });
    }
    
    const env = process.env;
    const receipt = await proposeOpportunity(provider, signer, routerAddress, opp, env);
    res.json({ ok: true, receipt });
  } catch (err: any) {
    console.error("Error proposing opportunity:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 4011;
app.listen(PORT, () => {
  console.log(`Arbitrage agent running on http://localhost:${PORT}`);
});
