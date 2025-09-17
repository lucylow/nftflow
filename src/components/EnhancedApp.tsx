import React, { useState, useEffect } from 'react';
import { Web3Provider } from '../contexts/Web3Context';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AchievementProvider } from '../contexts/AchievementContext';
import { ErrorProvider, ErrorDisplay, useErrorContext } from './ErrorHandler';
import { AccessibilityProvider, LiveRegion } from './Accessibility';
import { WalletConnection } from './WalletConnection';
import OnboardingTour from './OnboardingTour';
import { useIsMobile, MobileNav, MobileSearch, MobileFilter, ResponsiveGrid } from './MobileLayout';
import { NFTSkeleton, LoadingOverlay, AsyncLoadingState } from './LoadingStates';
import Marketplace from './Marketplace';
import UserProfile from './UserProfile';

// Main app content component
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    collection: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'price-asc'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  
  const isMobile = useIsMobile();
  const { error, clearError } = useErrorContext();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAnnouncement('Welcome to NFTFlow! Start exploring NFTs you can rent.');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setAnnouncement(`Searching for: ${query}`);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAnnouncement('Filters applied successfully');
  };

  const handleClearFilters = () => {
    setFilters({
      collection: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'price-asc'
    });
    setAnnouncement('Filters cleared');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return (
          <div className="browse-section">
            <div className="section-header">
              <h1>Browse NFTs</h1>
              {isMobile ? (
                <MobileSearch onSearch={handleSearch} />
              ) : (
                <div className="desktop-search">
                  <input
                    type="text"
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              )}
            </div>
            
            <div className="filters-section">
              {isMobile ? (
                <MobileFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onApplyFilters={handleApplyFilters}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div className="desktop-filters">
                  <select
                    value={filters.collection}
                    onChange={(e) => handleFilterChange('collection', e.target.value)}
                  >
                    <option value="">All Collections</option>
                    <option value="space-adventures">Space Adventures</option>
                    <option value="cyber-dreams">Cyber Dreams</option>
                  </select>
                </div>
              )}
            </div>

            <ResponsiveGrid>
              <AsyncLoadingState
                isLoading={isLoading}
                error={null}
                loadingComponent={<NFTSkeleton count={isMobile ? 2 : 4} />}
              >
                <Marketplace />
              </AsyncLoadingState>
            </ResponsiveGrid>
          </div>
        );
      
      case 'rent':
        return (
          <div className="rent-section">
            <h1>My Rentals</h1>
            <div className="rental-status">
              <p>No active rentals</p>
              <button className="primary-button">Browse NFTs to Rent</button>
            </div>
          </div>
        );
      
      case 'profile':
        return <UserProfile />;
      
      default:
        return (
          <div className="home-section">
            <div className="hero-section">
              <h1>Welcome to NFTFlow</h1>
              <p>Rent NFTs instantly on the Somnia network. No need to buy - just rent and enjoy!</p>
              <div className="hero-actions">
                <button 
                  className="primary-button"
                  onClick={() => setActiveTab('browse')}
                >
                  Start Browsing
                </button>
                <button className="secondary-button">
                  Learn More
                </button>
              </div>
            </div>

            <div className="featured-section">
              <h2>Featured NFTs</h2>
              <ResponsiveGrid>
                <AsyncLoadingState
                  isLoading={isLoading}
                  error={null}
                  loadingComponent={<NFTSkeleton count={isMobile ? 2 : 4} />}
                >
                  <Marketplace />
                </AsyncLoadingState>
              </ResponsiveGrid>
            </div>

            <div className="security-badge">
              <h3>🔒 Secure & Transparent</h3>
              <p>All transactions are secured by blockchain technology</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">NFTFlow</h1>
          <div className="header-actions">
            <WalletConnection />
          </div>
        </div>
      </header>

      <main id="main-content" className="app-main">
        <OnboardingTour />
        {renderContent()}
      </main>

      {isMobile && (
        <MobileNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}

      {/* Global error display */}
      <ErrorDisplay 
        error={error} 
        onDismiss={clearError}
        showDetails={process.env.NODE_ENV === 'development'}
      />

      {/* Live region for announcements */}
      <LiveRegion message={announcement} />

      {/* Loading overlay */}
      <LoadingOverlay 
        isVisible={isLoading && activeTab === 'home'} 
        message="Loading NFTFlow..."
      />
    </div>
  );
};

// Main enhanced app component
const EnhancedApp: React.FC = () => {
  return (
    <Web3Provider>
      <ThemeProvider>
        <AchievementProvider>
          <ErrorProvider>
            <AccessibilityProvider>
              <AppContent />
            </AccessibilityProvider>
          </ErrorProvider>
        </AchievementProvider>
      </ThemeProvider>
    </Web3Provider>
  );
};

export default EnhancedApp;