import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
        <p className="text-xl mb-8">Manage your NFTs, track rentals, and view analytics</p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors">
            My NFTs
          </button>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold transition-colors">
            Rental History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
