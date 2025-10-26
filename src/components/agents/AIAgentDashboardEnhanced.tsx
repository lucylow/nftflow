import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RentalIntelligenceAgent } from '@/agents/RentalIntelligenceAgent';
import { RecommendationAgent } from '@/agents/RecommendationAgent';
import { PricingAnalyst } from '@/agents/PricingAnalyst';
import { CollateralAgent } from '@/agents/CollateralAgent';

interface AIAgentDashboardEnhancedProps {
  userNFTs: any[];
  rentalAgent: RentalIntelligenceAgent | null;
  recommendationAgent: RecommendationAgent | null;
  pricingAgent: PricingAnalyst | null;
  collateralAgent: CollateralAgent | null;
}

export const AIAgentDashboardEnhanced: React.FC<AIAgentDashboardEnhancedProps> = ({
  userNFTs,
  rentalAgent,
  recommendationAgent,
  pricingAgent,
  collateralAgent
}) => {
  const [agentStatus, setAgentStatus] = useState({
    pricing: { active: false, loading: false },
    recommendation: { active: true, loading: false },
    collateral: { active: false, loading: false }
  });
  
  const [agentMetrics, setAgentMetrics] = useState({
    pricing: { successRate: 92, actions: 147 },
    recommendation: { successRate: 88, actions: 203 },
    collateral: { successRate: 95, actions: 89 }
  });
  
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      type: 'pricing',
      message: 'AI adjusted rental price for Epic Gaming Sword +15%',
      timestamp: new Date(Date.now() - 300000),
      success: true
    },
    {
      id: 2,
      type: 'recommendation',
      message: 'Generated personalized recommendations for user',
      timestamp: new Date(Date.now() - 600000),
      success: true
    },
    {
      id: 3,
      type: 'collateral',
      message: 'Reduced collateral requirements for trusted user',
      timestamp: new Date(Date.now() - 900000),
      success: true
    }
  ]);

  const toggleAgent = async (agentType: string) => {
    setAgentStatus(prev => ({
      ...prev,
      [agentType]: { ...prev[agentType as keyof typeof prev], loading: true }
    }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAgentStatus(prev => ({
      ...prev,
      [agentType]: { 
        ...prev[agentType as keyof typeof prev], 
        active: !prev[agentType as keyof typeof prev].active,
        loading: false 
      }
    }));

    // Add to activity log
    const newActivity = {
      id: activityLog.length + 1,
      type: agentType,
      message: `${agentType} agent ${!agentStatus[agentType as keyof typeof agentStatus].active ? 'activated' : 'deactivated'}`,
      timestamp: new Date(),
      success: true
    };
    
    setActivityLog(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const getAgentStatusColor = (agentType: string) => {
    const isActive = agentStatus[agentType as keyof typeof agentStatus].active;
    return isActive ? 'text-green-400' : 'text-slate-400';
  };

  const getAgentStatusBg = (agentType: string) => {
    const isActive = agentStatus[agentType as keyof typeof agentStatus].active;
    return isActive ? 'bg-green-500/20 border-green-500/40' : 'bg-slate-800/50 border-slate-700/50';
  };

  return (
    <div className="space-y-8">
      {/* Agent Control Panel */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            key: 'pricing', 
            title: '💰 Pricing Intelligence', 
            description: 'Automatically adjusts rental prices based on market demand and trends',
            icon: '💰'
          },
          { 
            key: 'recommendation', 
            title: '🎯 Smart Recommendations', 
            description: 'Personalized NFT suggestions based on user behavior and preferences',
            icon: '🎯'
          },
          { 
            key: 'collateral', 
            title: '🛡️ Risk Management', 
            description: 'Dynamic collateral adjustments using AI-powered risk assessment',
            icon: '🛡️'
          }
        ].map((agent) => (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border-2 transition-all ${getAgentStatusBg(agent.key)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{agent.icon}</div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                agentStatus[agent.key as keyof typeof agentStatus].active 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {agentStatus[agent.key as keyof typeof agentStatus].active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{agent.title}</h3>
            <p className="text-slate-400 text-sm mb-6">{agent.description}</p>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Success Rate</span>
                <span className="text-green-400 font-semibold">
                  {agentMetrics[agent.key as keyof typeof agentMetrics].successRate}%
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Actions</span>
                <span className="text-white font-semibold">
                  {agentMetrics[agent.key as keyof typeof agentMetrics].actions}
                </span>
              </div>
              
              <button
                onClick={() => toggleAgent(agent.key)}
                disabled={agentStatus[agent.key as keyof typeof agentStatus].loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  agentStatus[agent.key as keyof typeof agentStatus].active
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                } ${agentStatus[agent.key as keyof typeof agentStatus].loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {agentStatus[agent.key as keyof typeof agentStatus].loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : agentStatus[agent.key as keyof typeof agentStatus].active ? (
                  'Deactivate Agent'
                ) : (
                  'Activate Agent'
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Real-time Agent Activity */}
      <section className="bg-slate-800/30 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">📊</span>
          Real-Time Agent Activity
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activityLog.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors"
            >
              <div className={`text-2xl ${
                activity.type === 'pricing' ? 'text-yellow-400' :
                activity.type === 'recommendation' ? 'text-purple-400' :
                'text-green-400'
              }`}>
                {activity.type === 'pricing' ? '💰' :
                 activity.type === 'recommendation' ? '🎯' : '🛡️'}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium capitalize">{activity.type} Agent</span>
                  {activity.success && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Success</span>
                  )}
                </div>
                <p className="text-slate-300 text-sm">{activity.message}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Agent Statistics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'AI Decisions', value: '439', change: '+12%', trend: 'up' },
          { label: 'Revenue Generated', value: '2.4K STT', change: '+8%', trend: 'up' },
          { label: 'User Satisfaction', value: '94%', change: '+3%', trend: 'up' },
          { label: 'Gas Saved', value: '0.8 STT', change: '+15%', trend: 'up' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-slate-400 text-sm mb-2">{stat.label}</div>
            <div className={`text-xs font-semibold ${
              stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {stat.change}
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

