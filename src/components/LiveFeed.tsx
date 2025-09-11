import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';
import { ethers } from 'ethers';
import {
  GET_RECENT_PROPOSALS,
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
  Activity,
  RefreshCw,
  Zap,
  Bell,
  BellOff
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
  { value: 0, label: 'Fee Change', icon: TrendingUp, color: 'bg-blue-500' },
  { value: 1, label: 'Collateral Update', icon: Users, color: 'bg-green-500' },
  { value: 2, label: 'Reward Adjustment', icon: TrendingUp, color: 'bg-purple-500' },
  { value: 3, label: 'Treasury Management', icon: TrendingUp, color: 'bg-yellow-500' },
  { value: 4, label: 'Contract Upgrade', icon: Users, color: 'bg-red-500' },
  { value: 5, label: 'Parameter Update', icon: Users, color: 'bg-gray-500' },
  { value: 6, label: 'Oracle Update', icon: Zap, color: 'bg-orange-500' },
  { value: 7, label: 'Pause/Unpause', icon: Users, color: 'bg-indigo-500' }
];

export default function LiveFeed() {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pollInterval, setPollInterval] = useState(5000); // 5 seconds

  // Queries with auto-refresh
  const { data: recentProposalsData, loading: recentLoading, refetch: refetchProposals } = useQuery(GET_RECENT_PROPOSALS, {
    variables: { first: 10 },
    pollInterval,
  });

  const { data: activityData, loading: activityLoading, refetch: refetchActivity } = useQuery(GET_ACTIVITY_FEED, {
    variables: { first: 20 },
    pollInterval,
  });

  // Real-time subscriptions
  useSubscription(PROPOSAL_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.proposalCreated && notificationsEnabled) {
        toast({
          title: "🚀 New Proposal Created",
          description: `Proposal #${data.data.proposalCreated.id}: ${data.data.proposalCreated.description.slice(0, 50)}...`,
          duration: 5000,
        });
        refetchProposals();
      }
    },
  });

  useSubscription(VOTE_CAST_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.voteCast && notificationsEnabled) {
        toast({
          title: "🗳️ Vote Cast",
          description: `${data.data.voteCast.voter.slice(0, 6)}... voted ${data.data.voteCast.support ? 'YES' : 'NO'} on Proposal #${data.data.voteCast.proposal.id}`,
          duration: 3000,
        });
        refetchProposals();
      }
    },
  });

  useSubscription(PROPOSAL_EXECUTED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.proposalExecuted && notificationsEnabled) {
        toast({
          title: "✅ Proposal Executed",
          description: `Proposal #${data.data.proposalExecuted.proposal.id} has been executed successfully!`,
          duration: 5000,
        });
        refetchProposals();
      }
    },
  });

  const recentProposals: Proposal[] = recentProposalsData?.proposals || [];
  const activities: Activity[] = activityData?.activities || [];

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
    refetchProposals();
    refetchActivity();
    toast({
      title: "Refreshed",
      description: "Live feed has been refreshed",
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
      description: notificationsEnabled ? "You won't receive live updates" : "You'll receive live updates",
    });
  };

  const changeRefreshRate = (rate: number) => {
    setPollInterval(rate);
    toast({
      title: "Refresh Rate Updated",
      description: `Auto-refresh every ${rate / 1000} seconds`,
    });
  };

  if (recentLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live DAO Feed</h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={toggleNotifications}
            variant={notificationsEnabled ? "default" : "outline"}
            size="sm"
          >
            {notificationsEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
            {notificationsEnabled ? 'Notifications ON' : 'Notifications OFF'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Refresh Rate Controls */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">Auto-refresh rate:</span>
        <div className="flex space-x-2">
          <Button
            onClick={() => changeRefreshRate(5000)}
            variant={pollInterval === 5000 ? "default" : "outline"}
            size="sm"
          >
            5s
          </Button>
          <Button
            onClick={() => changeRefreshRate(10000)}
            variant={pollInterval === 10000 ? "default" : "outline"}
            size="sm"
          >
            10s
          </Button>
          <Button
            onClick={() => changeRefreshRate(30000)}
            variant={pollInterval === 30000 ? "default" : "outline"}
            size="sm"
          >
            30s
          </Button>
          <Button
            onClick={() => changeRefreshRate(0)}
            variant={pollInterval === 0 ? "default" : "outline"}
            size="sm"
          >
            Off
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Proposals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Proposals
            </CardTitle>
            <CardDescription>Latest governance proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No proposals found
                </div>
              ) : (
                recentProposals.map((proposal) => {
                  const typeInfo = getProposalTypeInfo(proposal.proposalType);
                  const status = getProposalStatus(proposal);
                  const totalVotes = parseInt(proposal.yesVotes) + parseInt(proposal.noVotes);
                  const yesPercentage = totalVotes > 0 ? (parseInt(proposal.yesVotes) / totalVotes) * 100 : 0;

                  return (
                    <div key={proposal.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded-full ${typeInfo.color}`}>
                            <typeInfo.icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-medium">#{proposal.id}</span>
                          <Badge className={status.color} variant="secondary">
                            {status.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(proposal.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {proposal.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{proposal.yesVotes} YES</span>
                          <span>{proposal.noVotes} NO</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${yesPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {totalVotes} total votes • {yesPercentage.toFixed(1)}% YES
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Live Activity
            </CardTitle>
            <CardDescription>Real-time DAO activity updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              ) : (
                activities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const activityColor = getActivityColor(activity.type);

                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-1 rounded-full bg-gray-100 mt-1`}>
                        <ActivityIcon className={`h-3 w-3 ${activityColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {activity.type === 'PROPOSAL_CREATED' && 'New proposal created'}
                            {activity.type === 'VOTE_CAST' && 'Vote cast'}
                            {activity.type === 'PROPOSAL_EXECUTED' && 'Proposal executed'}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                        
                        {activity.proposal && (
                          <p className="text-xs text-gray-600 mb-1">
                            Proposal #{activity.proposal.id}: {activity.proposal.description.slice(0, 60)}...
                          </p>
                        )}
                        
                        {activity.vote && (
                          <p className="text-xs text-gray-600 mb-1">
                            Voted {activity.vote.support ? 'YES' : 'NO'} with {formatEther(activity.vote.votingPower)} voting power
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          {activity.user.slice(0, 6)}...{activity.user.slice(-4)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicator */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              Live feed is {pollInterval > 0 ? `refreshing every ${pollInterval / 1000} seconds` : 'paused'}. 
              {notificationsEnabled ? ' Notifications are enabled.' : ' Notifications are disabled.'}
            </span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${pollInterval > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs">
                {pollInterval > 0 ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
