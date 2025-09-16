import React from 'react';
import MobileOptimizations from '@/components/MobileOptimizations';

const Mobile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <MobileOptimizations />
      </div>
    </div>
  );
};

export default Mobile;
