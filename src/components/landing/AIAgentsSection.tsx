import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Zap, Brain, TrendingUp, Shield, Rocket } from 'lucide-react';

export const AIAgentsSection: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string>('pricing');
  const [agentsActive, setAgentsActive] = useState<boolean>(true);

  const agents = {
    pricing: {
      id: 'pricing',
      name: 'AI Pricing Intelligence',
      icon: <TrendingUp className="w-8 h-8" />,
      description: 'Automatically optimizes rental prices using real-time market analysis',
      status: 'active',
      metrics: {
        successRate: '94%',
        revenueIncrease: '+23%',
        decisions: '2.4K'
      },
      features: [
        'Real-time market scanning',
        'Competitor price analysis',
        'Demand prediction',
        'Dynamic price adjustments'
      ]
    },
    recommendation: {
      id: 'recommendation',
      name: 'Smart Matchmaking',
      icon: <Brain className="w-8 h-8" />,
      description: 'Personalized NFT recommendations using collaborative filtering',
      status: 'active',
      metrics: {
        successRate: '88%',
        userSatisfaction: '96%',
        matches: '15.7K'
      },
      features: [
        'Behavioral analysis',
        'Similar user matching',
        'Trend prediction',
        'Personalized discovery'
      ]
    },
    arbitrage: {
      id: 'arbitrage',
      name: 'Rental Arbitrage',
      icon: <Zap className="w-8 h-8" />,
      description: 'Autonomous profit opportunities across NFT rental markets',
      status: 'active',
      metrics: {
        successRate: '82%',
        avgProfit: '0.0034 STT',
        opportunities: '347'
      },
      features: [
        'Cross-market analysis',
        'Risk assessment',
        'Auto-execution',
        'Profit optimization'
      ]
    },
    risk: {
      id: 'risk',
      name: 'Risk Management',
      icon: <Shield className="w-8 h-8" />,
      description: 'AI-powered collateral optimization and risk assessment',
      status: 'active',
      metrics: {
        successRate: '97%',
        lossPrevention: '89%',
        assessments: '8.2K'
      },
      features: [
        'Collateral optimization',
        'Fraud detection',
        'Risk scoring',
        'Smart limits'
      ]
    }
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
              AI-Powered Intelligence
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Autonomous AI Agents
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Meet your personal AI agents that work 24/7 to optimize your NFT rental experience. 
            From pricing to protection, they've got you covered.
          </p>

          {/* Global Agent Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
              agentsActive 
                ? 'border-cyan-500 bg-cyan-500/10' 
                : 'border-slate-700 bg-slate-800/50'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                agentsActive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className="text-white font-semibold">
                AI Agents {agentsActive ? 'Active' : 'Paused'}
              </span>
              <button
                onClick={() => setAgentsActive(!agentsActive)}
                className={`p-2 rounded-lg transition-all ${
                  agentsActive 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                }`}
              >
                {agentsActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Agent Navigation */}
          <div className="lg:col-span-1 space-y-4">
            {Object.values(agents).map((agent, index) => (
              <motion.button
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setActiveAgent(agent.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  activeAgent === agent.id
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/25'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activeAgent === agent.id 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {agent.name}
                    </h3>
                    <div className={`text-xs ${
                      activeAgent === agent.id ? 'text-cyan-400' : 'text-slate-500'
                    }`}>
                      {agent.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Agent Details */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAgent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700"
              >
                {agents[activeAgent as keyof typeof agents] && (() => {
                  const agent = agents[activeAgent as keyof typeof agents];
                  return (
                    <div className="space-y-6">
                      {/* Agent Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                            {agent.icon}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {agent.name}
                            </h3>
                            <p className="text-slate-400 mt-1">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Autonomous
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(agent.metrics).map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-slate-700/50 rounded-lg p-4 text-center"
                          >
                            <div className="text-2xl font-bold text-white mb-1">
                              {value}
                            </div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">
                          Capabilities
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {agent.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                              <span className="text-slate-300 text-sm">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Real-time Activity */}
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-slate-400 mb-3">
                          Real-time Activity
                        </h4>
                        <div className="space-y-2">
                          {[
                            'Analyzing market trends...',
                            'Updating price recommendations',
                            'Scanning for arbitrage opportunities',
                            'Optimizing user matches'
                          ].map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                              <span className="text-slate-300">{activity}</span>
                              <span className="text-slate-500 text-xs ml-auto">
                                Just now
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Deploy Your AI Agents?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already maximizing their NFT rental profits 
              with autonomous AI agents. No technical knowledge required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/ai-agents" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105">
                🚀 Activate AI Agents
              </a>
              <a href="/dashboard" className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all">
                📚 Learn More
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

