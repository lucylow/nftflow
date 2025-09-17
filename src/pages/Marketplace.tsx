import React from 'react';
import { RentalMarketplace } from '@/components/RentalMarketplace';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">NFT Rental Marketplace</h1>
          <p className="text-gray-300 text-lg">
            Discover and rent NFTs by the second on Somnia Network
          </p>
        </div>
        <RentalMarketplace />
      </div>
    </div>
  );
}
