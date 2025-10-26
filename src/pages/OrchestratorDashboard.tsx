import React from 'react';
import { ApprovalPanel } from '@/components/orchestrator/ApprovalPanel';
import { ExecutionList } from '@/components/orchestrator/ExecutionList';

export default function OrchestratorDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Workflow Orchestrator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ApprovalPanel />
        </div>
        
        <div>
          <ExecutionList />
        </div>
      </div>
    </div>
  );
}

