import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Wand2, Target, Shield, BarChart3, Sparkles, Zap, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AIHeroSection: React.FC = () => {
  const agents = [
    {
      icon: Target,
      name: 'Rental Intelligence Agent',
      role: 'Pricing Optimization',
      impact: '+15-25% revenue',
      color: 'from-yellow-500 to-orange-500',
      description: 'Autonomous pricing optimization for maximum revenue through real-time market analysis'
    },
    {
      icon: Brain,
      name: 'Recommendation Agent',
      role: 'Personalized Discovery',
      impact: '+40% engagement',
      color: 'from-purple-500 to-pink-500',
      description: 'AI-powered recommendations based on user behavior and preferences'
    },
    {
      icon: Shield,
      name: 'Collateral Agent',
      role: 'Risk Assessment',
      impact: '60% fraud reduction',
      color: 'from-green-500 to-emerald-500',
      description: 'Dynamic risk assessment and collateral management using on-chain reputation'
    },
    {
      icon: BarChart3,
      name: 'Pricing Analyst',
      role: 'Market Intelligence',
      impact: 'Data-driven pricing',
      color: 'from-blue-500 to-cyan-500',
      description: 'Advanced market analysis with predictive pricing from DIA Oracle'
    },
    {
      icon: Sparkles,
      name: 'Orchestrator',
      role: 'Multi-Agent Coordination',
      impact: 'Seamless workflows',
      color: 'from-cyan-500 to-teal-500',
      description: 'Coordinates all agents for optimal marketplace operations 24/7'
    }
  ];

  return (
    <div className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-6 px-6 py-2">
          🤖 Autonomous AI Agents
        </Badge>
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            5 AI Agents Working For You
          </span>
        </h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
          Revolutionary autonomous agents powered by GPT-4, Claude, and Gemini. Working 24/7 to optimize your NFT marketplace.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Link to="/ai-agents">
              <PlayCircle className="w-5 h-5 mr-2" />
              Explore AI Agents
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/creativity">
              <Wand2 className="w-5 h-5 mr-2" />
              Try AI Generation
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all h-full">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} bg-opacity-20 flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 text-${agent.color.split('-')[1]}-400`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{agent.name.split(' ')[0]}</h3>
                    <p className="text-sm text-slate-400 mb-2">{agent.role}</p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${agent.color} text-white w-full justify-center`}>
                    <Zap className="w-3 h-3 mr-1" />
                    {agent.impact}
                  </Badge>
                  <p className="text-xs text-slate-500 line-clamp-2">{agent.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { label: 'AI Decisions', value: '1,203', icon: Brain, desc: 'Made today' },
                { label: 'Revenue Impact', value: '+15.2%', icon: Target, desc: 'Average increase' },
                { label: 'Active Agents', value: '5/5', icon: Sparkles, desc: 'All operational' },
                { label: 'Success Rate', value: '94%', icon: Shield, desc: 'Across all agents' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <stat.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-slate-300 mb-1">{stat.label}</div>
                  <div className="text-sm text-slate-500">{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AIHeroSection;

