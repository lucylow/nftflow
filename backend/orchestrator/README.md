# NFTFlow Orchestrator

An autonomous workflow orchestrator with Human-in-the-Loop (HITL) approval for NFTFlow.

## Overview

This orchestrator manages AI-driven workflows that require human approval before executing critical on-chain actions. It enables:

- **Autonomous execution** of workflow steps by AI agents
- **HITL approval gates** before irreversible operations
- **Operator review** and approve/reject functionality
- **Full audit trail** of agent decisions and approvals

## Architecture

```
Workflow → AI Agents → HITL Checkpoint → On-Chain Action
                    ↓
               Waiting Approval
                    ↓
            Operator Review → Approve/Reject
```

## Setup

### 1. Install Dependencies

```bash
cd backend/orchestrator
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4010`

## API Endpoints

### Start Workflow Execution

```bash
POST /start/:workflowId
Content-Type: application/json

{
  "context": {
    "nftContract": "0x...",
    "tokenId": "1"
  }
}
```

### Get All Executions

```bash
GET /executions
```

### Get Specific Execution

```bash
GET /executions/:id
```

### Approve Execution

```bash
POST /executions/:id/approve
Content-Type: application/json

{
  "approver": "operator1",
  "note": "Looks good, approved"
}
```

### Reject Execution

```bash
POST /executions/:id/reject
Content-Type: application/json

{
  "approver": "operator1",
  "reason": "Price too low"
}
```

## Workflows

### Intelligent Listing

A workflow that:
1. Gathers NFT metadata
2. Analyzes market pricing
3. Generates listing proposal
4. **Waits for human approval**
5. Lists on-chain

## Security Notes

⚠️ **Important for Production:**

1. **Multisig Required**: Never use a raw private key (`AGENT_PRIVATE_KEY`) in production. Use Gnosis Safe or Timelock contracts.

2. **Authentication**: Add JWT/OAuth authentication to all approval endpoints.

3. **Role-Based Access**: Implement RBAC to restrict who can approve/reject.

4. **Audit Logging**: Store all agent decisions, approvals, and on-chain transactions with IPFS CIDs.

5. **Database**: Replace file storage with Postgres + Prisma for ACID guarantees.

## Example Usage

### 1. Start a workflow

```bash
curl -X POST http://localhost:4010/start/intelligent-listing \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "nftContract": "0xabc...",
      "tokenId": "1"
    }
  }'
```

### 2. Check pending approvals

```bash
curl http://localhost:4010/executions
```

### 3. Approve an execution

```bash
curl -X POST http://localhost:4010/executions/{executionId}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approver": "operator1",
    "note": "Approved pricing"
  }'
```

## Integration with Frontend

Use the `ApprovalPanel` component in your React app:

```tsx
import { ApprovalPanel } from './components/orchestrator/ApprovalPanel';

function OperatorDashboard() {
  return <ApprovalPanel />;
}
```

## Extension Ideas

1. **DAO Voting**: Replace single approver with on-chain governance voting
2. **Time Limits**: Auto-reject if not approved within N hours
3. **Multi-Step Approval**: Require multiple approvers for high-value actions
4. **Evidence Storage**: Store IPFS CIDs of agent reasoning in execution audit trail

## Development

```bash
# Build
npm run build

# Start production
npm start
```

## License

MIT

