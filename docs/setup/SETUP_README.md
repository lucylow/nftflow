# NFTFlow Backend Setup Guide

This guide will help you set up the NFTFlow backend services locally using Docker Compose.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nftflow-backend
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.template .env
```

Edit `.env` with your configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://nftflow:nftflow@postgres:5432/nftflow

# Redis Configuration
REDIS_URL=redis://redis:6379

# Blockchain Configuration
SOMNIA_HTTP_RPC=https://dream-rpc.somnia.network/
SOMNIA_WS_RPC=wss://dream-rpc.somnia.network/ws
NFTFLOW_CORE_ADDRESS=0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59
PAYMENT_STREAM_FACTORY_ADDRESS=0x1234567890123456789012345678901234567890

# Storage Configuration (Optional)
NFT_STORAGE_TOKEN=your_nft_storage_token_here
WEB3_STORAGE_TOKEN=your_web3_storage_token_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- IPFS node
- API server
- Event ingestion service
- Background worker
- Monitoring stack (Prometheus, Grafana, ELK)

### 4. Verify Services

Check that all services are running:

```bash
docker-compose ps
```

Test the API health endpoint:

```bash
curl http://localhost:3001/api/health
```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migrations

```bash
npm run db:migrate
```

### 3. Start Development Services

```bash
# Start API server
npm run dev

# Start event ingestion service (in another terminal)
npm run event-ingest

# Start background worker (in another terminal)
npm run worker
```

## Service Architecture

### Core Services

1. **API Server** (`server/api.ts`)
   - Express.js REST API
   - EIP-712 signature verification
   - Rate limiting and caching
   - Health checks

2. **Event Ingestion** (`services/event-ingest.ts`)
   - Real-time blockchain event monitoring
   - Event processing and validation
   - State projection updates
   - Backfill capability

3. **Background Worker** (`services/worker.ts`)
   - Job queue processing
   - Metadata storage
   - Metrics calculation
   - Cache warming

4. **Cache Service** (`services/cache.ts`)
   - Redis-based caching
   - Tag-based invalidation
   - Session management
   - Rate limiting

5. **Metadata Service** (`services/metadata.ts`)
   - IPFS/Arweave storage
   - Multiple provider redundancy
   - Metadata validation
   - Image processing

### Database Schema

The PostgreSQL database uses an event-sourced architecture:

- **Events Table**: Immutable ledger of all blockchain events
- **Current State Projections**: Optimized views for queries
- **User Management**: Reputation and statistics
- **Metadata Cache**: Cached NFT metadata
- **Metrics**: Pre-aggregated analytics

### Blockchain Integration

- **Somnia Testnet**: Primary blockchain network
- **Event Monitoring**: Real-time event subscription
- **EIP-712 Signatures**: Secure off-chain operations
- **Contract Integration**: NFTFlow Core, Payment Streams

## API Endpoints

### Marketplace

- `GET /api/listings` - Get marketplace listings
- `POST /api/listings` - Create listing (EIP-712 signed)
- `GET /api/listings/:id` - Get specific listing

### Users

- `GET /api/users/:address` - Get user profile
- `GET /api/users/:address/listings` - Get user's listings
- `GET /api/users/:address/rentals` - Get user's rentals

### Metadata

- `POST /api/metadata` - Store NFT metadata
- `GET /api/metadata/:cid` - Retrieve metadata

### System

- `GET /api/health` - Health check
- `GET /api/stats` - Platform statistics
- `GET /api/nonce/:address` - Get nonce for signing

## Monitoring

### Prometheus Metrics

Access Prometheus at: http://localhost:9090

Key metrics:
- API request rates and latency
- Database connection pool status
- Redis cache hit/miss ratios
- Blockchain event processing rates

### Grafana Dashboards

Access Grafana at: http://localhost:3000 (admin/admin)

Pre-configured dashboards:
- API Performance
- Database Metrics
- Cache Performance
- Blockchain Events

### Log Aggregation

Access Kibana at: http://localhost:5601

Log sources:
- API server logs
- Event ingestion logs
- Worker service logs
- Database logs

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose logs postgres
   
   # Verify connection string
   echo $DATABASE_URL
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis status
   docker-compose logs redis
   
   # Test Redis connection
   docker-compose exec redis redis-cli ping
   ```

3. **Blockchain Events Not Processing**
   ```bash
   # Check event ingestion logs
   docker-compose logs event-ingest
   
   # Verify RPC endpoints
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     https://dream-rpc.somnia.network/
   ```

4. **IPFS Node Issues**
   ```bash
   # Check IPFS status
   docker-compose logs ipfs-node
   
   # Test IPFS API
   curl http://localhost:5001/api/v0/id
   ```

### Performance Tuning

1. **Database Optimization**
   - Monitor query performance
   - Add indexes for common queries
   - Tune connection pool settings

2. **Cache Optimization**
   - Monitor cache hit ratios
   - Adjust TTL values
   - Implement cache warming

3. **Blockchain Optimization**
   - Use WebSocket connections
   - Implement event batching
   - Add retry logic

## Production Deployment

### AWS Deployment

1. **Infrastructure Setup**
   ```bash
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

2. **Environment Configuration**
   - Set production environment variables
   - Configure secrets in AWS Secrets Manager
   - Set up monitoring and alerting

3. **Deployment Pipeline**
   - Build Docker images
   - Push to ECR
   - Deploy to ECS Fargate
   - Run health checks

### Security Considerations

1. **Network Security**
   - Use VPC with private subnets
   - Configure security groups
   - Enable WAF protection

2. **Data Security**
   - Encrypt data at rest
   - Use TLS for data in transit
   - Implement access controls

3. **Application Security**
   - Input validation
   - Rate limiting
   - Error handling
   - Audit logging

## Contributing

### Development Workflow

1. Create feature branch
2. Implement changes
3. Add tests
4. Run linting and type checking
5. Submit pull request

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Support

For issues and questions:
- Check the troubleshooting section
- Review logs and metrics
- Create GitHub issues
- Join our Discord community

## License

MIT License - see LICENSE file for details.
