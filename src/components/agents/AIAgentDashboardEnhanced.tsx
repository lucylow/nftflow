import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RentalIntelligenceAgent } from '@/agents/RentalIntelligenceAgent';
import { RecommendationAgent } from '@/agents/RecommendationAgent';
import { PricingAnalyst } from '@/agents/PricingAnalyst';
import { CollateralAgent } from '@/agents/CollateralAgent';
import { Sparkles, TrendingUp, Shield, Brain, Activity, BarChart3, Zap, Target, DollarSign, Users, Clock } from 'lucide-react';

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
    pricing: { successRate: 92, actions: 147, revenue: '2.5K' },
    recommendation: { successRate: 88, actions: 203, matches: '145' },
    collateral: { successRate: 95, actions: 89, riskPrevented: '12' }
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

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pricing' | 'recommendation' | 'collateral'>('all');

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

  const agentConfigs = [
          { 
            key: 'pricing', 
      title: 'Pricing Intelligence', 
      description: 'Automatically optimizes rental prices based on market dynamics',
      icon: DollarSign,
      gradient: 'from-yellow-500/20 to-orange-500/20',
      borderGradient: 'border-yellow-500/40',
      lightColor: 'bg-yellow-500',
      bgPattern: 'bg-gradient-to-br from-yellow-900/10 to-orange-900/10'
          },
          { 
            key: 'recommendation', 
      title: 'Smart Recommendations', 
      description: 'Personalized NFT suggestions using advanced machine learning',
      icon: Target,
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderGradient: 'border-purple-500/40',
      lightColor: 'bg-purple-500',
      bgPattern: 'bg-gradient-to-br from-purple-900/10 to-pink-900/10'
          },
          { 
            key: 'collateral', 
      title: 'Risk Management', 
      description: 'Dynamic collateral adjustments with AI-powered risk assessment',
      icon: Shield,
      gradient: 'from-green-500/20 to-emerald-500/20',
      borderGradient: 'border-green-500/40',
      lightColor: 'bg-green-500',
      bgPattern: 'bg-gradient-to-br from-green-900/10 to-emerald-900/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Stats Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-blue-900/20 backdrop-blur-xl border border-cyan-500/20 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMDUgOTAgMjM2IC8gMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-sm text-slate-400">AI Agents</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">3</div>
            <div className="text-xs text-green-400 font-semibold">✓ All Operational</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm text-slate-400">Actions Today</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">439</div>
            <div className="text-xs text-green-400 font-semibold">↑ +12% from yesterday</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-sm text-slate-400">Avg Success Rate</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">92%</div>
            <div className="text-xs text-green-400 font-semibold">↑ +3% improvement</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-sm text-slate-400">Performance Score</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">94</div>
            <div className="text-xs text-green-400 font-semibold">Excellent</div>
          </motion.div>
        </div>
      </section>

      {/* Agent Control Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agentConfigs.map((agent, index) => {
          const Icon = agent.icon;
          const isActive = agentStatus[agent.key as keyof typeof agentStatus].active;
          const metrics = agentMetrics[agent.key as keyof typeof agentMetrics];
          
          return (
            <motion.div
              key={agent.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative group rounded-3xl p-6 border-2 transition-all ${
                isActive 
                  ? `bg-gradient-to-br ${agent.gradient} border-${agent.borderGradient.split('/')[0]}/50 shadow-xl shadow-${agent.lightColor}/20` 
                  : 'bg-slate-800/30 border-slate-700/50'
              } overflow-hidden`}
            >
              {/* Animated background */}
              {isActive && (
                <motion.div
                  className={`absolute inset-0 ${agent.bgPattern}`}
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      isActive 
                        ? `bg-${agent.lightColor}/20` 
                        : 'bg-slate-700'
                    } transition-all`}>
                      <Icon className={`w-8 h-8 ${
                        isActive 
                          ? `text-${agent.lightColor.split('-')[1]}-400` 
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{agent.title}</h3>
                      <p className="text-sm text-slate-400">{agent.description}</p>
                    </div>
              </div>
            </div>
            
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isActive ? 'bg-green-400' : 'bg-slate-500'
                  }`} />
                  <span className={`text-sm font-semibold ${
                    isActive ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    {isActive ? 'ACTIVE NOW' : 'INACTIVE'}
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Success Rate</span>
                      <span className="text-white font-bold">{metrics.successRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          isActive ? `bg-gradient-to-r ${agent.gradient}` : 'bg-slate-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.successRate}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Actions</span>
                    <span className="text-white font-semibold">{metrics.actions}</span>
                  </div>

                  {agent.key === 'pricing' && 'revenue' in metrics && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Revenue Impact</span>
                      <span className="text-green-400 font-bold">{metrics.revenue}</span>
                    </div>
                  )}
                  {agent.key === 'recommendation' && 'matches' in metrics && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Successful Matches</span>
                      <span className="text-purple-400 font-bold">{metrics.matches}</span>
                    </div>
                  )}
                  {agent.key === 'collateral' && 'riskPrevented' in metrics && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Risks Prevented</span>
                      <span className="text-green-400 font-bold">{metrics.riskPrevented}</span>
                    </div>
                  )}
              </div>
              
                {/* Toggle Button */}
              <button
                onClick={() => toggleAgent(agent.key)}
                disabled={agentStatus[agent.key as keyof typeof agentStatus].loading}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-500/25'
                      : `bg-gradient-to-r ${agent.gradient} hover:shadow-lg text-white`
                } ${agentStatus[agent.key as keyof typeof agentStatus].loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {agentStatus[agent.key as keyof typeof agentStatus].loading ? (
                  <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                  </div>
                  ) : isActive ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Deactivate Agent
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      Activate Agent
                    </span>
                )}
              </button>
            </div>
          </motion.div>
          );
        })}
      </section>

      {/* Real-time Agent Activity with Filter */}
      <section className="bg-gradient-to-br from-slate-800/40 via-purple-900/20 to-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 rounded-2xl">
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Real-Time Activity</h3>
              <p className="text-slate-400 text-sm">Monitor AI agent actions</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 bg-slate-900/50 rounded-xl p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'pricing', label: 'Pricing' },
              { key: 'recommendation', label: 'Recommendations' },
              { key: 'collateral', label: 'Risk Management' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedFilter === filter.key
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {activityLog
              .filter(activity => selectedFilter === 'all' || activity.type === selectedFilter)
              .map((activity, index) => {
                const iconConfigs = {
                  pricing: { icon: DollarSign, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
                  recommendation: { icon: Target, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
                  collateral: { icon: Shield, color: 'text-green-400', bgColor: 'bg-green-500/10' }
                };
                const config = iconConfigs[activity.type as keyof typeof iconConfigs];
                const Icon = config.icon;

                return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 bg-slate-800/30 backdrop-blur-sm rounded-xl hover:bg-slate-700/40 transition-all group"
                  >
                    <div className={`p-3 rounded-xl ${config.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold capitalize">{activity.type} Agent</span>
                  {activity.success && (
                          <span className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Success
                          </span>
                  )}
                </div>
                      <p className="text-slate-300 mb-2">{activity.message}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {activity.timestamp.toLocaleTimeString()} • Just now
                      </div>
              </div>
            </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </section>

      {/* Performance Insights */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'AI Decisions', 
            value: '439', 
            icon: Brain,
            change: '+12%', 
            trend: 'up',
            color: 'cyan',
            gradient: 'from-cyan-500 to-blue-500'
          },
          { 
            label: 'Revenue Impact', 
            value: '2.4K STT', 
            icon: DollarSign,
            change: '+8%', 
            trend: 'up',
            color: 'green',
            gradient: 'from-green-500 to-emerald-500'
          },
          { 
            label: 'User Satisfaction', 
            value: '94%', 
            icon: Users,
            change: '+3%', 
            trend: 'up',
            color: 'purple',
            gradient: 'from-purple-500 to-pink-500'
          },
          { 
            label: 'Gas Efficiency', 
            value: '0.8 STT', 
            icon: Zap,
            change: '+15%', 
            trend: 'up',
            color: 'yellow',
            gradient: 'from-yellow-500 to-orange-500'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${
                stat.gradient
              } backdrop-blur-sm border border-white/10 shadow-lg`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                    stat.trend === 'up' ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
            }`}>
              {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 text-sm font-medium">{stat.label}</div>
            </div>
          </motion.div>
          );
        })}
      </section>
    </div>
  );
};

