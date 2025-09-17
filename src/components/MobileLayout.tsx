import React, { useState, useEffect } from 'react';

// Hook to detect mobile devices
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

// Hook to detect tablet devices
export const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTablet;
};

// Hook to detect device orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
};

// Mobile-friendly navigation
interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'browse', label: 'Browse', icon: '🔍' },
    { id: 'rent', label: 'Rent', icon: '🔄' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];
  
  return (
    <div className="mobile-nav">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={`Navigate to ${tab.label}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// Mobile-optimized NFT card
interface MobileNFTCardProps {
  nft: {
    id: string;
    name: string;
    collection: string;
    image: string;
    pricePerHour: string;
    isRentable: boolean;
  };
  onRent: () => void;
}

export const MobileNFTCard: React.FC<MobileNFTCardProps> = ({ nft, onRent }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="mobile-nft-card">
      <div className="nft-image-container">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">
            <div className="placeholder-spinner"></div>
          </div>
        )}
        <img 
          src={nft.image} 
          alt={nft.name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        {imageError && (
          <div className="image-error">
            <span>🖼️</span>
            <span>Image unavailable</span>
          </div>
        )}
      </div>
      
      <div className="nft-details">
        <div className="nft-header">
          <h3 className="nft-name">{nft.name}</h3>
          <span className="nft-collection">{nft.collection}</span>
        </div>
        
        <div className="nft-price">
          <span className="price-label">Price:</span>
          <span className="price-value">{nft.pricePerHour} STT/hour</span>
        </div>
        
        <button 
          className={`rent-btn-mobile ${!nft.isRentable ? 'disabled' : ''}`}
          onClick={onRent}
          disabled={!nft.isRentable}
        >
          {nft.isRentable ? 'Rent Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

// Mobile drawer component
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{title}</h3>
          <button 
            onClick={onClose}
            className="drawer-close"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile search component
interface MobileSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const MobileSearch: React.FC<MobileSearchProps> = ({ 
  onSearch, 
  placeholder = "Search NFTs..." 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className={`mobile-search ${isFocused ? 'focused' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </div>
      </form>
    </div>
  );
};

// Mobile filter component
interface MobileFilterProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const MobileFilter: React.FC<MobileFilterProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="mobile-filter-toggle"
        onClick={() => setIsOpen(true)}
      >
        🔧 Filters
      </button>

      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter NFTs"
      >
        <div className="mobile-filters">
          <div className="filter-group">
            <label>Collection</label>
            <select 
              value={filters.collection || ''}
              onChange={(e) => onFilterChange('collection', e.target.value)}
            >
              <option value="">All Collections</option>
              <option value="space-adventures">Space Adventures</option>
              <option value="cyber-dreams">Cyber Dreams</option>
              <option value="mystic-guardians">Mystic Guardians</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range (STT/hour)</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={filters.sortBy || 'price-asc'}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="recent">Recently Listed</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="filter-actions">
            <button 
              className="apply-filters-btn"
              onClick={() => {
                onApplyFilters();
                setIsOpen(false);
              }}
            >
              Apply Filters
            </button>
            <button 
              className="clear-filters-btn"
              onClick={() => {
                onClearFilters();
                setIsOpen(false);
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      </MobileDrawer>
    </>
  );
};

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const getGridClass = () => {
    if (isMobile) return 'grid-mobile';
    if (isTablet) return 'grid-tablet';
    return 'grid-desktop';
  };

  return (
    <div className={`responsive-grid ${getGridClass()} ${className}`}>
      {children}
    </div>
  );
};
