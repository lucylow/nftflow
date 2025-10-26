import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAIAgents } from '@/hooks/useAIAgents';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Recommendation {
  nftContract: string;
  tokenId: string;
  score: number;
  reason: string;
  metadata?: any;
}

interface AgentActivity {
  type: 'analysis' | 'recommendation' | 'pricing';
  message: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

export const AIAgentDashboard: React.FC = () => {
  const { account } = useWeb3();
  const { isInitialized, getPersonalizedRecommendations } = useAIAgents();
  
  const [agentStatus, setAgentStatus] = useState<'active' | 'inactive'>('inactive');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activityLog, setActivityLog] = useState<AgentActivity[]>([]);
  const [totalActions, setTotalActions] = useState(0);
  const [successRate, setSuccessRate] = useState(100);

  useEffect(() => {
    if (account && agentStatus === 'active' && isInitialized) {
      initializeAIAgents();
    }
  }, [account, agentStatus, isInitialized]);

  const initializeAIAgents = async () => {
    setLoading(true);
    try {
      // Get personalized recommendations
      const recs = await getPersonalizedRecommendations(5);
      setRecommendations(recs);
      
      // Log activity
      addActivity('recommendation', 'Generated personalized NFT recommendations', 'success');
      
    } catch (error) {
      console.error('AI Agent initialization failed:', error);
      addActivity('recommendation', 'Failed to generate recommendations', 'failed');
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (type: AgentActivity['type'], message: string, status: AgentActivity['status']) => {
    const activity: AgentActivity = {
      type,
      message,
      timestamp: new Date(),
      status
    };
    setActivityLog(prev => [activity, ...prev].slice(0, 10));
    if (status === 'success') {
      setTotalActions(prev => prev + 1);
      setSuccessRate(Math.min(100, (totalActions + 1) / (totalActions + 1) * 100));
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 rounded-2xl p-8">
      {/* AI Agent Control Panel */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Brain className="w-8 h-8 text-cyan-400" />
            AI Agent Dashboard
          </h2>
          <p className="text-slate-300">Autonomous intelligence for smarter NFT rentals on Somnia</p>
      </div>

        <Button
          onClick={() => setAgentStatus(agentStatus === 'active' ? 'inactive' : 'active')}
          className={`${
            agentStatus === 'active'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
          disabled={!isInitialized}
        >
          {agentStatus === 'active' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Agent Active
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 mr-2" />
              Activate Agent
            </>
          )}
        </Button>
      </div>

      {!isInitialized && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <CardContent className="pt-6">
            <p className="text-yellow-200">
              ⚠️ OpenAI API key not configured. AI agents require an API key to function.
              Set VITE_OPENAI_API_KEY in your environment variables.
            </p>
          </CardContent>
        </Card>
      )}

      {agentStatus === 'active' && isInitialized && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>AI-powered NFT rental suggestions tailored for you</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">No recommendations available yet</p>
                    ) : (
                      recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                            #{idx + 1}
                          </div>
                          <div className="flex-grow">
                            <div className="font-semibold mb-1">
                              {rec.metadata?.name || `NFT #${rec.tokenId}`}
                            </div>
                            <div className="text-sm text-slate-400 mb-1">{rec.reason}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-cyan-400/50 text-cyan-400">
                                Match: {rec.score}/10
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Agent Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Agent Performance
                </CardTitle>
                <CardDescription>Real-time metrics from autonomous AI agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Actions</span>
                    <span className="font-semibold">{totalActions}</span>
                  </div>
                  <Progress value={Math.min(totalActions * 10, 100)} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Success Rate</span>
                    <span className="font-semibold">{successRate}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">3</div>
                    <div className="text-xs text-slate-400 mt-1">Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">24/7</div>
                    <div className="text-xs text-slate-400 mt-1">Monitoring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">100%</div>
                    <div className="text-xs text-slate-400 mt-1">Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Real-time Agent Activity Log */}
      {agentStatus === 'active' && isInitialized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Real-Time Agent Activity
              </CardTitle>
              <CardDescription>Live monitoring of AI agent operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityLog.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No activity yet</p>
                ) : (
                  activityLog.map((activity, idx) => (
                    <AgentActivityItem key={idx} activity={activity} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Agent Types Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-8 h-8 text-cyan-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Pricing Intelligence</h3>
                <p className="text-sm text-slate-300">
                  Autonomous market analysis and dynamic pricing recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Smart Recommendations</h3>
                <p className="text-sm text-slate-300">
                  Personalized NFT suggestions based on your rental history
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Risk Assessment</h3>
                <p className="text-sm text-slate-300">
                  AI-powered collateral analysis for secure rentals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
  );
};

const AgentActivityItem: React.FC<{ activity: AgentActivity }> = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'analysis':
        return '🔍';
      case 'recommendation':
        return '✨';
      case 'pricing':
        return '💰';
      default:
        return '📊';
    }
  };

  const getStatusColor = () => {
    switch (activity.status) {
      case 'success':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
      <div className="text-2xl">{getActivityIcon()}</div>
      <div className="flex-grow">
        <div className="text-sm">{activity.message}</div>
        <div className="text-xs text-slate-500">
          {activity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
      <div className={getStatusColor()}>
        {activity.status === 'success' ? '✓' : activity.status === 'pending' ? '...' : '✗'}
          </div>
    </div>
  );
};
