import React from 'react';
import { motion } from 'framer-motion';

interface UserProfileAIProps {
  userNFTs: any[];
  activeRentals: any[];
  address: string;
}

export const UserProfileAI: React.FC<UserProfileAIProps> = ({
  userNFTs,
  activeRentals,
  address
}) => {
  const userStats = {
    totalNFTs: userNFTs.length,
    listedNFTs: userNFTs.filter(nft => nft.isListed).length,
    activeRentals: activeRentals.length,
    totalEarnings: '4.2',
    reputation: 850
  };

  return (
    <div className="space-y-8">
      {/* User Overview */}
      <section className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            U
          </div>
          
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-white mb-2">User Profile</h2>
            <p className="text-slate-300 mb-1">{address}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-cyan-400">Reputation: {userStats.reputation}/1000</span>
              <span className="text-green-400">Verified User</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">{userStats.totalEarnings} STT</div>
            <div className="text-slate-400">Total Earnings</div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total NFTs', value: userStats.totalNFTs, icon: '🖼️' },
          { label: 'Listed for Rent', value: userStats.listedNFTs, icon: '💰' },
          { label: 'Active Rentals', value: userStats.activeRentals, icon: '⏰' },
          { label: 'Success Rate', value: '96%', icon: '📈' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* User's NFTs */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">🎮</span>
          Your NFT Collection
        </h3>
        
        {userNFTs.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-2xl">
            <div className="text-6xl mb-4">🖼️</div>
            <h4 className="text-xl font-bold text-white mb-2">No NFTs Yet</h4>
            <p className="text-slate-400 mb-6">Start by minting or acquiring NFTs to rent out</p>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Mint First NFT
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/30 transition-all"
              >
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-white">{nft.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      nft.isListed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {nft.isListed ? 'Listed' : 'Unlisted'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Price:</span>
                      <span className="text-cyan-400">{nft.pricePerSecond} STT/sec</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white capitalize">{nft.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {nft.isListed ? (
                      <button className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg font-semibold transition-colors">
                        Unlist
                      </button>
                    ) : (
                      <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 py-2 rounded-lg font-semibold transition-colors">
                        List for Rent
                      </button>
                    )}
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition-colors">
                      AI Analyze
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* AI Performance Insights */}
      <section className="bg-slate-800/30 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          AI Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700/20 rounded-xl p-4">
            <h4 className="font-bold text-white mb-3">Rental Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Avg. Rental Duration</span>
                <span className="text-white">6.2 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Success Rate</span>
                <span className="text-green-400">96%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI-Optimized Revenue</span>
                <span className="text-cyan-400">+23%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700/20 rounded-xl p-4">
            <h4 className="font-bold text-white mb-3">Market Insights</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Your Category Performance</span>
                <span className="text-green-400">Top 15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suggested Price Adjustments</span>
                <span className="text-orange-400">+3 items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Recommendations Used</span>
                <span className="text-purple-400">12 times</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

