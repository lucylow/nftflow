import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { useWeb3 } from '../contexts/Web3Context-minimal';
import { useToast } from '../hooks/use-toast';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Plus,
  Vote,
  Settings,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';

interface Proposal {
  id: number;
  description: string;
  proposalType: number;
  yesVotes: number;
  noVotes: number;
  deadline: number;
  executed: boolean;
  proposer: string;
  createdAt: number;
}

interface DAOStats {
  totalProposals: number;
  activeProposals: number;
  totalVotingPower: number;
  userVotingPower: number;
  treasuryBalance: string;
  quorumPercentage: number;
  votingDuration: number;
}

const PROPOSAL_TYPES = [
  { value: 0, label: 'Fee Change', icon: DollarSign, color: 'bg-blue-500' },
  { value: 1, label: 'Collateral Update', icon: Shield, color: 'bg-green-500' },
  { value: 2, label: 'Reward Adjustment', icon: TrendingUp, color: 'bg-purple-500' },
  { value: 3, label: 'Treasury Management', icon: DollarSign, color: 'bg-yellow-500' },
  { value: 4, label: 'Contract Upgrade', icon: Settings, color: 'bg-red-500' },
  { value: 5, label: 'Parameter Update', icon: Settings, color: 'bg-gray-500' },
  { value: 6, label: 'Oracle Update', icon: Zap, color: 'bg-orange-500' },
  { value: 7, label: 'Pause/Unpause', icon: Settings, color: 'bg-indigo-500' }
];

export default function DAODashboard() {
  const { account, isConnected, nftFlowContract } = useWeb3();
  const { toast } = useToast();
  const [stats, setStats] = useState<DAOStats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Create proposal state
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalType, setProposalType] = useState('0');
  const [proposalParameters, setProposalParameters] = useState('');

  useEffect(() => {
    if (nftFlowContract) {
      loadDAOData();
    } else {
      // Mock data for demonstration
      setStats({
        totalProposals: 5,
        activeProposals: 2,
        totalVotingPower: 1000000,
        userVotingPower: 1500,
        treasuryBalance: '125.5',
        quorumPercentage: 25,
        votingDuration: 7 * 24 * 60 * 60 // 7 days
      });
      
      setProposals([
        {
          id: 1,
          description: 'Increase platform fee from 2.5% to 3%',
          proposalType: 0,
          yesVotes: 2500,
          noVotes: 800,
          deadline: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60,
          executed: false,
          proposer: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
          createdAt: Math.floor(Date.now() / 1000) - 4 * 24 * 60 * 60
        },
        {
          id: 2,
          description: 'Update collateral requirements for premium NFTs',
          proposalType: 1,
          yesVotes: 1800,
          noVotes: 1200,
          deadline: Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60,
          executed: false,
          proposer: '0x1234567890123456789012345678901234567890',
          createdAt: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60
        },
        {
          id: 3,
          description: 'Implement new reward structure for active users',
          proposalType: 2,
          yesVotes: 3200,
          noVotes: 400,
          deadline: Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60,
          executed: true,
          proposer: '0x9876543210987654321098765432109876543210',
          createdAt: Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60
        }
      ]);
      
      setLoading(false);
    }
  }, [nftFlowContract, account]);

  const loadDAOData = async () => {
    try {
      setLoading(true);
      
      // Mock implementation - replace with actual contract calls when deployed
      setStats({
        totalProposals: 0,
        activeProposals: 0,
        totalVotingPower: 0,
        userVotingPower: 0,
        treasuryBalance: '0',
        quorumPercentage: 0,
        votingDuration: 0
      });
      setProposals([]);
      
    } catch (error) {
      console.error('Error loading DAO data:', error);
      toast({
        title: "Error",
        description: "Failed to load DAO data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async () => {
    if (!proposalDescription || !proposalType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock implementation - replace with actual contract call when deployed
      toast({
        title: "Success",
        description: "Proposal created successfully (Mock)"
      });
      
      // Reset form
      setProposalDescription('');
      setProposalType('0');
      setProposalParameters('');
      
      // Reload data
      loadDAOData();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to create proposal",
        variant: "destructive"
      });
    }
  };

  const voteOnProposal = async (proposalId: number, support: boolean) => {
    try {
      // Mock implementation - replace with actual contract call when deployed
      toast({
        title: "Success",
        description: `Voted ${support ? 'YES' : 'NO'} on proposal ${proposalId} (Mock)`
      });
      
      loadDAOData();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to vote on proposal",
        variant: "destructive"
      });
    }
  };

  const executeProposal = async (proposalId: number) => {
    try {
      // Mock implementation - replace with actual contract call when deployed
      toast({
        title: "Success",
        description: `Proposal ${proposalId} executed successfully (Mock)`
      });
      
      loadDAOData();
    } catch (error) {
      console.error('Error executing proposal:', error);
      toast({
        title: "Error",
        description: "Failed to execute proposal",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getProposalTypeInfo = (type: number) => {
    return PROPOSAL_TYPES.find(t => t.value === type) || PROPOSAL_TYPES[0];
  };

  const getProposalStatus = (proposal: Proposal) => {
    if (proposal.executed) return { status: 'Executed', color: 'bg-green-500' };
    if (Date.now() / 1000 > proposal.deadline) return { status: 'Ended', color: 'bg-gray-500' };
    return { status: 'Active', color: 'bg-blue-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">DAO Governance</h1>
        <Button onClick={loadDAOData} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Proposals</CardTitle>
                <Plus className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalProposals || 0}</div>
                <p className="text-xs text-slate-400">
                  {stats?.activeProposals || 0} active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Your Voting Power</CardTitle>
                <Vote className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.userVotingPower || 0}</div>
                <p className="text-xs text-slate-400">
                  Governance tokens
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Treasury Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.treasuryBalance || '0'} STT</div>
                <p className="text-xs text-slate-400">
                  Available funds
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Quorum</CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.quorumPercentage || 0}%</div>
                <p className="text-xs text-slate-400">
                  Required to pass
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Proposals */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Proposals</CardTitle>
              <CardDescription className="text-slate-400">Latest governance proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposals.slice(0, 5).map((proposal) => {
                  const typeInfo = getProposalTypeInfo(proposal.proposalType);
                  const status = getProposalStatus(proposal);
                  const totalVotes = proposal.yesVotes + proposal.noVotes;
                  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;

                  return (
                    <div key={proposal.id} className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-700/30">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${typeInfo.color}`}>
                          <typeInfo.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{proposal.description}</h3>
                          <p className="text-sm text-slate-400">
                            {typeInfo.label} • {formatTime(proposal.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">
                            {proposal.yesVotes} YES • {proposal.noVotes} NO
                          </div>
                          <div className="w-24">
                            <Progress value={yesPercentage} className="h-2" />
                          </div>
                        </div>
                        <Badge className={status.color}>{status.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const typeInfo = getProposalTypeInfo(proposal.proposalType);
              const status = getProposalStatus(proposal);
              const totalVotes = proposal.yesVotes + proposal.noVotes;
              const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
              const canVote = !proposal.executed && Date.now() / 1000 < proposal.deadline;
              const canExecute = !proposal.executed && Date.now() / 1000 > proposal.deadline && proposal.yesVotes > proposal.noVotes;

              return (
                <Card key={proposal.id} className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${typeInfo.color}`}>
                          <typeInfo.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">Proposal #{proposal.id}</CardTitle>
                          <CardDescription className="text-slate-400">{typeInfo.label}</CardDescription>
                        </div>
                      </div>
                      <Badge className={status.color}>{status.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">{proposal.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white">Voting Progress</span>
                          <span className="text-white">{yesPercentage.toFixed(1)}% YES</span>
                        </div>
                        <Progress value={yesPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>{proposal.yesVotes} YES</span>
                          <span>{proposal.noVotes} NO</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Deadline: {formatTime(proposal.deadline)}</span>
                        <span>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                      </div>

                      {canVote && stats?.userVotingPower > 0 && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => voteOnProposal(proposal.id, true)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Vote YES
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => voteOnProposal(proposal.id, false)}
                            className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Vote NO
                          </Button>
                        </div>
                      )}

                      {canExecute && (
                        <Button 
                          onClick={() => executeProposal(proposal.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          Execute Proposal
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Create New Proposal</CardTitle>
              <CardDescription className="text-slate-400">
                Create a governance proposal to change platform parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white">Proposal Type</label>
                <Select value={proposalType} onValueChange={setProposalType}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Select proposal type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {PROPOSAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value.toString()}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-white">Description</label>
                <Textarea
                  placeholder="Describe your proposal..."
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">Parameters (Hex Encoded)</label>
                <Input
                  placeholder="0x..."
                  value={proposalParameters}
                  onChange={(e) => setProposalParameters(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Leave empty for simple proposals
                </p>
              </div>

              {stats?.userVotingPower === 0 && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <AlertDescription className="text-yellow-400">
                    You need governance tokens to create proposals. 
                    Contact the DAO administrator to become eligible.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={createProposal}
                disabled={stats?.userVotingPower === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">DAO Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Current governance parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white">Voting Duration</label>
                  <p className="text-sm text-slate-400">
                    {stats?.votingDuration ? Math.floor(stats.votingDuration / (24 * 60 * 60)) : 0} days
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white">Quorum Percentage</label>
                  <p className="text-sm text-slate-400">
                    {stats?.quorumPercentage || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
