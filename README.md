

# NFTFlow 🚀

[![Somnia Network](https://img.shields.io/badge/Powered%20by-Somnia%20Network-000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik03MCA3MGg2MHY2MEg3MHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=)](https://somnia.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)](https://reactjs.org)

> **The Netflix for NFTs** - A revolutionary marketplace for real-time, pay-per-second NFT rentals powered by Somnia Network's 1M+ TPS blockchain.

## 🌟 Overview

NFTFlow unlocks the $200B+ NFT market by enabling **micro-rentals** of digital assets. Rent high-value NFTs by the second with real-time payment streaming, powered by Somnia Network's sub-second finality and sub-cent transaction fees.

**Live Demo:** [https://nftflow.lovable.app](https://nftflow.lovable.app/)

**Video Demo:** [YouTube Walkthrough](https://youtube.com/demo)

## 🚀 Unique Value Proposition

| Feature | Traditional Platforms | **NFTFlow on Somnia** |
| :--- | :--- | :--- |
| **Minimum Rental Time** | 1 Day | **1 Second** ⚡ |
| **Transaction Cost** | $2-50 | **<$0.01** 💸 |
| **Transaction Speed** | 15-60 seconds | **<1 Second** 🚀 |
| **Payment Model** | Upfront Payment | **Real-time Streaming** 📊 |

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   User Layer    │    │  Application Layer   │    │   Backend & Data    │    │  Blockchain Layer   │
│                 │    │                      │    │                     │    │   (Somnia Network)  │
│ ┌─────────────┐ │    │  ┌────────────────┐  │    │  ┌───────────────┐  │    │  ┌───────────────┐  │
│ │   Web dApp  │◄┼────┼──┤ NFTFlow Server │──┼────┼──►  PostgreSQL   │  │    │  │   Somnia L1   │  │
│ └─────────────┘ │    │  └────────────────┘  │    │  └───────────────┘  │    │  │   Blockchain   │  │
│                 │    │          │           │    │          │           │    │  └───────────────┘  │
│ ┌─────────────┐ │    │          │           │    │  ┌───────────────┐  │    │          ▲           │
│ │ Mobile App  │◄┼────┼──────────┘           │    │  │     Redis     │  │    │          │           │
│ └─────────────┘ │    │                      │    │  └───────────────┘  │    │  ┌───────────────┐  │
│                 │    │  ┌────────────────┐  │    │          │           │    │  │ Smart Contracts│ │
│ ┌─────────────┐ │    │  │   WebSocket    │◄─┼────┼──────────┘           │    │  │  • NFTFlow    │ │
│ │    User     │◄┼────┼──┤   Real-Time    │  │    │  ┌───────────────┐  │    │  │  • Payment    │ │
│ └─────────────┘ │    │  │    Updates     │  │    │  │     IPFS      │◄─┼────┼──┤  • Reputation │ │
└─────────────────┘    │  └────────────────┘  │    │  └───────────────┘  │    │  └───────────────┘  │
                       └──────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Smart Contract Architecture

```solidity
src/contracts/
├── interfaces/
│   ├── IERC4907.sol          # ERC-4907 Rental Standard
│   └── IPriceOracle.sol      # Oracle Interface
├── NFTFlow.sol               # Main Rental Logic
├── PaymentStream.sol         # Real-time Payment Streaming
└── ReputationSystem.sol      # On-chain Reputation & Collateral Management
```

### Technical Stack

**Blockchain Layer:**
- **Somnia Network** (EVM-compatible L1)
- **Solidity 0.8.19** (Smart Contracts)
- **Hardhat** (Development & Testing)
- **DIA Oracle** (Price Feeds)

**Backend Layer:**
- **Node.js + Express** (API Server)
- **PostgreSQL** (Primary Database)
- **Redis** (Caching & Sessions)
- **IPFS** (Decentralized Storage)
- **Socket.io** (Real-time Updates)

**Frontend Layer:**
- **React 18** (TypeScript)
- **Wagmi + Viem** (Blockchain Interactions)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)

## ✨ Key Features

### 🎯 Micro-Rentals
Rent any NFT for as little as **one second** with sub-cent transaction fees:
```solidity
function rentNFT(address nftContract, uint256 tokenId, uint256 duration) 
    external 
    payable 
{
    // Calculate cost: pricePerSecond * duration
    uint256 cost = pricePerSecond * duration;
    require(msg.value >= cost, "Insufficient payment");
    
    // Real-time payment stream creation
    createPaymentStream(lender, cost, duration);
    
    // Instant NFT access transfer
    IERC4907(nftContract).setUser(tokenId, msg.sender, uint64(block.timestamp + duration));
}
```

### ⚡ Real-Time Payment Streaming
Watch payments stream to owners in real-time:
```javascript
// Live payment visualization component
const PaymentStream = ({ stream }) => {
  const [currentAmount, setCurrentAmount] = useState(stream.releasedAmount);
  
  // Update every second thanks to Somnia's fast blocks
  useEffect(() => {
    const interval = setInterval(() => {
      const newAmount = calculateCurrentStreamAmount(stream);
      setCurrentAmount(newAmount);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [stream]);
};
```

### 🏆 Reputation System
Earn lower collateral requirements through successful rentals:
```solidity
function updateReputation(address user, bool success) external {
    totalRentals[user]++;
    if (success) {
        successfulRentals[user]++;
        reputationScores[user] = Math.min(MAX_SCORE, reputationScores[user] + REPUTATION_GAIN);
        // Collateral-free access for trusted users
        if (reputationScores[user] > REPUTATION_THRESHOLD) {
            collateralRequirements[user] = 0;
        }
    }
}
```

### 📊 Advanced Discovery
- **Search & Filtering** by collection, price, duration, and traits
- **Personalized Recommendations** based on rental history
- **Trending NFTs** with real-time popularity metrics
- **Social Features** including likes, shares, and follower networks

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- MetaMask or compatible wallet
- Somnia Testnet STT tokens ([Faucet](https://testnet.somnia.network))

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nftflow.git
cd nftflow
```

### 2. Smart Contract Deployment
```bash
cd contracts
npm install

# Configure environment
cp .env.example .env
# Add your private key and Somnia RPC URL

# Deploy to Somnia Testnet
npx hardhat run scripts/deploy.js --network somniaTestnet
```

### 3. Backend Setup
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Add database and blockchain configuration

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Add contract addresses and RPC URLs

# Start development server
npm run dev
```

## 📖 Usage Guide

### For NFT Owners (Lenders)
1. **Connect your wallet** to the NFTFlow dApp
2. **Select an NFT** from your wallet to list for rental
3. **Set pricing** (price per second) and collateral requirements
4. **Start earning** passive income immediately when rentals begin

### For Renters
1. **Browse available NFTs** using search and filters
2. **Select rental duration** from seconds to days
3. **Confirm transaction** (takes <1 second to confirm)
4. **Use the NFT immediately** in supported games and applications

### Example Rental Calculation
```javascript
// Premium NFT: 8.5 STT per hour
const pricePerSecond = 8.5 / 3600; // 0.002361 STT/second
const oneHourCost = pricePerSecond * 3600; // 8.5 STT
const tenMinuteCost = pricePerSecond * 600; // 1.416 STT
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

### Full Test Coverage
```
✓ NFTFlow Contract Deployment
✓ NFT Rental Creation & Payment
✓ Reputation System Updates
✓ Payment Stream Calculations
✓ Edge Cases & Security Tests
```

### Performance Benchmarks
```
- Transaction Confirmation: <1 second
- Rental Creation Gas Cost: ~0.0000025 STT
- Payment Streaming Overhead: ~0.0000001 STT per second
- API Response Time: <100ms
```

## 🌍 Somnia Network Integration

NFTFlow leverages Somnia's groundbreaking capabilities:

### ⚡ High Throughput (1M+ TPS)
- Handles thousands of concurrent rentals
- Processes micro-payments in real-time
- Scales effortlessly with user growth

### 💸 Sub-Cent Fees
- Enables second-long rentals economically
- Makes micro-transactions feasible
- Eliminates gas cost barriers

### 🔒 Sub-Second Finality
- Instant rental confirmations
- Real-time UI updates
- Seamless user experience

### Contract Addresses on Somnia Testnet
```
NFTFlow Main Contract: 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359
Payment Stream Contract: 0x741d35Cc6634C893292Ce8bB6239C002Ad8e6b60
Reputation System: 0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260361
```

## 🚀 Roadmap

### Q2 2024 - MVP Launch
- [x] Core rental functionality
- [x] Basic reputation system
- [x] Somnia Testnet deployment
- [ ] Mobile app beta

### Q3 2024 - Ecosystem Growth
- [ ] Mainnet launch on Somnia
- [ ] Cross-chain integration
- [ ] Advanced analytics dashboard
- [ ] Partner with 10+ NFT projects

### Q4 2024 - Scale & Monetize
- [ ] Premium features launch
- [ ] Governance token implementation
- [ ] Mobile app public release
- [ ] 50,000+ active users target

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Priorities
- [ ] Additional test coverage
- [ ] Gas optimization
- [ ] UI/UX improvements
- [ ] Additional blockchain support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation:** [docs.nftflow.io](https://docs.nftflow.io)
- **Discord:** [Join our community](https://discord.gg/nftflow)
- **Twitter:** [@nftflow](https://twitter.com/nftflow)
- **Email:** support@nftflow.io

## 🏆 Acknowledgments

- **Somnia Network** for the revolutionary blockchain infrastructure
- **DIA Oracles** for reliable price feeds
- **ERC-4907** standard creators for the rental standard foundation
- **OpenZeppelin** for battle-tested smart contract libraries

---

**NFTFlow** - Unlocking the future of NFT utility, one second at a time. ⚡

