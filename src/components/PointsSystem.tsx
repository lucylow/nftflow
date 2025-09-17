import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  reward_data: any;
  available_quantity: number;
}

interface UserPoints {
  user_address: string;
  points_balance: number;
  points_earned_total: number;
  tier: string;
  tier_level: number;
  discount_percentage: number;
  total_transactions: number;
  rewards_redeemed: number;
}

interface PointsSystemProps {
  showRewards?: boolean;
  compact?: boolean;
}

const PointsSystem: React.FC<PointsSystemProps> = ({ 
  showRewards = true, 
  compact = false 
}) => {
  const { address } = useAccount();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);

  useEffect(() => {
    if (address) {
      fetchPoints();
      if (showRewards) {
        fetchRewards();
      }
    }
  }, [address, showRewards]);

  const fetchPoints = async () => {
    try {
      const response = await fetch(`/api/loyalty/balance/${address}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserPoints(data);
      } else {
        console.error('Error fetching points:', data.error);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/loyalty/rewards');
      const data = await response.json();
      
      if (response.ok) {
        setRewards(data);
      } else {
        console.error('Error fetching rewards:', data.error);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const redeemReward = async (rewardId: number) => {
    try {
      setIsRedeeming(rewardId);
      
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reward_id: rewardId })
      });
      
      if (response.ok) {
        // Show success message
        alert('Reward redeemed successfully!');
        
        // Refresh points balance
        await fetchPoints();
        
        // Refresh rewards to update availability
        if (showRewards) {
          await fetchRewards();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Error redeeming reward. Please try again.');
    } finally {
      setIsRedeeming(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-orange-500';
      case 'SILVER': return 'text-gray-400';
      case 'GOLD': return 'text-yellow-500';
      case 'PLATINUM': return 'text-blue-500';
      case 'DIAMOND': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return '🥉';
      case 'SILVER': return '🥈';
      case 'GOLD': return '🥇';
      case 'PLATINUM': return '💎';
      case 'DIAMOND': return '💠';
      default: return '⭐';
    }
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'TOKEN_AIRDROP': return '🪙';
      case 'NFT_AIRDROP': return '🖼️';
      case 'DISCOUNT_CODE': return '🎫';
      case 'PREMIUM_FEATURES': return '⭐';
      case 'CUSTOM_REWARD': return '🎁';
      default: return '🎁';
    }
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="skeleton h-6 w-32 mb-4"></div>
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-16 rounded-full"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-24 mb-2"></div>
              <div className="skeleton h-4 w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userPoints) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No Points Data</h3>
            <p className="text-gray-500">Start earning points by using NFTFlow!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-xl ${compact ? 'max-w-sm' : ''}`}>
      <div className="card-body">
        <h2 className="card-title">Your Loyalty Points</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-primary">{userPoints.points_balance}</span>
            <span className="text-sm text-gray-500">Points</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`text-2xl ${getTierColor(userPoints.tier)}`}>
              {getTierIcon(userPoints.tier)}
            </div>
            <span className="text-sm font-semibold">{userPoints.tier} Tier</span>
            {userPoints.discount_percentage > 0 && (
              <span className="text-xs text-green-500">
                {userPoints.discount_percentage}% discount
              </span>
            )}
          </div>
        </div>
        
        <div className="stats stats-horizontal shadow-sm">
          <div className="stat py-2">
            <div className="stat-title text-xs">Total Earned</div>
            <div className="stat-value text-lg">{userPoints.points_earned_total}</div>
          </div>
          <div className="stat py-2">
            <div className="stat-title text-xs">Rewards</div>
            <div className="stat-value text-lg">{userPoints.rewards_redeemed}</div>
          </div>
          <div className="stat py-2">
            <div className="stat-title text-xs">Transactions</div>
            <div className="stat-value text-lg">{userPoints.total_transactions}</div>
          </div>
        </div>
        
        {showRewards && rewards.length > 0 && (
          <>
            <div className="divider"></div>
            
            <h3 className="text-lg font-semibold mb-4">Available Rewards</h3>
            <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {rewards.slice(0, compact ? 3 : 6).map(reward => (
                <div key={reward.id} className="card bg-base-200 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getRewardTypeIcon(reward.reward_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="card-title text-sm">{reward.name}</h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {reward.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">
                            {reward.points_cost} points
                          </span>
                          <button 
                            className={`btn btn-primary btn-xs ${
                              userPoints.points_balance < reward.points_cost ? 'btn-disabled' : ''
                            }`}
                            onClick={() => redeemReward(reward.id)}
                            disabled={
                              userPoints.points_balance < reward.points_cost || 
                              isRedeeming === reward.id ||
                              reward.available_quantity <= 0
                            }
                          >
                            {isRedeeming === reward.id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              'Redeem'
                            )}
                          </button>
                        </div>
                        {reward.available_quantity <= 0 && (
                          <div className="text-xs text-red-500 mt-1">
                            Out of stock
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {rewards.length > (compact ? 3 : 6) && (
              <div className="text-center mt-4">
                <button className="btn btn-outline btn-sm">
                  View All Rewards ({rewards.length})
                </button>
              </div>
            )}
          </>
        )}
        
        {userPoints.discount_percentage > 0 && (
          <div className="alert alert-success mt-4">
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <span className="text-sm">
                You have a {userPoints.discount_percentage}% discount on all platform fees!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsSystem;
