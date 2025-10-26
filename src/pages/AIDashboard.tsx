import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { AIAgentDashboard } from '@/components/agents/AIAgentDashboardEnhanced';
import { NFTMarketplaceEnhanced } from '@/components/marketplace/NFTMarketplaceEnhanced';
import { UserProfileAI } from '@/components/profile/UserProfileAI';
import { RentalIntelligenceAgent } from '@/agents/RentalIntelligenceAgent';
import { RecommendationAgent } from '@/agents/RecommendationAgent';
import { PricingAnalyst } from '@/agents/PricingAnalyst';
import { CollateralAgent } from '@/agents/CollateralAgent';

// Contract ABIs (simplified)
const NFT_FLOW_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 pricePerSecond, uint256 minDuration, uint256 maxDuration, uint256 collateral) external",
  "function rentNFT(address nftContract, uint256 tokenId, uint256 duration) external payable",
  "function getActiveRentals(address user) external view returns (tuple[])",
  "event RentalCreated(address indexed nftContract, uint256 indexed tokenId, address indexed renter, uint256 pricePerSecond, uint256 duration)"
];

const REPUTATION_ABI = [
  "function getReputation(address user) external view returns (uint256 score)",
  "function totalRentals(address user) view returns (uint256)",
  "function successfulRentals(address user) view returns (uint256)",
];

export default function AIDashboard() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [activeTab, setActiveTab] = useState<'marketplace' | 'ai-agents' | 'profile'>('marketplace');
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [activeRentals, setActiveRentals] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize AI Agents
  const [rentalAgent, setRentalAgent] = useState<RentalIntelligenceAgent | null>(null);
  const [recommendationAgent, setRecommendationAgent] = useState<RecommendationAgent | null>(null);
  const [pricingAgent, setPricingAgent] = useState<PricingAnalyst | null>(null);
  const [collateralAgent, setCollateralAgent] = useState<CollateralAgent | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (isConnected && address && walletClient) {
      initializeAIAgents();
      loadUserData();
    }
  }, [isConnected, address, walletClient]);

  const initializeAIAgents = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found');
      return;
    }

    try {
      // Create provider from wallet client
      const browserProvider = new ethers.BrowserProvider(walletClient as any);
      setProvider(browserProvider);

      // Initialize Rental Intelligence Agent
      const rentalIntelligenceAgent = new RentalIntelligenceAgent(
        apiKey,
        browserProvider,
        import.meta.env.VITE_NFT_FLOW_CONTRACT || null,
        NFT_FLOW_ABI
      );

      // Initialize Recommendation Agent
      const recommendationAgentInstance = new RecommendationAgent(
        apiKey,
        browserProvider
      );

      // Initialize Pricing Analyst
      const pricingAnalyst = new PricingAnalyst(
        apiKey,
        browserProvider,
        import.meta.env.VITE_NFT_FLOW_CONTRACT || null,
        NFT_FLOW_ABI
      );

      // Initialize Collateral Agent
      const collateralAgentInstance = new CollateralAgent(
        apiKey,
        browserProvider,
        import.meta.env.VITE_REPUTATION_CONTRACT || null
      );

      setRentalAgent(rentalIntelligenceAgent);
      setRecommendationAgent(recommendationAgentInstance);
      setPricingAgent(pricingAnalyst);
      setCollateralAgent(collateralAgentInstance);

      // Get AI recommendations
      const recommendations = await recommendationAgentInstance.generateRecommendations(address, 5);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to initialize AI agents:', error);
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual contract calls
      const mockNFTs = [
        {
          id: 1,
          contract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b60',
          tokenId: 123,
          name: 'Legendary Game Sword',
          image: '/api/placeholder/300/300',
          pricePerSecond: '0.000001',
          isListed: true,
          category: 'gaming'
        },
        {
          id: 2,
          contract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b60',
          tokenId: 124,
          name: 'Rare Art Piece',
          image: '/api/placeholder/300/300',
          pricePerSecond: '0.000002',
          isListed: false,
          category: 'art'
        }
      ];

      setUserNFTs(mockNFTs);
      
      const mockRentals = [
        {
          id: 1,
          nft: mockNFTs[0],
          renter: '0x123...456',
          startTime: Date.now() - 3600000,
          endTime: Date.now() + 3600000,
          totalPaid: '0.0036'
        }
      ];

      setActiveRentals(mockRentals);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🤖 NFTFlow AI</h1>
          <p className="text-slate-300 mb-8">Please connect your wallet to access AI-powered NFT rentals</p>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h1 className="text-2xl font-bold text-white">NFTFlow AI</h1>
                <p className="text-slate-400 text-sm">Powered by Somnia Network</p>
              </div>
            </div>
            
            <nav className="flex gap-1 bg-slate-800/50 rounded-xl p-1">
              {[
                { id: 'marketplace', label: '🛍️ Marketplace', icon: '🛍️' },
                { id: 'ai-agents', label: '🤖 AI Agents', icon: '🤖' },
                { id: 'profile', label: '👤 Profile', icon: '👤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xl">{tab.icon}</span>
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white font-medium">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                <div className="text-slate-400 text-sm">Connected</div>
              </div>
              <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <NFTMarketplaceEnhanced 
                userNFTs={userNFTs}
                activeRentals={activeRentals}
                aiRecommendations={aiRecommendations}
                rentalAgent={rentalAgent}
                pricingAgent={pricingAgent}
                onRefresh={loadUserData}
              />
            </motion.div>
          )}

          {activeTab === 'ai-agents' && (
            <motion.div
              key="ai-agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AIAgentDashboardEnhanced 
                userNFTs={userNFTs}
                rentalAgent={rentalAgent}
                recommendationAgent={recommendationAgent}
                pricingAgent={pricingAgent}
                collateralAgent={collateralAgent}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UserProfileAI 
                userNFTs={userNFTs}
                activeRentals={activeRentals}
                address={address || ''}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

