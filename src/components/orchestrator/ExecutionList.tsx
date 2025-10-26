// frontend/src/components/orchestrator/ExecutionList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

type Execution = {
  id: string;
  workflowId: string;
  status: string;
  createdAt: string;
};

export const ExecutionList: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4010/executions");
      setExecutions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch executions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>All Executions</h3>
      <button onClick={fetchExecutions}>Refresh</button>
      {loading && <div>Loading…</div>}
      {executions.length === 0 && <div>No executions</div>}
      <div>
        {executions.map((e) => (
          <div key={e.id} style={{ border: "1px solid #eee", padding: 12, margin: 8 }}>
            <div><strong>ID:</strong> {e.id}</div>
            <div><strong>Workflow:</strong> {e.workflowId}</div>
            <div><strong>Status:</strong> {e.status}</div>
            <div><strong>Created:</strong> {new Date(e.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

