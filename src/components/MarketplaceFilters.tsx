import React from 'react';

interface Filters {
  collection: string | null;
  priceRange: [number, number];
  traits: string[];
  sortBy: string;
}

interface MarketplaceFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({ filters, onFiltersChange }) => {
  const collections = [
    'Space Adventures',
    'Cyber Dreams',
    'Cyber Warriors',
    'Mystic Guardians',
    'Pixel Art Masters',
    'Quantum Realms'
  ];

  const traits = [
    'Rare', 'Epic', 'Legendary', 'Mythic',
    'Space', 'Digital', 'Neon', 'Crystal',
    'Explorer', 'Warrior', 'Guardian', 'Artist'
  ];

  const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'recent', label: 'Recently Listed' },
    { value: 'uptime', label: 'Uptime: High to Low' }
  ];

  const handleCollectionChange = (collection: string) => {
    onFiltersChange({
      ...filters,
      collection: filters.collection === collection ? null : collection
    });
  };

  const handleTraitToggle = (trait: string) => {
    const newTraits = filters.traits.includes(trait)
      ? filters.traits.filter(t => t !== trait)
      : [...filters.traits, trait];
    
    onFiltersChange({
      ...filters,
      traits: newTraits
    });
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.priceRange];
    newRange[index] = value;
    onFiltersChange({
      ...filters,
      priceRange: newRange
    });
  };

  return (
    <div className="mb-8 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Collection Filter */}
        <div>
          <h3 className="font-semibold mb-3">Collection</h3>
          <div className="space-y-2">
            {collections.map((collection) => (
              <label key={collection} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.collection === collection}
                  onChange={() => handleCollectionChange(collection)}
                  className="mr-2 rounded"
                />
                <span className="text-sm">{collection}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className="font-semibold mb-3">Price Range (STT/sec)</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceRangeChange(1, parseFloat(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="text-xs text-gray-500">
              Range: {filters.priceRange[0]} - {filters.priceRange[1]} STT/sec
            </div>
          </div>
        </div>

        {/* Traits Filter */}
        <div>
          <h3 className="font-semibold mb-3">Traits</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {traits.map((trait) => (
              <label key={trait} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.traits.includes(trait)}
                  onChange={() => handleTraitToggle(trait)}
                  className="mr-2 rounded"
                />
                <span className="text-sm">{trait}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="font-semibold mb-3">Sort By</h3>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.collection || filters.traits.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.collection && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Collection: {filters.collection}
              </span>
            )}
            {filters.traits.map((trait) => (
              <span key={trait} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {trait}
              </span>
            ))}
            <button
              onClick={() => onFiltersChange({
                collection: null,
                priceRange: [0, 100],
                traits: [],
                sortBy: 'price-asc'
              })}
              className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceFilters;
