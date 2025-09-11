import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Configure Apollo Client for Somnia subgraph
const client = new ApolloClient({
  uri: 'https://proxy.somnia.chain.love/subgraphs/name/nftflow-dao',
  cache: new InMemoryCache(),
});

// GraphQL Queries for NFTFlow DAO
export const GET_ALL_PROPOSALS = gql`
  query GetAllProposals($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
    proposals(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      description
      proposalType
      proposer
      createdAt
      deadline
      yesVotes
      noVotes
      executed
      parameters
    }
  }
`;

export const GET_RECENT_PROPOSALS = gql`
  query GetRecentProposals($first: Int!) {
    proposals(
      first: $first
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      description
      proposalType
      proposer
      createdAt
      deadline
      yesVotes
      noVotes
      executed
    }
  }
`;

export const GET_PROPOSAL_BY_ID = gql`
  query GetProposalById($id: ID!) {
    proposal(id: $id) {
      id
      description
      proposalType
      proposer
      createdAt
      deadline
      yesVotes
      noVotes
      executed
      parameters
      votes {
        id
        voter
        support
        votingPower
        timestamp
      }
    }
  }
`;

export const GET_USER_VOTES = gql`
  query GetUserVotes($voter: String!) {
    votes(where: { voter: $voter }) {
      id
      proposal {
        id
        description
        proposalType
      }
      support
      votingPower
      timestamp
    }
  }
`;

export const GET_DAO_STATS = gql`
  query GetDAOStats {
    daoStats(id: "1") {
      totalProposals
      activeProposals
      totalVotes
      totalVotingPower
      treasuryBalance
    }
  }
`;

export const GET_GOVERNANCE_TOKENS = gql`
  query GetGovernanceTokens($first: Int!, $skip: Int!) {
    governanceTokens(
      first: $first
      skip: $skip
      orderBy: tokenId
      orderDirection: asc
    ) {
      id
      tokenId
      owner
      mintedAt
    }
  }
`;

export const GET_USER_GOVERNANCE_TOKENS = gql`
  query GetUserGovernanceTokens($owner: String!) {
    governanceTokens(where: { owner: $owner }) {
      id
      tokenId
      owner
      mintedAt
    }
  }
`;

export const GET_VOTING_POWER_HISTORY = gql`
  query GetVotingPowerHistory($voter: String!, $first: Int!) {
    votingPowerSnapshots(
      where: { voter: $voter }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      voter
      votingPower
      timestamp
    }
  }
`;

export const GET_PROPOSAL_VOTES = gql`
  query GetProposalVotes($proposalId: String!, $first: Int!, $skip: Int!) {
    votes(
      where: { proposal: $proposalId }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      voter
      support
      votingPower
      timestamp
    }
  }
`;

export const GET_TREASURY_TRANSACTIONS = gql`
  query GetTreasuryTransactions($first: Int!, $skip: Int!) {
    treasuryTransactions(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from
      to
      amount
      token
      transactionHash
      timestamp
      proposal {
        id
        description
      }
    }
  }
`;

export const GET_ACTIVITY_FEED = gql`
  query GetActivityFeed($first: Int!) {
    activities(
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      type
      user
      proposal {
        id
        description
        proposalType
      }
      vote {
        support
        votingPower
      }
      timestamp
      transactionHash
    }
  }
`;

// Subscription queries for real-time updates
export const PROPOSAL_CREATED_SUBSCRIPTION = gql`
  subscription ProposalCreated {
    proposalCreated {
      id
      description
      proposalType
      proposer
      createdAt
      deadline
    }
  }
`;

export const VOTE_CAST_SUBSCRIPTION = gql`
  subscription VoteCast {
    voteCast {
      id
      proposal {
        id
        description
      }
      voter
      support
      votingPower
      timestamp
    }
  }
`;

export const PROPOSAL_EXECUTED_SUBSCRIPTION = gql`
  subscription ProposalExecuted {
    proposalExecuted {
      id
      proposal {
        id
        description
      }
      executor
      timestamp
    }
  }
`;

export default client;
