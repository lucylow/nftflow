import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const AIUsageExamples: React.FC = () => {
  const examples = [
    {
      title: 'Pricing Intelligence',
      description: 'AI analyzes market and sets optimal rental price',
      before: '$0.0029/s → 32h idle',
      after: '$0.0033/s → 8h idle',
      impact: '+15% revenue',
      icon: '💰'
    },
    {
      title: 'AI Art Generation',
      description: 'Describe your NFT, AI creates it in 10 seconds',
      before: 'Manual art creation (hours)',
      after: 'AI generation (< 10s)',
      impact: '10x faster creation',
      icon: '🎨'
    },
    {
      title: 'Smart Recommendations',
      description: 'AI finds perfect NFTs based on preferences',
      before: 'Browse for 30+ minutes',
      after: 'Find in 2 minutes',
      impact: '3x faster discovery',
      icon: '🎯'
    },
    {
      title: 'Risk Assessment',
      description: 'AI calculates fair collateral automatically',
      before: 'Manual risk review (hours)',
      after: 'Instant AI assessment',
      impact: '60% fraud reduction',
      icon: '🛡️'
    }
  ];

  return (
    <div className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h3 className="text-4xl font-bold text-white mb-4">
          Real AI Impact
        </h3>
        <p className="text-lg text-slate-300">
          See how AI transforms NFT operations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examples.map((example, idx) => (
          <motion.div
            key={example.title}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{example.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{example.title}</h4>
                      <p className="text-sm text-slate-400">{example.description}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Before AI</p>
                    <p className="text-sm font-semibold text-red-300">{example.before}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">With AI</p>
                    <p className="text-sm font-semibold text-green-300">{example.after}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {example.impact}
                  </Badge>
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

