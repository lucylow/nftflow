import React, { useState } from 'react';
import { useDataAdapter } from '../hooks/useDataAdapter';
import NFTCard from './NFTCard';
import MarketplaceFilters from './MarketplaceFilters';

interface Filters {
  collection: string | null;
  priceRange: [number, number];
  traits: string[];
  sortBy: string;
}

const Marketplace: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    collection: null,
    priceRange: [0, 100],
    traits: [],
    sortBy: 'price-asc',
  });
  
  const { data: nfts, isLoading, isUsingMock, setIsUsingMock } = useDataAdapter('marketplace');

  const filteredNFTs = nfts.filter(nft => {
    // Apply filters
    if (filters.collection && nft.collection !== filters.collection) return false;
    if (nft.pricePerSecond < filters.priceRange[0] || nft.pricePerSecond > filters.priceRange[1]) return false;
    if (filters.traits.length > 0 && !filters.traits.some(trait => nft.traits.includes(trait))) return false;
    return true;
  }).sort((a, b) => {
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        return a.pricePerSecond - b.pricePerSecond;
      case 'price-desc':
        return b.pricePerSecond - a.pricePerSecond;
      case 'recent':
        return new Date(b.listDate).getTime() - new Date(a.listDate).getTime();
      case 'uptime':
        return (b.uptimePercentage || 0) - (a.uptimePercentage || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NFT Marketplace
        </h1>
        
        <div className="flex items-center gap-4">
          {isUsingMock && (
            <button
              onClick={() => setIsUsingMock(false)}
              className="px-4 py-2 text-sm bg-amber-100 text-amber-800 rounded-full flex items-center gap-2 hover:bg-amber-200 transition-colors"
            >
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Using Mock Data - Switch to Real Data
            </button>
          )}
          
          <div className="text-sm text-gray-600">
            {filteredNFTs.length} NFT{filteredNFTs.length !== 1 ? 's' : ''} available
          </div>
        </div>
      </div>

      <MarketplaceFilters filters={filters} onFiltersChange={setFilters} />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredNFTs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => (
            <NFTCard key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No NFTs found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results</p>
          <button
            onClick={() => setFilters({
              collection: null,
              priceRange: [0, 100],
              traits: [],
              sortBy: 'price-asc'
            })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
