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
import { useWeb3 } from '../contexts/Web3Context';
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
    if (contract?.dao) {
      loadDAOData();
    }
  }, [contract?.dao, account]);

  const loadDAOData = async () => {
    try {
      setLoading(true);
      
      // Load DAO stats
      const [
        totalProposals,
        userVotingPower,
        treasuryBalance,
        quorumPercentage,
        votingDuration
      ] = await Promise.all([
        contract.dao.totalProposals(),
        contract.dao.getVotingPower(account),
        contract.dao.treasuryBalance(),
        contract.dao.quorumPercentage(),
        contract.dao.votingDuration()
      ]);

      // Calculate active proposals
      let activeProposals = 0;
      const proposalsList: Proposal[] = [];
      
      for (let i = 0; i < totalProposals; i++) {
        const proposal = await contract.dao.getProposal(i);
        const isActive = !proposal.executed && Date.now() / 1000 < Number(proposal.deadline);
        if (isActive) activeProposals++;
        
        proposalsList.push({
          id: Number(proposal.id),
          description: proposal.description,
          proposalType: Number(proposal.proposalType),
          yesVotes: Number(proposal.yesVotes),
          noVotes: Number(proposal.noVotes),
          deadline: Number(proposal.deadline),
          executed: proposal.executed,
          proposer: proposal.proposer,
          createdAt: Number(proposal.createdAt)
        });
      }

      setStats({
        totalProposals: Number(totalProposals),
        activeProposals,
        totalVotingPower: 0, // Would need to calculate from governance token supply
        userVotingPower: Number(userVotingPower),
        treasuryBalance: ethers.formatEther(treasuryBalance),
        quorumPercentage: Number(quorumPercentage),
        votingDuration: Number(votingDuration)
      });

      setProposals(proposalsList);
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
      const tx = await contract.dao.createProposal(
        proposalDescription,
        proposalType,
        proposalParameters || '0x'
      );
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Proposal created successfully"
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
      const tx = await contract.dao.vote(proposalId, support);
      await tx.wait();
      
      toast({
        title: "Success",
        description: `Voted ${support ? 'YES' : 'NO'} on proposal ${proposalId}`
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
      const tx = await contract.dao.executeProposal(proposalId);
      await tx.wait();
      
      toast({
        title: "Success",
        description: `Proposal ${proposalId} executed successfully`
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DAO Governance</h1>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProposals || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeProposals || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Voting Power</CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.userVotingPower || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Governance tokens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.treasuryBalance || '0'} ETH</div>
                <p className="text-xs text-muted-foreground">
                  Available funds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quorum</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.quorumPercentage || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Required to pass
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Proposals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Proposals</CardTitle>
              <CardDescription>Latest governance proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposals.slice(0, 5).map((proposal) => {
                  const typeInfo = getProposalTypeInfo(proposal.proposalType);
                  const status = getProposalStatus(proposal);
                  const totalVotes = proposal.yesVotes + proposal.noVotes;
                  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;

                  return (
                    <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${typeInfo.color}`}>
                          <typeInfo.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{proposal.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            {typeInfo.label} • {formatTime(proposal.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
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
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${typeInfo.color}`}>
                          <typeInfo.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Proposal #{proposal.id}</CardTitle>
                          <CardDescription>{typeInfo.label}</CardDescription>
                        </div>
                      </div>
                      <Badge className={status.color}>{status.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Voting Progress</span>
                          <span>{yesPercentage.toFixed(1)}% YES</span>
                        </div>
                        <Progress value={yesPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{proposal.yesVotes} YES</span>
                          <span>{proposal.noVotes} NO</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Deadline: {formatTime(proposal.deadline)}</span>
                        <span>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                      </div>

                      {canVote && stats?.userVotingPower > 0 && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => voteOnProposal(proposal.id, true)}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Vote YES
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => voteOnProposal(proposal.id, false)}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Vote NO
                          </Button>
                        </div>
                      )}

                      {canExecute && (
                        <Button 
                          onClick={() => executeProposal(proposal.id)}
                          className="w-full"
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
          <Card>
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
              <CardDescription>
                Create a governance proposal to change platform parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Proposal Type</label>
                <Select value={proposalType} onValueChange={setProposalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select proposal type" />
                  </SelectTrigger>
                  <SelectContent>
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
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your proposal..."
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Parameters (Hex Encoded)</label>
                <Input
                  placeholder="0x..."
                  value={proposalParameters}
                  onChange={(e) => setProposalParameters(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for simple proposals
                </p>
              </div>

              {stats?.userVotingPower === 0 && (
                <Alert>
                  <AlertDescription>
                    You need governance tokens to create proposals. 
                    Contact the DAO administrator to become eligible.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={createProposal}
                disabled={stats?.userVotingPower === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DAO Settings</CardTitle>
              <CardDescription>
                Current governance parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Voting Duration</label>
                  <p className="text-sm text-muted-foreground">
                    {stats?.votingDuration ? Math.floor(stats.votingDuration / (24 * 60 * 60)) : 0} days
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Quorum Percentage</label>
                  <p className="text-sm text-muted-foreground">
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
