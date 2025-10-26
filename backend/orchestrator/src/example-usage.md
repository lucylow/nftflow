# Orchestrator Example Usage

## Quick Start

### 1. Install Dependencies

```bash
cd backend/orchestrator
npm install
```

### 2. Run the Server

```bash
npm run dev
```

### 3. Test the HITL Flow

#### Start a workflow execution:

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

This will return an execution object with an `id` field.

#### Check the execution status:

```bash
curl http://localhost:4010/executions/{executionId}
```

You should see:
- `status: "waiting_approval"` (after AI steps complete)
- `stepResults` containing the AI-generated proposal

#### List all executions:

```bash
curl http://localhost:4010/executions
```

#### Approve the execution:

```bash
curl -X POST http://localhost:4010/executions/{executionId}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approver": "operator1",
    "note": "Price looks good, approved"
  }'
```

#### Or reject it:

```bash
curl -X POST http://localhost:4010/executions/{executionId}/reject \
  -H "Content-Type: application/json" \
  -d '{
    "approver": "operator1",
    "reason": "Price too low for this NFT"
  }'
```

## Integration in Frontend

### Using the ApprovalPanel Component

```tsx
import { ApprovalPanel } from '@/components/orchestrator/ApprovalPanel';

export default function OperatorDashboard() {
  return (
    <div>
      <h1>Workflow Orchestrator</h1>
      <ApprovalPanel />
    </div>
  );
}
```

### Custom Implementation

If you want to integrate the orchestrator into your existing components:

```tsx
import { useState } from 'react';
import axios from 'axios';

function MyApprovalUI() {
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    const res = await axios.get('http://localhost:4010/executions');
    setExecutions(res.data.filter(e => e.status === 'waiting_approval'));
  };

  const handleApprove = async (id: string) => {
    await axios.post(`http://localhost:4010/executions/${id}/approve`, {
      approver: 'current-user',
      note: 'Approved'
    });
    fetchExecutions();
  };

  return (
    <div>
      {executions.map(exec => (
        <div key={exec.id}>
          <h3>Execution {exec.id}</h3>
          <button onClick={() => handleApprove(exec.id)}>Approve</button>
          <button onClick={() => handleReject(exec.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

## Advanced: Adding New Workflows

Create a new workflow in `src/workflows.ts`:

```typescript
export const MyCustomWorkflow: Workflow = {
  id: "my-custom-workflow",
  name: "My Custom Workflow",
  description: "Does something awesome",
  humanApprovalRequired: true, // Enable HITL
  steps: [
    {
      id: "step1",
      name: "First Step",
      action: "my_action",
      agent: "MyAgent",
      parameters: {}
    },
    {
      id: "step2",
      name: "Second Step (requires approval)",
      action: "finalize_onchain",
      agent: "Orchestrator",
      parameters: {}
    }
  ]
};
```

Add it to `AllWorkflows` array in the same file.

## Monitoring

Check the orchestrator logs to see:
- Workflow execution progress
- Step completions
- Approval requests
- Finalization results

The orchestrator emits events you can listen to:
- `workflow:approval_required`
- `workflow:completed`
- `workflow:failed`
- `workflow:rejected`

