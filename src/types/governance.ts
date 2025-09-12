// Governance types
export interface Vote {
  id: string;
  voter: string;
  proposalId: string;
  support: boolean;
  weight: string;
  timestamp: number;
}

export interface Proposal {
  id: string;
  proposer: string;
  description: string;
  startTime: number;
  endTime: number;
  forVotes: string;
  againstVotes: string;
  executed: boolean;
  canceled: boolean;
}

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  totalVotes: number;
  totalVoters: number;
}