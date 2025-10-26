// frontend/src/components/orchestrator/ApprovalPanel.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

type Execution = {
  id: string;
  workflowId: string;
  status: string;
  currentStepIndex: number;
  stepResults: any;
  humanApproval?: any;
  createdAt: string;
};

export const ApprovalPanel: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Execution | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4010/executions");
      setExecutions((res.data || []).filter((e: Execution) => e.status === "waiting_approval"));
    } catch (error) {
      console.error("Failed to fetch executions:", error);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    try {
      const res = await axios.post(`http://localhost:4010/executions/${id}/approve`, { 
        approver: "operator1", 
        note: comment 
      });
      alert("Approved: " + JSON.stringify(res.data));
      fetchExecutions();
      setSelected(null);
    } catch (err: any) {
      alert("Approve failed: " + (err.response?.data?.error || err.message));
    }
  };

  const reject = async (id: string) => {
    try {
      const res = await axios.post(`http://localhost:4010/executions/${id}/reject`, { 
        approver: "operator1", 
        reason: comment 
      });
      alert("Rejected: " + JSON.stringify(res.data));
      fetchExecutions();
      setSelected(null);
    } catch (err: any) {
      alert("Reject failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Pending Approvals</h3>
      {loading && <div>Loading…</div>}
      {executions.length === 0 && <div>No pending approvals</div>}
      <div>
        {executions.map((e) => (
          <div key={e.id} style={{ border: "1px solid #eee", padding: 12, margin: 8 }}>
            <div><strong>ID:</strong> {e.id}</div>
            <div><strong>Workflow:</strong> {e.workflowId}</div>
            <div><strong>Created:</strong> {new Date(e.createdAt).toLocaleString()}</div>
            <button onClick={() => setSelected(e)}>View</button>
            <button onClick={() => approve(e.id)} style={{ marginLeft: 8 }}>Approve</button>
            <button onClick={() => reject(e.id)} style={{ marginLeft: 8 }}>Reject</button>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 20 }}>
          <h4>Execution details</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(selected, null, 2)}</pre>
          <textarea 
            value={comment} 
            onChange={(ev) => setComment(ev.target.value)} 
            placeholder="Add comment / note" 
          />
          <div>
            <button onClick={() => approve(selected.id)}>Approve</button>
            <button onClick={() => reject(selected.id)} style={{ marginLeft: 8 }}>Reject</button>
            <button onClick={() => setSelected(null)} style={{ marginLeft: 8 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

