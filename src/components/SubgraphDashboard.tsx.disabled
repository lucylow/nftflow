import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from '../hooks/use-toast';
import SubgraphErrorBoundary from './SubgraphErrorBoundary';
import {
  GET_ALL_PROPOSALS,
  GET_RECENT_PROPOSALS,
  GET_DAO_STATS,
  GET_ACTIVITY_FEED,
  PROPOSAL_CREATED_SUBSCRIPTION,
  VOTE_CAST_SUBSCRIPTION,
  PROPOSAL_EXECUTED_SUBSCRIPTION
} from '../services/subgraphService';
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
  Zap,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface Proposal {
  id: string;
  description: string;
  proposalType: number;
  proposer: string;
  createdAt: string;
  deadline: string;
  yesVotes: string;
  noVotes: string;
  executed: boolean;
  parameters: string;
}

interface DAOStats {
  totalProposals: number;
  activeProposals: number;
  totalVotes: number;
  totalVotingPower: number;
  treasuryBalance: string;
}

interface Activity {
  id: string;
  type: string;
  user: string;
  proposal?: {
    id: string;
    description: string;
    proposalType: number;
  };
  vote?: {
    support: boolean;
    votingPower: string;
  };
  timestamp: string;
  transactionHash: string;
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

export default function SubgraphDashboard() {
  const { account } = useWeb3();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const itemsPerPage = 10;

  // Queries
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_DAO_STATS, {
    pollInterval: autoRefresh ? 10000 : 0, // Refresh every 10 seconds if enabled
  });

  const { data: proposalsData, loading: proposalsLoading, refetch: refetchProposals } = useQuery(GET_ALL_PROPOSALS, {
    variables: {
      first: itemsPerPage,
      skip: currentPage * itemsPerPage,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    },
    pollInterval: autoRefresh ? 10000 : 0,
  });

  const { data: recentProposalsData, loading: recentLoading } = useQuery(GET_RECENT_PROPOSALS, {
    variables: { first: 5 },
    pollInterval: autoRefresh ? 5000 : 0, // Refresh every 5 seconds
  });

  const { data: activityData, loading: activityLoading } = useQuery(GET_ACTIVITY_FEED, {
    variables: { first: 20 },
    pollInterval: autoRefresh ? 5000 : 0,
  });

  // Real-time subscriptions
  useSubscription(PROPOSAL_CREATED_SUBSCRIPTION, {
    onData: ({ data }: any) => {
      if (data?.proposalCreated) {
        toast({
          title: "New Proposal Created",
          description: `Proposal #${data.proposalCreated.id} has been created`,
        });
        refetchProposals();
        refetchStats();
      }
    },
  });

  useSubscription(VOTE_CAST_SUBSCRIPTION, {
    onData: ({ data }: any) => {
      if (data?.voteCast) {
        toast({
          title: "Vote Cast",
          description: `${data.voteCast.voter.slice(0, 6)}... voted ${data.voteCast.support ? 'YES' : 'NO'}`,
        });
        refetchProposals();
        refetchStats();
      }
    },
  });

  useSubscription(PROPOSAL_EXECUTED_SUBSCRIPTION, {
    onData: ({ data }: any) => {
      if (data?.proposalExecuted) {
        toast({
          title: "Proposal Executed",
          description: `Proposal #${data.proposalExecuted.proposal.id} has been executed`,
        });
        refetchProposals();
        refetchStats();
      }
    },
  });

  const stats: DAOStats = (statsData as any)?.daoStats || {
    totalProposals: 0,
    activeProposals: 0,
    totalVotes: 0,
    totalVotingPower: 0,
    treasuryBalance: '0'
  };

  const proposals: Proposal[] = (proposalsData as any)?.proposals || [];
  const recentProposals: Proposal[] = (recentProposalsData as any)?.proposals || [];
  const activities: Activity[] = (activityData as any)?.activities || [];

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatEther = (wei: string) => {
    const ether = parseFloat(wei) / 1e18;
    return ether.toFixed(4);
  };

  const getProposalTypeInfo = (type: number) => {
    return PROPOSAL_TYPES.find(t => t.value === type) || PROPOSAL_TYPES[0];
  };

  const getProposalStatus = (proposal: Proposal) => {
    if (proposal.executed) return { status: 'Executed', color: 'bg-green-500' };
    if (Date.now() / 1000 > parseInt(proposal.deadline)) return { status: 'Ended', color: 'bg-gray-500' };
    return { status: 'Active', color: 'bg-blue-500' };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PROPOSAL_CREATED':
        return Plus;
      case 'VOTE_CAST':
        return Vote;
      case 'PROPOSAL_EXECUTED':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'PROPOSAL_CREATED':
        return 'text-blue-400';
      case 'VOTE_CAST':
        return 'text-green-400';
      case 'PROPOSAL_EXECUTED':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchProposals();
    toast({
      title: "Refreshed",
      description: "Data has been refreshed",
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (statsLoading || proposalsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <SubgraphErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DAO Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProposals}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProposals} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVotes}</div>
                <p className="text-xs text-muted-foreground">
                  Community participation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEther(stats.treasuryBalance)} ETH</div>
                <p className="text-xs text-muted-foreground">
                  Available funds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voting Power</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVotingPower}</div>
                <p className="text-xs text-muted-foreground">
                  Total governance tokens
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
                {recentProposals.map((proposal) => {
                  const typeInfo = getProposalTypeInfo(proposal.proposalType);
                  const status = getProposalStatus(proposal);
                  const totalVotes = parseInt(proposal.yesVotes) + parseInt(proposal.noVotes);
                  const yesPercentage = totalVotes > 0 ? (parseInt(proposal.yesVotes) / totalVotes) * 100 : 0;

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
              const totalVotes = parseInt(proposal.yesVotes) + parseInt(proposal.noVotes);
              const yesPercentage = totalVotes > 0 ? (parseInt(proposal.yesVotes) / totalVotes) * 100 : 0;

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
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              variant="outline"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage + 1}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={proposals.length < itemsPerPage}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Activity Feed</CardTitle>
              <CardDescription>Real-time DAO activity updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const activityColor = getActivityColor(activity.type);

                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <ActivityIcon className={`h-4 w-4 ${activityColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {activity.type === 'PROPOSAL_CREATED' && 'New proposal created'}
                            {activity.type === 'VOTE_CAST' && 'Vote cast'}
                            {activity.type === 'PROPOSAL_EXECUTED' && 'Proposal executed'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.proposal && `Proposal #${activity.proposal.id}: ${activity.proposal.description}`}
                          {activity.vote && `Voted ${activity.vote.support ? 'YES' : 'NO'} with ${formatEther(activity.vote.votingPower)} voting power`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          User: {activity.user.slice(0, 6)}...{activity.user.slice(-4)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Types Distribution</CardTitle>
                <CardDescription>Breakdown of proposal types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PROPOSAL_TYPES.map((type) => {
                    const count = proposals.filter(p => p.proposalType === type.value).length;
                    const percentage = proposals.length > 0 ? (count / proposals.length) * 100 : 0;
                    
                    return (
                      <div key={type.value} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span className="text-sm">{type.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voting Statistics</CardTitle>
                <CardDescription>Community participation metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Votes Cast</span>
                    <span className="font-medium">{stats.totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Proposals</span>
                    <span className="font-medium">{stats.activeProposals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Executed Proposals</span>
                    <span className="font-medium">
                      {proposals.filter(p => p.executed).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium">
                      {proposals.length > 0 
                        ? ((proposals.filter(p => p.executed).length / proposals.length) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              This dashboard provides real-time data from the NFTFlow DAO subgraph. 
              Data is automatically refreshed every 10 seconds when auto-refresh is enabled.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
      </div>
    </SubgraphErrorBoundary>
  );
}
