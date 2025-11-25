import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAIAgents } from '@/hooks/useAIAgents';
import { 
  Brain, DollarSign, Shield, Target, BarChart3, Sparkles,
  Activity, Zap, CheckCircle, PauseCircle, PlayCircle,
  Terminal, Code, Eye, Clock, RefreshCw, AlertTriangle,
  ArrowRight, Network, Upload, Download, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import WalletConnect from '@/components/WalletConnect';
import { mockAgentActivities, mockAgentRecommendations, mockWorkflows, mockHumanInterventions, generateMockActivity } from '@/mockData/aiAgentMocks';

interface AgentStatus {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'active' | 'paused' | 'error';
  successRate: number;
  actionsToday: number;
  impact: string;
  color: string;
  gradient: string;
  confidence?: number;
  lastAction?: string;
  requiresHuman?: boolean;
}

interface ActivityLog {
  id: string;
  agent: string;
  action: string;
  technical: string;
  time: string;
  status: 'success' | 'warning' | 'error';
  humanIntervention?: boolean;
  chain?: string[];
}

const AIAgentsPage: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const [activeTab, setActiveTab] = useState('autonomous');
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'rental-intelligence', name: 'Rental Intelligence Agent',
      description: 'Autonomous pricing optimization', icon: DollarSign,
      status: 'active', successRate: 92, actionsToday: 147, impact: '+15-25% revenue',
      color: 'yellow', gradient: 'from-yellow-500 to-orange-500',
      confidence: 87, lastAction: 'analyzing-market', requiresHuman: false
    },
    {
      id: 'recommendation', name: 'Recommendation Agent',
      description: 'Deep learning recommendation system', icon: Target,
      status: 'active', successRate: 88, actionsToday: 203, impact: '+40% engagement',
      color: 'purple', gradient: 'from-purple-500 to-pink-500',
      confidence: 82, lastAction: 'generating-feed', requiresHuman: false
    },
    {
      id: 'collateral', name: 'Collateral Management Agent',
      description: 'Risk-aware collateral calculator', icon: Shield,
      status: 'active', successRate: 95, actionsToday: 89, impact: '60% fraud reduction',
      color: 'green', gradient: 'from-green-500 to-emerald-500',
      confidence: 91, lastAction: 'assessing-risk', requiresHuman: false
    },
    {
      id: 'pricing-analyst', name: 'Pricing Analyst Agent',
      description: 'Real-time market data processor', icon: BarChart3,
      status: 'active', successRate: 85, actionsToday: 156, impact: 'Data-driven pricing',
      color: 'blue', gradient: 'from-blue-500 to-cyan-500',
      confidence: 79, lastAction: 'standby', requiresHuman: false
    },
    {
      id: 'orchestrator', name: 'Workflow Orchestrator',
      description: 'Multi-agent coordination & sequencing', icon: Sparkles,
      status: 'active', successRate: 98, actionsToday: 312, impact: 'Multi-agent coordination',
      color: 'cyan', gradient: 'from-cyan-500 to-teal-500',
      confidence: 96, lastAction: 'coordinating-workflow', requiresHuman: false
    }
  ]);

  const [activityLog, setActivityLog] = useState<ActivityLog[]>(mockAgentActivities);
  const [recommendations, setRecommendations] = useState(mockAgentRecommendations);
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [humanInterventionsData, setHumanInterventionsData] = useState(mockHumanInterventions);

  // Simulate real-time agent activity
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const mockActivity = generateMockActivity();
      const newAction: ActivityLog = {
        id: Date.now().toString(),
        agent: mockActivity.agent,
        action: mockActivity.action,
        technical: mockActivity.technical,
        time: 'Just now',
        status: mockActivity.status,
        humanIntervention: mockActivity.humanIntervention
      };
      setActivityLog(prev => [newAction, ...prev].slice(0, 25));
    }, 8000); // Every 8 seconds for more activity
    return () => clearInterval(interval);
  }, [isConnected]);

  // Simulate workflow progress
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setWorkflows(prev => prev.map(w => 
        w.status === 'processing' 
          ? { ...w, progress: Math.min(w.progress + 5, 100), duration: `${parseInt(w.duration) + 1}s` }
          : w
      ));
    }, 3000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'paused' : 'active' }
        : agent
    ));
  };

  const totalActions = agents.reduce((sum, agent) => sum + agent.actionsToday, 0);
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const avgSuccessRate = Math.round(agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length);
  const humanInterventionsCount = activityLog.filter(a => a.humanIntervention).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-8">
            {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Autonomous AI Agents
              </h1>
              <p className="text-slate-400">Technical monitoring & human-in-the-loop controls</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Trigger sample agent workflow demo
                  const demoLogs: ActivityLog[] = [
                    {
                      id: Date.now().toString(),
                      agent: 'Orchestrator',
                      action: '🚀 Demo: Multi-agent workflow triggered',
                      technical: 'runDemoWorkflow(type="priceOptimization", agents=[pricing, collateral])',
                      time: 'Just now',
                      status: 'success',
                      chain: ['Orchestrator → Pricing → Collateral']
                    },
                    {
                      id: (Date.now() + 1).toString(),
                      agent: 'Pricing Analyst',
                      action: '📊 Analyzing market trends for demo...',
                      technical: 'analyzeMarket() → confidence: 91%',
                      time: 'Just now',
                      status: 'success'
                    }
                  ];
                  setActivityLog(prev => [...demoLogs, ...prev].slice(0, 25));
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Run Demo
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Add a sample human intervention requirement
                  const hitlLog: ActivityLog = {
                    id: Date.now().toString(),
                    agent: 'Demo: Recommendation Agent',
                    action: '⚠️ DEMO: Low confidence recommendation needs review',
                    technical: 'Demo: confidence=65% (threshold: 75%) → escalateToHuman()',
                    time: 'Just now',
                    status: 'warning',
                    humanIntervention: true
                  };
                  setActivityLog(prev => [hitlLog, ...prev].slice(0, 25));
                  setHumanInterventionsData(prev => [...prev, {
                    id: Date.now().toString(),
                    agent: 'Demo Agent',
                    task: 'Sample human review',
                    reason: 'Demonstration of HITL system',
                    confidence: 65,
                    threshold: 75,
                    action: 'review_recommendations',
                    details: {
                      userAge: 'Demo user',
                      userHistory: 'Demo history',
                      recommendationCount: 5
                    },
                    timestamp: new Date()
                  }]);
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Simulate HITL
              </Button>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <Network className="w-4 h-4 mr-2" />
                Operational
              </Badge>
            </div>
          </div>
        </motion.div>

        {!isConnected ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-slate-400 mb-6">Required for autonomous agent operations</p>
              <WalletConnect />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Technical Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Agents', value: `${activeAgents}/5`, icon: Brain, color: 'cyan', subtitle: `${totalActions} ops today` },
                { label: 'Success', value: `${avgSuccessRate}%`, icon: CheckCircle, color: 'green', subtitle: 'avg across agents' },
                { label: 'HITL Pending', value: humanInterventionsCount, icon: Eye, color: 'yellow', subtitle: 'awaiting review' },
                { label: 'Confidence', value: '89%', icon: Network, color: 'purple', subtitle: 'avg confidence' },
                { label: 'Uptime', value: '99.9%', icon: Zap, color: 'blue', subtitle: '24/7 monitoring' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                          <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        </div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.subtitle}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-slate-900/50">
                <TabsTrigger value="autonomous">
                  <Network className="w-4 h-4 mr-2" />
                  Autonomous Ops
                </TabsTrigger>
                <TabsTrigger value="agents">
                  <Brain className="w-4 h-4 mr-2" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="hitl">
                  <Eye className="w-4 h-4 mr-2" />
                  Human Review
                </TabsTrigger>
                <TabsTrigger value="technical">
                  <Terminal className="w-4 h-4 mr-2" />
                  Technical Log
                </TabsTrigger>
              </TabsList>

              {/* Autonomous Operations Tab */}
              <TabsContent value="autonomous" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Real-time Activity Stream */}
                  <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-cyan-400" />
                          Real-Time Autonomous Operations
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Live
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3 pr-4">
                          <AnimatePresence>
                            {activityLog.map((log, idx) => (
                              <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border-l-4 border-cyan-500/50 hover:bg-slate-700/40 transition-all"
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <div className={`p-2 rounded-lg ${
                                    log.status === 'success' ? 'bg-green-500/10' :
                                    log.status === 'warning' ? 'bg-yellow-500/10' :
                                    'bg-red-500/10'
                                  }`}>
                                    {log.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                                     log.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                                     <AlertTriangle className="w-4 h-4 text-red-400" />}
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-white">{log.agent}</span>
                                      <Badge className={`text-xs ${
                                        log.humanIntervention ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                        'bg-green-500/20 text-green-400 border-green-500/50'
                                      }`}>
                                        {log.humanIntervention ? '⚠️ HITL Required' : '✓ Autonomous'}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2">{log.action}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <Code className="w-3 h-3" />
                                      <span className="font-mono text-slate-400">{log.technical}</span>
                                    </div>
                                    {log.chain && (
                                      <div className="mt-2 flex items-center gap-2 text-xs">
                                        <Layers className="w-3 h-3 text-cyan-400" />
                                        <span className="text-cyan-400">{log.chain.join(' ')}</span>
                                      </div>
                                    )}
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                                      <Clock className="w-3 h-3" />
                                      <span>{log.time}</span>
                                    </div>
                                  </div>
                                  {log.humanIntervention && (
                                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Review
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Agent Status Quick View */}
                  <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-400" />
                        Agent Network
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {agents.map((agent, idx) => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.gradient} bg-opacity-20`}>
                              <agent.icon className={`w-5 h-5 text-${agent.color}-400`} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{agent.name.split(' ')[0]}</div>
                              <div className="text-xs text-slate-400">Confidence: {agent.confidence}%</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${
                              agent.status === 'active' ? 'bg-green-400' : 'bg-slate-500'
                            }`} />
                            <Badge className={agent.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}>
                              {agent.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Agents Tab */}
              <TabsContent value="agents" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {agents.map((agent, idx) => {
                    const Icon = agent.icon;
                    return (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-2 border-slate-700">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.gradient} bg-opacity-20`}>
                                  <Icon className={`w-8 h-8 text-${agent.color}-400`} />
                                </div>
                                <div>
                                  <CardTitle className="text-white mb-1">{agent.name}</CardTitle>
                                  <p className="text-sm text-slate-400">{agent.description}</p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Success Rate</div>
                                <div className={`text-2xl font-bold text-${agent.color}-400`}>{agent.successRate}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Actions Today</div>
                                <div className="text-2xl font-bold text-white">{agent.actionsToday}</div>
                              </div>
                            </div>
                            <Progress value={agent.successRate} className="h-2" />
                            <div className="text-xs text-slate-400">
                              Last action: <span className="font-mono text-cyan-400">{agent.lastAction}</span>
                            </div>
                            <Button
                              onClick={() => toggleAgent(agent.id)}
                              className={`w-full ${
                                agent.status === 'active'
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : `bg-gradient-to-r ${agent.gradient} hover:opacity-90`
                              }`}
                            >
                              {agent.status === 'active' ? (
                                <>
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Pause Agent
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Activate Agent
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Human in the Loop Tab */}
              <TabsContent value="hitl" className="mt-6">
                <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-6 h-6 text-yellow-400" />
                      Pending Human Interventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {activityLog.filter(a => a.humanIntervention).map((log) => (
                          <div key={log.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <AlertTriangle className="w-6 h-6 text-yellow-400" />
                              <div>
                                <div className="font-semibold text-white">{log.agent}</div>
                                <div className="text-sm text-slate-300">{log.action}</div>
                              </div>
                            </div>
                            <div className="text-xs font-mono text-slate-400 mb-3">{log.technical}</div>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Review Details
                              </Button>
                            </div>
                          </div>
                        ))}
                        {activityLog.filter(a => a.humanIntervention).length === 0 && (
                          <div className="text-center py-12 text-slate-400">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                            <p className="text-lg font-semibold">All clear!</p>
                            <p className="text-sm">No actions require human intervention</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technical Log Tab */}
              <TabsContent value="technical" className="mt-6">
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-6 h-6 text-cyan-400" />
                      Technical Execution Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] font-mono text-xs bg-slate-950 p-4 rounded border border-slate-800">
                      {activityLog.map((log) => (
                        <div key={log.id} className="text-slate-300 mb-3">
                          <span className="text-slate-500">[{log.time}]</span>{' '}
                          <span className="text-cyan-400">[{log.agent}]</span>{' '}
                          <span className="text-purple-400">exec:</span>{' '}
                          <span className="text-green-400">{log.technical}</span>
                          {' '}
                          <span className={`${
                            log.status === 'success' ? 'text-green-400' :
                            log.status === 'warning' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            [status: {log.status}]
                          </span>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAgentsPage;
