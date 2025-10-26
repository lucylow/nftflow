import express, { Request, Response } from "express";
import { getController } from "../tools/blockchain";

export const proposalsRouter = express.Router();

/**
 * POST /api/agent/propose-price
 * Propose a price change for an NFT listing
 * body: { listingId, newPrice, reasonCID? }
 */
proposalsRouter.post("/propose-price", async (req: Request, res: Response) => {
  try {
    const { listingId, newPrice, reasonCID } = req.body;
    
    if (!listingId || !newPrice) {
      return res.status(400).json({ error: "listingId and newPrice required" });
    }

    console.log(`💡 Proposing price change for listing ${listingId}`);
    const controller = getController();
    
    const tx = await controller.agentProposePrice(
      listingId, 
      newPrice, 
      reasonCID || `ipfs://reason-${Date.now()}`
    );
    
    const receipt = await tx.wait();
    
    console.log(`✅ Price proposal submitted: ${receipt.hash}`);
    
    res.json({ 
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: true
    });
  } catch (err: any) {
    console.error("Propose price error:", err);
    res.status(500).json({ error: err.message || "internal error" });
  }
});

/**
 * POST /api/agent/recommend
 * Emit an AI recommendation (no execution)
 * body: { listingId, score, reasoning }
 */
proposalsRouter.post("/recommend", async (req: Request, res: Response) => {
  try {
    const { listingId, score, reasoning } = req.body;
    
    if (!listingId || score === undefined || !reasoning) {
      return res.status(400).json({ error: "listingId, score, and reasoning required" });
    }

    console.log(`🤖 Emitting recommendation for listing ${listingId}`);
    const controller = getController();
    
    const tx = await controller.agentRecommend(listingId, score, reasoning);
    const receipt = await tx.wait();
    
    res.json({ 
      txHash: receipt.hash,
      success: true
    });
  } catch (err: any) {
    console.error("Recommend error:", err);
    res.status(500).json({ error: err.message || "internal error" });
  }
});

/**
 * POST /api/agent/exec-forward
 * Execute a direct agent action (use with caution)
 * body: { encodedCall, reasonCID }
 */
proposalsRouter.post("/exec-forward", async (req: Request, res: Response) => {
  try {
    const { encodedCall, reasonCID } = req.body;
    
    if (!encodedCall) {
      return res.status(400).json({ error: "encodedCall required" });
    }

    console.log(`⚡ Executing agent action`);
    const controller = getController();
    
    const tx = await controller.agentExecute(encodedCall, reasonCID || "");
    const receipt = await tx.wait();
    
    res.json({ 
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: true
    });
  } catch (err: any) {
    console.error("Execute error:", err);
    res.status(500).json({ error: err.message || "internal error" });
  }
});

