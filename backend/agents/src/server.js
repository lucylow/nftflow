/**
 * NFTFlow AI Agent Server
 * Express server for AI agents
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Dynamic imports for ESM
const { RentalMatchmakerAgent } = await import('./agents/RentalMatchmaker.js');
const { PricingAnalystAgent } = await import('./agents/PricingAnalyst.js');
const { initializeDatabase } = await import('./services/database.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize agents
const agents = {
  rentalMatchmaker: new RentalMatchmakerAgent({
    openaiApiKey: process.env.OPENAI_API_KEY,
    subgraphUrl: process.env.SUBGRAPH_URL || 'http://localhost:8000/subgraphs/name/nftflow',
    vectorDbUrl: process.env.VECTOR_DB_URL,
  }),
  pricingAnalyst: new PricingAnalystAgent({
    openaiApiKey: process.env.OPENAI_API_KEY,
    somniaRpc: process.env.SOMNIA_RPC_URL,
  }),
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', agents: Object.keys(agents) });
});

/**
 * GET /api/agents/recommendations
 * Generate personalized NFT rental recommendations
 */
app.post('/api/agents/recommendations', async (req, res) => {
  try {
    const { user, context } = req.body;
    
    if (!user) {
      return res.status(400).json({ error: 'User address required' });
    }

    const recommendations = await agents.rentalMatchmaker.generateRecommendations(
      user,
      context || {}
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents/pricing
 * Get pricing analysis for an NFT
 */
app.post('/api/agents/pricing', async (req, res) => {
  try {
    const { nftContract, tokenId } = req.body;

    if (!nftContract || !tokenId) {
      return res.status(400).json({ error: 'NFT contract and tokenId required' });
    }

    const analysis = await agents.pricingAnalyst.analyzePricing(nftContract, tokenId);

    res.json(analysis);
  } catch (error) {
    console.error('Pricing analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents/embeddings
 * Generate embeddings for NFT metadata (for vector search)
 */
app.post('/api/agents/embeddings', async (req, res) => {
  try {
    const { metadata } = req.body;

    const embedding = await agents.rentalMatchmaker.generateEmbedding(metadata);

    res.json({ embedding });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🤖 AI Agent Server running on port ${PORT}`);
  console.log(`📊 Available agents: ${Object.keys(agents).join(', ')}`);
  
  // Initialize database
  await initializeDatabase();
  console.log('✅ Database initialized');
});

export { app, agents };

