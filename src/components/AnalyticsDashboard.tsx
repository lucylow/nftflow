import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context-minimal';

interface AnalyticsData {
  userStats: {
    totalRentals: number;
    successfulRentals: number;
    totalEarned: number;
    totalSpent: number;
    averageRentalDuration: number;
    reputationScore: number;
    currentStreak: number;
  };
  platformStats: {
    totalListings: number;
    activeListings: number;
    totalRentals: number;
    activeRentals: number;
    completedRentals: number;
    totalVolume: number;
    uniqueUsers: number;
    averageRentalPrice: number;
  };
  defiStats: {
    totalStaked: number;
    totalLiquidity: number;
    totalRewards: number;
    apy: number;
  };
  communityStats: {
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
    activeUsers: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

const AnalyticsDashboard: React.FC = () => {
  const { account: address } = useWeb3();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'platform' | 'defi' | 'community'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/dashboard?timeframe=${selectedTimeframe}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalyticsData(data);
      } else {
        console.error('Error fetching analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="skeleton h-10 w-32"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="skeleton h-4 w-24 mb-2"></div>
                <div className="skeleton h-8 w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No Analytics Data</h2>
        <p className="text-gray-500">Analytics data is not available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        <div className="flex gap-2">
          <select 
            className="select select-bordered select-sm"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'user' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          User Stats
        </button>
        <button 
          className={`tab ${activeTab === 'platform' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('platform')}
        >
          Platform Stats
        </button>
        <button 
          className={`tab ${activeTab === 'defi' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('defi')}
        >
          DeFi Stats
        </button>
        <button 
          className={`tab ${activeTab === 'community' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Community Stats
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Volume</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(analyticsData.platformStats.totalVolume)}
                </p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Active Rentals</h3>
                <p className="text-2xl font-bold text-success">
                  {formatNumber(analyticsData.platformStats.activeRentals)}
                </p>
                <p className="text-sm text-gray-500">Currently active</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Unique Users</h3>
                <p className="text-2xl font-bold text-info">
                  {formatNumber(analyticsData.platformStats.uniqueUsers)}
                </p>
                <p className="text-sm text-gray-500">Total users</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Success Rate</h3>
                <p className="text-2xl font-bold text-warning">
                  {formatPercentage(
                    (analyticsData.platformStats.completedRentals / 
                     analyticsData.platformStats.totalRentals) * 100
                  )}
                </p>
                <p className="text-sm text-gray-500">Completed rentals</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Rental Volume Trend</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Rental volume over time
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">User Growth</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - User growth over time
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Stats Tab */}
      {activeTab === 'user' && address && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Your Rentals</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatNumber(analyticsData.userStats.totalRentals)}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.userStats.successfulRentals} successful
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Earned</h3>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(analyticsData.userStats.totalEarned)}
                </p>
                <p className="text-sm text-gray-500">From rentals</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Reputation Score</h3>
                <p className="text-2xl font-bold text-warning">
                  {analyticsData.userStats.reputationScore}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.userStats.currentStreak} day streak
                </p>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Your Rental History</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart placeholder - Your rental activity over time
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Stats Tab */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Listings</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatNumber(analyticsData.platformStats.totalListings)}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.platformStats.activeListings} active
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Completed Rentals</h3>
                <p className="text-2xl font-bold text-success">
                  {formatNumber(analyticsData.platformStats.completedRentals)}
                </p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Average Price</h3>
                <p className="text-2xl font-bold text-info">
                  {formatCurrency(analyticsData.platformStats.averageRentalPrice)}
                </p>
                <p className="text-sm text-gray-500">Per rental</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Platform Health</h3>
                <p className="text-2xl font-bold text-warning">98.5%</p>
                <p className="text-sm text-gray-500">Uptime</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Listing Categories</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - NFT categories distribution
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Rental Duration</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Average rental duration
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DeFi Stats Tab */}
      {activeTab === 'defi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Staked</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(analyticsData.defiStats.totalStaked)}
                </p>
                <p className="text-sm text-gray-500">Across all pools</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Liquidity</h3>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(analyticsData.defiStats.totalLiquidity)}
                </p>
                <p className="text-sm text-gray-500">In DEX pools</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Rewards</h3>
                <p className="text-2xl font-bold text-info">
                  {formatCurrency(analyticsData.defiStats.totalRewards)}
                </p>
                <p className="text-sm text-gray-500">Distributed</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Average APY</h3>
                <p className="text-2xl font-bold text-warning">
                  {formatPercentage(analyticsData.defiStats.apy)}
                </p>
                <p className="text-sm text-gray-500">Across protocols</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Staking Pools</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Staking pool distribution
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Yield Farming</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Yield farming performance
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Stats Tab */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Posts</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatNumber(analyticsData.communityStats.totalPosts)}
                </p>
                <p className="text-sm text-gray-500">Community content</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Comments</h3>
                <p className="text-2xl font-bold text-success">
                  {formatNumber(analyticsData.communityStats.totalComments)}
                </p>
                <p className="text-sm text-gray-500">User interactions</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Total Likes</h3>
                <p className="text-2xl font-bold text-info">
                  {formatNumber(analyticsData.communityStats.totalLikes)}
                </p>
                <p className="text-sm text-gray-500">Engagement</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Active Users</h3>
                <p className="text-2xl font-bold text-warning">
                  {formatNumber(analyticsData.communityStats.activeUsers)}
                </p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Post Types</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Post type distribution
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Engagement Trends</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart placeholder - Community engagement over time
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;