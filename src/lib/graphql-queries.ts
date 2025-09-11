import { gql } from '@apollo/client';

// SomFlip Game Queries
export const GET_FLIP_RESULTS = gql`
  query GetFlipResults(
    $first: Int!
    $skip: Int!
    $orderBy: String!
    $orderDirection: String!
  ) {
    flipResults(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      player
      betAmount
      choice
      result
      payout
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_RECENT_FLIPS = gql`
  query GetRecentFlips($first: Int!) {
    flipResults(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      player
      betAmount
      choice
      result
      payout
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_FLIP_STATISTICS = gql`
  query GetFlipStatistics {
    flipResults(first: 1000) {
      id
      betAmount
      payout
      result
      blockTimestamp
    }
  }
`;

// NFTFlow Rental Queries
export const GET_RENTALS = gql`
  query GetRentals(
    $first: Int!
    $skip: Int!
    $orderBy: String!
    $orderDirection: String!
  ) {
    rentals(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      nftContract
      tokenId
      owner
      renter
      pricePerSecond
      startTime
      endTime
      totalCost
      status
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_RECENT_RENTALS = gql`
  query GetRecentRentals($first: Int!) {
    rentals(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      nftContract
      tokenId
      owner
      renter
      pricePerSecond
      startTime
      endTime
      totalCost
      status
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_RENTAL_STATISTICS = gql`
  query GetRentalStatistics {
    rentals(first: 1000) {
      id
      totalCost
      pricePerSecond
      startTime
      endTime
      status
      blockTimestamp
    }
  }
`;

export const GET_USER_RENTALS = gql`
  query GetUserRentals($user: String!, $first: Int!, $skip: Int!) {
    rentals(
      where: { renter: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      nftContract
      tokenId
      owner
      renter
      pricePerSecond
      startTime
      endTime
      totalCost
      status
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_NFT_RENTAL_HISTORY = gql`
  query GetNFTRentalHistory($nftContract: String!, $tokenId: String!, $first: Int!) {
    rentals(
      where: { 
        nftContract: $nftContract
        tokenId: $tokenId
      }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      owner
      renter
      pricePerSecond
      startTime
      endTime
      totalCost
      status
      blockTimestamp
      transactionHash
    }
  }
`;

// Network Statistics Queries
export const GET_NETWORK_STATISTICS = gql`
  query GetNetworkStatistics {
    _meta {
      block {
        number
        hash
      }
      deployment
      hasIndexingErrors
    }
  }
`;

// Achievement Queries
export const GET_ACHIEVEMENTS = gql`
  query GetAchievements($first: Int!, $skip: Int!) {
    achievements(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      achievementName
      unlockedAt
      xpEarned
      reward
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_ACHIEVEMENTS = gql`
  query GetUserAchievements($user: String!, $first: Int!) {
    achievements(
      where: { user: $user }
      first: $first
      orderBy: unlockedAt
      orderDirection: desc
    ) {
      id
      achievementName
      unlockedAt
      xpEarned
      reward
      blockTimestamp
    }
  }
`;

// Payment Stream Queries
export const GET_PAYMENT_STREAMS = gql`
  query GetPaymentStreams($first: Int!, $skip: Int!) {
    paymentStreams(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      sender
      recipient
      totalAmount
      streamedAmount
      ratePerSecond
      startTime
      endTime
      isActive
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_PAYMENT_STREAMS = gql`
  query GetUserPaymentStreams($user: String!, $first: Int!) {
    paymentStreams(
      where: { 
        or: [
          { sender: $user }
          { recipient: $user }
        ]
      }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      sender
      recipient
      totalAmount
      streamedAmount
      ratePerSecond
      startTime
      endTime
      isActive
      blockTimestamp
    }
  }
`;

