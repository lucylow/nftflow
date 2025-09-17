import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../../utils/address';
import ReputationScore from './ReputationScore';
import FollowButton from './FollowButton';
import ProfileTabs from './ProfileTabs';
import ActivityFeed from './ActivityFeed';
import UserCollections from './UserCollections';
import UserReviews from './UserReviews';

interface UserProfileData {
  address: string;
  ensName?: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  rentalCount: number;
  lendCount: number;
  followerCount: number;
  followingCount: number;
  joinedAt: string;
  verified: boolean;
  badges: Badge[];
  stats: UserStats;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface UserStats {
  totalEarned: number;
  totalSpent: number;
  averageRating: number;
  successRate: number;
  favoriteCategory: string;
}

interface UserProfileProps {
  address: string;
  showFullProfile?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  address, 
  showFullProfile = true 
}) => {
  const { address: currentUser } = useAccount();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    fetchProfile();
  }, [address]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/profile/${address}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data);
      } else {
        console.error('Error fetching profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="user-profile loading">
        <div className="profile-header">
          <div className="profile-avatar skeleton"></div>
          <div className="profile-info">
            <div className="profile-name skeleton"></div>
            <div className="profile-bio skeleton"></div>
            <div className="profile-stats">
              <div className="stat skeleton"></div>
              <div className="stat skeleton"></div>
              <div className="stat skeleton"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-profile error">
        <div className="error-message">
          <h3>Profile not found</h3>
          <p>This user hasn't created a profile yet.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.toLowerCase() === address.toLowerCase();

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={profile.avatar || '/default-avatar.png'} 
            alt={profile.ensName || shortenAddress(address)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          {profile.verified && (
            <div className="verified-badge" title="Verified user">
              ✓
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">
              {profile.ensName || shortenAddress(address)}
            </h1>
            {profile.ensName && (
              <p className="profile-address">
                {shortenAddress(address)}
              </p>
            )}
            <div className="profile-badges">
              {profile.badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="badge" title={badge.description}>
                  <span className="badge-icon">{badge.icon}</span>
                  <span className="badge-name">{badge.name}</span>
                </div>
              ))}
              {profile.badges.length > 3 && (
                <div className="badge-more">
                  +{profile.badges.length - 3} more
                </div>
              )}
            </div>
          </div>
          
          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{profile.reputation}</span>
              <span className="stat-label">Reputation</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.rentalCount}</span>
              <span className="stat-label">Rentals</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.lendCount}</span>
              <span className="stat-label">Lent</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.followerCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          
          <div className="profile-meta">
            <span className="joined-date">
              Joined {formatDate(profile.joinedAt)}
            </span>
            {profile.stats.successRate > 0 && (
              <span className="success-rate">
                {profile.stats.successRate}% success rate
              </span>
            )}
          </div>
        </div>
        
        {!isOwnProfile && (
          <div className="profile-actions">
            <FollowButton address={address} />
            <button className="btn btn-outline">
              Message
            </button>
          </div>
        )}
      </div>
      
      {showFullProfile && (
        <div className="profile-content">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
            <div data-tab="activity">
              <ActivityFeed address={address} />
            </div>
            <div data-tab="collections">
              <UserCollections address={address} />
            </div>
            <div data-tab="reviews">
              <UserReviews address={address} />
            </div>
          </ProfileTabs>
        </div>
      )}
      
      {/* Detailed Stats Section */}
      {showFullProfile && (
        <div className="profile-details">
          <div className="detail-section">
            <h3>Earnings & Spending</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Total Earned</span>
                <span className="detail-value positive">
                  {formatCurrency(profile.stats.totalEarned)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Spent</span>
                <span className="detail-value">
                  {formatCurrency(profile.stats.totalSpent)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Average Rating</span>
                <span className="detail-value">
                  {profile.stats.averageRating.toFixed(1)} ⭐
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Favorite Category</span>
                <span className="detail-value">
                  {profile.stats.favoriteCategory || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {profile.badges.length > 0 && (
            <div className="detail-section">
              <h3>Achievements</h3>
              <div className="badges-grid">
                {profile.badges.map((badge) => (
                  <div key={badge.id} className="achievement-badge">
                    <div className="achievement-icon">{badge.icon}</div>
                    <div className="achievement-info">
                      <h4>{badge.name}</h4>
                      <p>{badge.description}</p>
                      <span className="achievement-date">
                        Earned {formatDate(badge.earnedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
