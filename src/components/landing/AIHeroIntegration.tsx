import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, TrendingUp, Shield } from 'lucide-react';

export const AIHeroIntegration: React.FC = () => {
  const aiFeatures = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      text: "AI-Optimized Pricing",
      metric: "+23% revenue"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      text: "Smart Recommendations",
      metric: "96% accuracy"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Auto Arbitrage",
      metric: "0.0034 STT avg profit"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Risk Protection",
      metric: "97% success rate"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="mt-12"
    >
      {/* AI Agents Badge */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-400 text-sm font-semibold">
            🤖 AI Agents Active
          </span>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {aiFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 text-center hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
            </div>
            <div className="text-white font-semibold text-sm mb-1">
              {feature.text}
            </div>
            <div className="text-cyan-400 text-xs font-medium">
              {feature.metric}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>2.4K Active AI Agents</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span>15.7K AI Decisions Today</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

