import React from 'react';
import SubgraphDashboardMock from '@/components/SubgraphDashboardMock';

const SubgraphDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <SubgraphDashboardMock />
      </div>
    </div>
  );
};

export default SubgraphDashboard;
