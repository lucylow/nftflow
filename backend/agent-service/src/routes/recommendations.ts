import express, { Request, Response } from "express";
import { computeRecommendations } from "../agent/matchmaker";

export const recommendationsRouter = express.Router();

/**
 * POST /api/agent/recommendations
 * Get personalized NFT rental recommendations for a user
 * body: { user: "0x..." }
 */
recommendationsRouter.post("/recommendations", async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    
    if (!user) {
      return res.status(400).json({ error: "user address required" });
    }

    console.log(`📊 Generating recommendations for user: ${user}`);
    const recs = await computeRecommendations(user);
    
    res.json({ recommendations: recs });
  } catch (err: any) {
    console.error("Recommendations error:", err);
    res.status(500).json({ error: err.message || "internal error" });
  }
});

