import { useState, useEffect } from 'react';
import { useQuery, useSubscription, useLazyQuery } from '@apollo/client';
import { useToast } from './use-toast';
import {
  GET_ALL_PROPOSALS,
  GET_RECENT_PROPOSALS,
  GET_PROPOSAL_BY_ID,
  GET_USER_VOTES,
  GET_DAO_STATS,
  GET_GOVERNANCE_TOKENS,
  GET_USER_GOVERNANCE_TOKENS,
  GET_VOTING_POWER_HISTORY,
  GET_PROPOSAL_VOTES,
  GET_TREASURY_TRANSACTIONS,
  GET_ACTIVITY_FEED,
  PROPOSAL_CREATED_SUBSCRIPTION,
  VOTE_CAST_SUBSCRIPTION,
  PROPOSAL_EXECUTED_SUBSCRIPTION
} from '../services/subgraphService';

export interface Proposal {
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

export interface Vote {
  id: string;
  voter: string;
  support: boolean;
  votingPower: string;
  timestamp: string;
}

export interface DAOStats {
  totalProposals: number;
  activeProposals: number;
  totalVotes: number;
  totalVotingPower: number;
  treasuryBalance: string;
}

export interface Activity {
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

export interface GovernanceToken {
  id: string;
  tokenId: string;
  owner: string;
  mintedAt: string;
}

export interface TreasuryTransaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  transactionHash: string;
  timestamp: string;
  proposal?: {
    id: string;
    description: string;
  };
}

export const useSubgraph = () => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // DAO Stats
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_DAO_STATS, {
    pollInterval: 10000, // Refresh every 10 seconds
  });

  // Recent Proposals
  const { data: recentProposalsData, loading: recentLoading, refetch: refetchRecent } = useQuery(GET_RECENT_PROPOSALS, {
    variables: { first: 10 },
    pollInterval: 5000,
  });

  // Activity Feed
  const { data: activityData, loading: activityLoading, refetch: refetchActivity } = useQuery(GET_ACTIVITY_FEED, {
    variables: { first: 50 },
    pollInterval: 5000,
  });

  // Lazy queries for on-demand data
  const [getAllProposals, { data: allProposalsData, loading: allProposalsLoading }] = useLazyQuery(GET_ALL_PROPOSALS);
  const [getProposalById, { data: proposalData, loading: proposalLoading }] = useLazyQuery(GET_PROPOSAL_BY_ID);
  const [getUserVotes, { data: userVotesData, loading: userVotesLoading }] = useLazyQuery(GET_USER_VOTES);
  const [getGovernanceTokens, { data: governanceTokensData, loading: governanceTokensLoading }] = useLazyQuery(GET_GOVERNANCE_TOKENS);
  const [getUserGovernanceTokens, { data: userGovernanceTokensData, loading: userGovernanceTokensLoading }] = useLazyQuery(GET_USER_GOVERNANCE_TOKENS);
  const [getVotingPowerHistory, { data: votingPowerHistoryData, loading: votingPowerHistoryLoading }] = useLazyQuery(GET_VOTING_POWER_HISTORY);
  const [getProposalVotes, { data: proposalVotesData, loading: proposalVotesLoading }] = useLazyQuery(GET_PROPOSAL_VOTES);
  const [getTreasuryTransactions, { data: treasuryTransactionsData, loading: treasuryTransactionsLoading }] = useLazyQuery(GET_TREASURY_TRANSACTIONS);

  // Real-time subscriptions
  useSubscription(PROPOSAL_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.proposalCreated && notificationsEnabled) {
        toast({
          title: "🚀 New Proposal Created",
          description: `Proposal #${data.data.proposalCreated.id}: ${data.data.proposalCreated.description.slice(0, 50)}...`,
          duration: 5000,
        });
        refetchRecent();
        refetchStats();
      }
    },
  });

  useSubscription(VOTE_CAST_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.voteCast && notificationsEnabled) {
        toast({
          title: "🗳️ Vote Cast",
          description: `${data.data.voteCast.voter.slice(0, 6)}... voted ${data.data.voteCast.support ? 'YES' : 'NO'}`,
          duration: 3000,
        });
        refetchRecent();
        refetchStats();
      }
    },
  });

  useSubscription(PROPOSAL_EXECUTED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.proposalExecuted && notificationsEnabled) {
        toast({
          title: "✅ Proposal Executed",
          description: `Proposal #${data.data.proposalExecuted.proposal.id} has been executed!`,
          duration: 5000,
        });
        refetchRecent();
        refetchStats();
      }
    },
  });

  // Helper functions
  const fetchAllProposals = (first: number = 20, skip: number = 0, orderBy: string = 'createdAt', orderDirection: string = 'desc') => {
    getAllProposals({
      variables: { first, skip, orderBy, orderDirection }
    });
  };

  const fetchProposalById = (id: string) => {
    getProposalById({
      variables: { id }
    });
  };

  const fetchUserVotes = (voter: string) => {
    getUserVotes({
      variables: { voter }
    });
  };

  const fetchGovernanceTokens = (first: number = 20, skip: number = 0) => {
    getGovernanceTokens({
      variables: { first, skip }
    });
  };

  const fetchUserGovernanceTokens = (owner: string) => {
    getUserGovernanceTokens({
      variables: { owner }
    });
  };

  const fetchVotingPowerHistory = (voter: string, first: number = 50) => {
    getVotingPowerHistory({
      variables: { voter, first }
    });
  };

  const fetchProposalVotes = (proposalId: string, first: number = 50, skip: number = 0) => {
    getProposalVotes({
      variables: { proposalId, first, skip }
    });
  };

  const fetchTreasuryTransactions = (first: number = 20, skip: number = 0) => {
    getTreasuryTransactions({
      variables: { first, skip }
    });
  };

  const refreshAll = () => {
    refetchStats();
    refetchRecent();
    refetchActivity();
    toast({
      title: "Refreshed",
      description: "All data has been refreshed",
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
      description: notificationsEnabled ? "You won't receive live updates" : "You'll receive live updates",
    });
  };

  // Data processing helpers
  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: string) => {
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

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  // Computed values
  const stats: DAOStats = statsData?.daoStats || {
    totalProposals: 0,
    activeProposals: 0,
    totalVotes: 0,
    totalVotingPower: 0,
    treasuryBalance: '0'
  };

  const recentProposals: Proposal[] = recentProposalsData?.proposals || [];
  const activities: Activity[] = activityData?.activities || [];
  const allProposals: Proposal[] = allProposalsData?.proposals || [];
  const proposal: Proposal | null = proposalData?.proposal || null;
  const userVotes: Vote[] = userVotesData?.votes || [];
  const governanceTokens: GovernanceToken[] = governanceTokensData?.governanceTokens || [];
  const userGovernanceTokens: GovernanceToken[] = userGovernanceTokensData?.governanceTokens || [];
  const votingPowerHistory = votingPowerHistoryData?.votingPowerSnapshots || [];
  const proposalVotes: Vote[] = proposalVotesData?.votes || [];
  const treasuryTransactions: TreasuryTransaction[] = treasuryTransactionsData?.treasuryTransactions || [];

  return {
    // Data
    stats,
    recentProposals,
    activities,
    allProposals,
    proposal,
    userVotes,
    governanceTokens,
    userGovernanceTokens,
    votingPowerHistory,
    proposalVotes,
    treasuryTransactions,

    // Loading states
    statsLoading,
    recentLoading,
    activityLoading,
    allProposalsLoading,
    proposalLoading,
    userVotesLoading,
    governanceTokensLoading,
    userGovernanceTokensLoading,
    votingPowerHistoryLoading,
    proposalVotesLoading,
    treasuryTransactionsLoading,

    // Functions
    fetchAllProposals,
    fetchProposalById,
    fetchUserVotes,
    fetchGovernanceTokens,
    fetchUserGovernanceTokens,
    fetchVotingPowerHistory,
    fetchProposalVotes,
    fetchTreasuryTransactions,
    refreshAll,
    toggleNotifications,

    // Utilities
    formatTime,
    formatTimeAgo,
    formatEther,
    truncateAddress,
    truncateText,

    // Settings
    notificationsEnabled,
  };
};
