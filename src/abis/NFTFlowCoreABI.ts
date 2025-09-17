// Simplified ABI for NFTFlow Core contract
export const NFTFlowCoreABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "nftContract", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"}
    ],
    "name": "rentNFT",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "offset", "type": "uint256"},
      {"internalType": "uint256", "name": "limit", "type": "uint256"}
    ],
    "name": "getAllListedNFTs",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "contractAddress", "type": "address"},
          {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "collection", "type": "string"},
          {"internalType": "string", "name": "image", "type": "string"},
          {"internalType": "uint256", "name": "pricePerSecond", "type": "uint256"},
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "bool", "name": "isRentable", "type": "bool"}
        ],
        "internalType": "struct NFTFlowCore.NFTListing",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "offset", "type": "uint256"},
      {"internalType": "uint256", "name": "limit", "type": "uint256"}
    ],
    "name": "getUserRentalHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "nftContract", "type": "address"},
          {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
          {"internalType": "string", "name": "nftName", "type": "string"},
          {"internalType": "uint256", "name": "startTime", "type": "uint256"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "uint256", "name": "cost", "type": "uint256"},
          {"internalType": "string", "name": "status", "type": "string"}
        ],
        "internalType": "struct NFTFlowCore.RentalRecord",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
