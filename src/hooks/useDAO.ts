import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from './use-toast';

export interface Proposal {
  id: number;
  description: string;
  proposalType: number;
  yesVotes: number;
  noVotes: number;
  deadline: number;
  executed: boolean;
  proposer: string;
  createdAt: number;
  parameters: string;
}

export interface DAOStats {
  totalProposals: number;
  activeProposals: number;
  totalVotingPower: number;
  userVotingPower: number;
  treasuryBalance: string;
  quorumPercentage: number;
  votingDuration: number;
  executionDelay: number;
}

export const useDAO = () => {
  const { account, contract } = useWeb3();
  const { toast } = useToast();
  const [stats, setStats] = useState<DAOStats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDAOStats = async () => {
    if (!contract?.dao || !account) return;

    try {
      setLoading(true);
      setError(null);

      const [
        totalProposals,
        userVotingPower,
        treasuryBalance,
        quorumPercentage,
        votingDuration,
        executionDelay
      ] = await Promise.all([
        contract.dao.totalProposals(),
        contract.dao.getVotingPower(account),
        contract.dao.treasuryBalance(),
        contract.dao.quorumPercentage(),
        contract.dao.votingDuration(),
        contract.dao.executionDelay()
      ]);

      // Calculate active proposals
      let activeProposals = 0;
      for (let i = 0; i < totalProposals; i++) {
        const proposal = await contract.dao.getProposal(i);
        const isActive = !proposal.executed && Date.now() / 1000 < Number(proposal.deadline);
        if (isActive) activeProposals++;
      }

      setStats({
        totalProposals: Number(totalProposals),
        activeProposals,
        totalVotingPower: 0, // Would need to calculate from governance token supply
        userVotingPower: Number(userVotingPower),
        treasuryBalance: ethers.formatEther(treasuryBalance),
        quorumPercentage: Number(quorumPercentage),
        votingDuration: Number(votingDuration),
        executionDelay: Number(executionDelay)
      });
    } catch (err) {
      console.error('Error loading DAO stats:', err);
      setError('Failed to load DAO statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    if (!contract?.dao) return;

    try {
      setLoading(true);
      setError(null);

      const totalProposals = await contract.dao.totalProposals();
      const proposalsList: Proposal[] = [];

      for (let i = 0; i < totalProposals; i++) {
        const proposal = await contract.dao.getProposal(i);
        proposalsList.push({
          id: Number(proposal.id),
          description: proposal.description,
          proposalType: Number(proposal.proposalType),
          yesVotes: Number(proposal.yesVotes),
          noVotes: Number(proposal.noVotes),
          deadline: Number(proposal.deadline),
          executed: proposal.executed,
          proposer: proposal.proposer,
          createdAt: Number(proposal.createdAt),
          parameters: proposal.parameters
        });
      }

      setProposals(proposalsList);
    } catch (err) {
      console.error('Error loading proposals:', err);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (
    description: string,
    proposalType: number,
    parameters: string = '0x'
  ) => {
    if (!contract?.dao || !account) {
      throw new Error('Contract or account not available');
    }

    try {
      const tx = await contract.dao.createProposal(description, proposalType, parameters);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Proposal created successfully"
      });

      // Reload data
      await Promise.all([loadDAOStats(), loadProposals()]);
    } catch (err) {
      console.error('Error creating proposal:', err);
      const errorMessage = err.message?.includes('NoVotingPower') 
        ? 'You need governance tokens to create proposals'
        : 'Failed to create proposal';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const voteOnProposal = async (proposalId: number, support: boolean) => {
    if (!contract?.dao || !account) {
      throw new Error('Contract or account not available');
    }

    try {
      const tx = await contract.dao.vote(proposalId, support);
      await tx.wait();
      
      toast({
        title: "Success",
        description: `Voted ${support ? 'YES' : 'NO'} on proposal ${proposalId}`
      });

      // Reload data
      await Promise.all([loadDAOStats(), loadProposals()]);
    } catch (err) {
      console.error('Error voting:', err);
      const errorMessage = err.message?.includes('AlreadyVoted')
        ? 'You have already voted on this proposal'
        : err.message?.includes('NoVotingPower')
        ? 'You need governance tokens to vote'
        : 'Failed to vote on proposal';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const executeProposal = async (proposalId: number) => {
    if (!contract?.dao || !account) {
      throw new Error('Contract or account not available');
    }

    try {
      const tx = await contract.dao.executeProposal(proposalId);
      await tx.wait();
      
      toast({
        title: "Success",
        description: `Proposal ${proposalId} executed successfully`
      });

      // Reload data
      await Promise.all([loadDAOStats(), loadProposals()]);
    } catch (err) {
      console.error('Error executing proposal:', err);
      const errorMessage = err.message?.includes('ProposalNotPassed')
        ? 'Proposal did not pass or quorum not met'
        : err.message?.includes('ExecutionDelayNotMet')
        ? 'Execution delay not yet met'
        : 'Failed to execute proposal';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const checkProposalPassed = async (proposalId: number): Promise<boolean> => {
    if (!contract?.dao) return false;

    try {
      return await contract.dao.proposalPassed(proposalId);
    } catch (err) {
      console.error('Error checking proposal status:', err);
      return false;
    }
  };

  const getProposalsByProposer = async (proposer: string): Promise<number[]> => {
    if (!contract?.dao) return [];

    try {
      return await contract.dao.getProposalsByProposer(proposer);
    } catch (err) {
      console.error('Error getting proposals by proposer:', err);
      return [];
    }
  };

  const mintGovernanceToken = async () => {
    if (!contract?.governanceToken || !account) {
      throw new Error('Governance token contract or account not available');
    }

    try {
      const tx = await contract.governanceToken.mint();
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Governance token minted successfully"
      });

      // Reload DAO stats to update voting power
      await loadDAOStats();
    } catch (err) {
      console.error('Error minting governance token:', err);
      const errorMessage = err.message?.includes('Not eligible')
        ? 'You are not eligible for a governance token'
        : err.message?.includes('Already claimed')
        ? 'You have already claimed a governance token'
        : 'Failed to mint governance token';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const checkEligibility = async (): Promise<boolean> => {
    if (!contract?.governanceToken || !account) return false;

    try {
      return await contract.governanceToken.isEligibleForToken(account);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      return false;
    }
  };

  const refreshData = async () => {
    await Promise.all([loadDAOStats(), loadProposals()]);
  };

  useEffect(() => {
    if (contract?.dao && account) {
      refreshData();
    }
  }, [contract?.dao, account]);

  return {
    stats,
    proposals,
    loading,
    error,
    createProposal,
    voteOnProposal,
    executeProposal,
    checkProposalPassed,
    getProposalsByProposer,
    mintGovernanceToken,
    checkEligibility,
    refreshData,
    loadDAOStats,
    loadProposals
  };
};
