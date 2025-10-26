import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RentalIntelligenceAgent } from '@/agents/RentalIntelligenceAgent';
import { PricingAnalyst } from '@/agents/PricingAnalyst';

interface NFTMarketplaceEnhancedProps {
  userNFTs: any[];
  activeRentals: any[];
  aiRecommendations: any[];
  rentalAgent: RentalIntelligenceAgent | null;
  pricingAgent: PricingAnalyst | null;
  onRefresh: () => void;
}

export const NFTMarketplaceEnhanced: React.FC<NFTMarketplaceEnhancedProps> = ({
  userNFTs,
  activeRentals,
  aiRecommendations,
  rentalAgent,
  pricingAgent,
  onRefresh
}) => {
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Mock marketplace data
  const marketplaceNFTs = [
    {
      id: 1,
      contract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b60',
      tokenId: 101,
      name: 'Epic Gaming Sword',
      image: '/api/placeholder/400/400',
      pricePerSecond: '0.0000015',
      owner: '0x789...012',
      category: 'gaming',
      rarity: 'legendary',
      estimatedValue: '2.5',
      rentalCount: 15
    },
    {
      id: 2,
      contract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b60',
      tokenId: 102,
      name: 'Digital Art Masterpiece',
      image: '/api/placeholder/400/400',
      pricePerSecond: '0.000003',
      owner: '0x345...678',
      category: 'art',
      rarity: 'epic',
      estimatedValue: '5.0',
      rentalCount: 8
    },
    {
      id: 3,
      contract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b60',
      tokenId: 103,
      name: 'Metaverse Land Parcel',
      image: '/api/placeholder/400/400',
      pricePerSecond: '0.000002',
      owner: '0x901...234',
      category: 'metaverse',
      rarity: 'rare',
      estimatedValue: '3.2',
      rentalCount: 12
    }
  ];

  const handleAIAnalysis = async (nft: any) => {
    if (!rentalAgent || !pricingAgent) return;
    
    setLoadingAnalysis(true);
    setSelectedNFT(nft);
    
    try {
      const pricingAnalysis = await pricingAgent.analyzePricing(nft.contract, nft.tokenId);
      const strategy = await rentalAgent.generateRentalStrategy(nft.contract, nft.tokenId);
      
      setAiAnalysis({
        ...pricingAnalysis,
        ...strategy
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleRentNFT = async (nft: any, duration: number) => {
    console.log('Renting NFT:', nft, 'for', duration, 'seconds');
  };

  return (
    <div className="space-y-8">
      {/* AI Recommendations Section */}
      {aiRecommendations.length > 0 && (
        <section className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">✨</span>
              AI-Powered Recommendations For You
            </h2>
            <button 
              onClick={onRefresh}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiRecommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={rec.tokenId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 transition-all group cursor-pointer"
                onClick={() => handleAIAnalysis(rec)}
              >
                <div className="relative">
                  <img 
                    src={rec.metadata?.image || '/api/placeholder/400/400'} 
                    alt={rec.metadata?.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-cyan-500/90 text-white px-2 py-1 rounded text-sm font-semibold">
                    {rec.score}/10 Match
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-white mb-2">{rec.metadata?.name || `NFT #${rec.tokenId}`}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{rec.reason}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-cyan-400 font-semibold">
                      {rec.pricePerSecond || '0.000001'} STT/sec
                    </div>
                    <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm transition-colors">
                      Rent Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Marketplace Grid */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">🛍️</span>
          Available NFT Rentals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {marketplaceNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/30 transition-all group"
            >
              <div 
                className="relative cursor-pointer"
                onClick={() => handleAIAnalysis(nft)}
              >
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-900/80 text-cyan-400 px-2 py-1 rounded text-xs font-semibold">
                      {nft.rarity}
                    </span>
                    <span className="bg-slate-900/80 text-white px-2 py-1 rounded text-xs">
                      {nft.rentalCount} rents
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-white">{nft.name}</h3>
                  <button 
                    onClick={() => handleAIAnalysis(nft)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Get AI Analysis"
                  >
                    🤖
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-white capitalize">{nft.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Value:</span>
                    <span className="text-white">{nft.estimatedValue} STT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Price:</span>
                    <span className="text-cyan-400 font-semibold">{nft.pricePerSecond} STT/sec</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRentNFT(nft, 3600)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 py-2 rounded-lg font-semibold transition-colors text-center"
                  >
                    1 Hour
                  </button>
                  <button 
                    onClick={() => handleRentNFT(nft, 86400)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition-colors text-center"
                  >
                    1 Day
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Analysis Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">AI Rental Analysis</h3>
                <button 
                  onClick={() => setSelectedNFT(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NFT Info */}
                <div>
                  <img 
                    src={selectedNFT.image} 
                    alt={selectedNFT.name}
                    className="w-full rounded-lg mb-4"
                  />
                  <h4 className="text-xl font-bold text-white mb-2">{selectedNFT.name}</h4>
                  <p className="text-slate-400 mb-4">Current Price: {selectedNFT.pricePerSecond} STT/sec</p>
                </div>
                
                {/* AI Analysis */}
                <div>
                  {loadingAnalysis ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4" />
                        <p className="text-slate-400">AI Agent is analyzing market data...</p>
                      </div>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/30">
                        <div className="text-sm text-slate-400 mb-1">AI Suggested Price</div>
                        <div className="text-2xl font-bold text-green-400">
                          {aiAnalysis.optimalPrice?.toFixed(6) || aiAnalysis.suggestedPrice?.toFixed(6) || '0.000000'} STT/sec
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          Confidence: <span className="text-cyan-400">{aiAnalysis.confidence || aiAnalysis.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <div className="text-xs text-slate-400">Optimal Duration</div>
                          <div className="text-lg font-semibold text-purple-400">
                            {(aiAnalysis.optimalDuration / 3600 || 1).toFixed(1)} hours
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <div className="text-xs text-slate-400">Market Trend</div>
                          <div className="text-lg font-semibold text-orange-400 capitalize">
                            {aiAnalysis.trend || 'stable'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-2">AI Reasoning:</div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {aiAnalysis.reasoning || aiAnalysis.explanation || 'No reasoning provided.'}
                        </p>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 py-3 rounded-lg font-semibold transition-all">
                        Apply AI Recommendation
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      Failed to load AI analysis
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

