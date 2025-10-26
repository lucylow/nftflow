# Human-in-the-Loop (HITL) Approval Implementation

## Overview

This implementation adds a complete Human-in-the-Loop approval system to the NFTFlow autonomous workflow orchestrator. It ensures that all AI-driven workflows requiring critical on-chain actions must be approved by human operators before execution.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Workflow Orchestrator                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Intelligent Listing Workflow                            │    │
│  │                                                           │    │
│  │  1. Gather Metadata (AI Agent)                          │    │
│  │  2. Market Analysis (AI Agent)                          │    │
│  │  3. Generate Proposal (AI Agent)                        │    │
│  │  4. ⏸ WAITING FOR APPROVAL (Human Checkpoint)          │    │
│  │  5. Finalize On-Chain (only after approval)             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Operator UI  │
                    │  (Approve or │
                    │   Reject)     │
                    └───────────────┘
```

## Key Components

### 1. Backend Orchestrator (`backend/orchestrator/`)

- **orchestrator.ts**: Core workflow execution engine with HITL pause logic
- **workflows.ts**: Workflow definitions with `humanApprovalRequired` flag
- **storage.ts**: File-based storage for executions (replaceable with DB)
- **routes/executions.ts**: REST API for approval/rejection
- **blockchain.ts**: Safe on-chain execution (dry-run by default)

### 2. Frontend Components (`src/components/orchestrator/`)

- **ApprovalPanel.tsx**: Operator UI to review and approve/reject executions
- **ExecutionList.tsx**: List view of all executions

## How It Works

### Workflow Execution Flow

1. **Start Execution**: `POST /start/:workflowId` with context data
2. **AI Steps Run**: Agents execute their steps autonomously
3. **HITL Checkpoint**: Before final step, if `humanApprovalRequired === true`:
   - Execution enters `waiting_approval` state
   - Operator is notified
   - Workflow pauses
4. **Human Review**: Operator reviews proposal in UI
5. **Approval/Rejection**:
   - **Approve**: Final on-chain action executes
   - **Reject**: Execution marked as failed, no action taken

### Example: Intelligent Listing Workflow

```typescript
const IntelligentListing: Workflow = {
  id: "intelligent-listing",
  humanApprovalRequired: true, // ← HITL enabled
  steps: [
    { action: "gather_metadata", agent: "DataAggregator" },
    { action: "pricing_analysis", agent: "PricingAgent" },
    { action: "generate_proposal", agent: "MatchmakerAgent" },
    { action: "finalize_onchain", agent: "Orchestrator" } // ← Requires approval
  ]
};
```

When execution reaches the last step:
- AI has generated: NFT metadata, price suggestion, listing proposal
- Execution pauses in `waiting_approval` status
- Operator sees proposal in approval UI
- Operator reviews and decides: approve → lists on-chain, reject → stops

## API Endpoints

### Start Workflow

```bash
POST /start/:workflowId
Body: { "context": { "nftContract": "0x...", "tokenId": "1" } }
```

### List Executions

```bash
GET /executions
```

### Approve Execution

```bash
POST /executions/:id/approve
Body: { "approver": "operator1", "note": "Approved" }
```

### Reject Execution

```bash
POST /executions/:id/reject
Body: { "approver": "operator1", "reason": "Price too low" }
```

## Usage Example

### 1. Start a Workflow

```bash
curl -X POST http://localhost:4010/start/intelligent-listing \
  -H "Content-Type: application/json" \
  -d '{"context": {"nftContract": "0x...", "tokenId": "1"}}'
```

### 2. Check Status

```bash
curl http://localhost:4010/executions/{executionId}
```

Response will show `status: "waiting_approval"` after AI steps complete.

### 3. Approve in UI

Navigate to the `ApprovalPanel` component, review the proposal, and click Approve.

### 4. Result

If approved, the final on-chain action executes. If rejected, execution stops.

## Security Considerations

⚠️ **Important for Production:**

1. **Never use raw private keys** in production. Use Gnosis Safe multisig or Timelock.
2. **Add authentication** to approval endpoints (JWT/OAuth).
3. **Implement RBAC** - restrict who can approve/reject.
4. **Audit logging** - store all agent decisions and approvals with IPFS CIDs.
5. **Replace file storage** with Postgres + Prisma for ACID guarantees.

The current implementation uses:
- File-based storage (prototype only)
- Dry-run blockchain execution (safe for testing)
- No authentication on API endpoints (add before production)

## Integration

### Add to Your App

```tsx
import { ApprovalPanel } from '@/components/orchestrator/ApprovalPanel';

function OperatorDashboard() {
  return <ApprovalPanel />;
}
```

### Customize Workflows

Edit `backend/orchestrator/src/workflows.ts` to add new workflows:

```typescript
export const MyNewWorkflow: Workflow = {
  id: "my-new-workflow",
  humanApprovalRequired: true,
  steps: [
    // Define your steps
  ]
};
```

## Extension Ideas

1. **DAO Voting**: Replace single approver with governance token voting
2. **Multi-Approver**: Require N-of-M approvers for high-value actions
3. **Time-Limited**: Auto-reject if not approved within N hours
4. **Evidence Storage**: Link IPFS CIDs of agent reasoning to executions
5. **Slack/Discord Integration**: Notify approvers via webhooks

## Files Created

```
backend/orchestrator/
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── src/
│   ├── index.ts             # Express server entry point
│   ├── orchestrator.ts      # Core workflow engine
│   ├── workflows.ts         # Workflow definitions
│   ├── storage.ts           # File-based storage
│   ├── types.ts             # TypeScript types
│   ├── notify.ts            # Notification helpers
│   ├── blockchain.ts        # On-chain execution
│   └── routes/
│       └── executions.ts    # REST endpoints
└── data/                    # Generated at runtime
    └── executions.json      # Execution storage

src/components/orchestrator/
├── ApprovalPanel.tsx        # Operator approval UI
└── ExecutionList.tsx        # Execution list view
```

## Getting Started

```bash
# 1. Install dependencies
cd backend/orchestrator
npm install

# 2. Start server
npm run dev

# 3. Start a workflow
curl -X POST http://localhost:4010/start/intelligent-listing \
  -H "Content-Type: application/json" \
  -d '{"context": {"nftContract": "0x...", "tokenId": "1"}}'

# 4. View in UI
# Add <ApprovalPanel /> to your operator dashboard
```

## Summary

This implementation provides:
✅ Complete HITL approval flow  
✅ Safe operator review interface  
✅ REST API for approval/rejection  
✅ Extensible workflow system  
✅ Ready for production upgrades (DB, auth, multisig)

The orchestrator is now ready to demonstrate at hackathons while being architected for real-world deployment.

