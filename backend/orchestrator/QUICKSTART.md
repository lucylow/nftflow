# Quick Start Guide

## Installation

```bash
cd backend/orchestrator
npm install
```

## Run the Server

```bash
npm run dev
```

Server will start on `http://localhost:4010`

## Test the HITL Flow

### 1. Start a Workflow Execution

```bash
curl -X POST http://localhost:4010/start/intelligent-listing \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "nftContract": "0x1234567890123456789012345678901234567890",
      "tokenId": "1"
    }
  }'
```

Save the `id` from the response.

### 2. Check Execution Status

```bash
curl http://localhost:4010/executions/{executionId}
```

Status will be:
- `pending` → `running` → `waiting_approval`

### 3. Approve the Execution

```bash
curl -X POST http://localhost:4010/executions/{executionId}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approver": "operator1",
    "note": "Approved"
  }'
```

### 4. Or Reject It

```bash
curl -X POST http://localhost:4010/executions/{executionId}/reject \
  -H "Content-Type: application/json" \
  -d '{
    "approver": "operator1",
    "reason": "Price too low"
  }'
```

## Frontend Integration

Add the approval panel to your app:

```tsx
// In your router or page
import { ApprovalPanel } from '@/components/orchestrator/ApprovalPanel';

<ApprovalPanel />
```

Or use the full dashboard:

```tsx
import OrchestratorDashboard from '@/pages/OrchestratorDashboard';

<OrchestratorDashboard />
```

## How It Works

1. **Workflow starts** → AI agents run their steps
2. **HITL checkpoint** → Execution pauses for approval
3. **Operator reviews** → Sees proposal in UI
4. **Approve/Reject** → Final action or stop

## Key Files

- `src/orchestrator.ts` - Core workflow engine
- `src/workflows.ts` - Workflow definitions
- `src/routes/executions.ts` - API endpoints
- `frontend/ApprovalPanel.tsx` - Operator UI

See `README.md` for full documentation.

