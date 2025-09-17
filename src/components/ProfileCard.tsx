import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Profile {
  address: string;
  avatar_url?: string;
  bio?: string;
  reputation_score: number;
  rental_count: number;
  dispute_count: number;
  current_streak: number;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  likes_received: number;
  points_balance?: number;
  tier?: string;
  discount_percentage?: number;
  attestations?: any[];
  badges?: any[];
}

interface ProfileCardProps {
  address: string;
  showFollowButton?: boolean;
  compact?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  address, 
  showFollowButton = true, 
  compact = false 
}) => {
  const { address: currentUser } = useAccount();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [address]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/profiles/${address}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data);
        setIsFollowing(data.followers?.some((f: any) => f.follower_address === currentUser?.toLowerCase()));
      } else {
        console.error('Error fetching profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    
    try {
      setIsFollowingLoading(true);
      
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/profiles/${address}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Simplified auth
        }
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update followers count optimistically
        if (profile) {
          setProfile({
            ...profile,
            followers_count: isFollowing 
              ? profile.followers_count - 1 
              : profile.followers_count + 1
          });
        }
      } else {
        const error = await response.json();
        console.error('Error updating follow status:', error.error);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'BRONZE': return 'badge-warning';
      case 'SILVER': return 'badge-info';
      case 'GOLD': return 'badge-warning';
      case 'PLATINUM': return 'badge-primary';
      case 'DIAMOND': return 'badge-secondary';
      default: return 'badge-neutral';
    }
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 rounded-full skeleton"></div>
            </div>
            <div className="flex-1">
              <div className="skeleton h-6 w-32 mb-2"></div>
              <div className="skeleton h-4 w-48 mb-2"></div>
              <div className="flex gap-4">
                <div className="skeleton h-4 w-16"></div>
                <div className="skeleton h-4 w-16"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Profile not found</h3>
            <p className="text-gray-500">This user hasn't created a profile yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-xl ${compact ? 'max-w-sm' : ''}`}>
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img 
                src={profile.avatar_url || '/default-avatar.png'} 
                alt={address}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="card-title text-lg">
                {formatAddress(profile.address)}
              </h2>
              {profile.verified && (
                <div className="badge badge-primary badge-sm">Verified</div>
              )}
              {profile.tier && (
                <div className={`badge badge-sm ${getTierColor(profile.tier)}`}>
                  {profile.tier}
                </div>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            <div className="flex gap-4 text-sm">
              <div className="flex flex-col items-center">
                <span className="font-bold text-primary">{profile.reputation_score}</span>
                <span className="text-gray-500">Reputation</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold">{profile.rental_count}</span>
                <span className="text-gray-500">Rentals</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold">{profile.followers_count}</span>
                <span className="text-gray-500">Followers</span>
              </div>
              {profile.points_balance !== undefined && (
                <div className="flex flex-col items-center">
                  <span className="font-bold text-accent">{profile.points_balance}</span>
                  <span className="text-gray-500">Points</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {profile.badges && profile.badges.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {profile.badges.slice(0, 5).map((badge, index) => (
                <div key={index} className="badge badge-outline badge-sm">
                  {badge.badge_type}
                </div>
              ))}
              {profile.badges.length > 5 && (
                <div className="badge badge-outline badge-sm">
                  +{profile.badges.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {showFollowButton && currentUser && currentUser.toLowerCase() !== address.toLowerCase() && (
          <div className="card-actions justify-end mt-4">
            <button 
              className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
              onClick={handleFollow}
              disabled={isFollowingLoading}
            >
              {isFollowingLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                isFollowing ? 'Following' : 'Follow'
              )}
            </button>
          </div>
        )}
        
        {profile.current_streak > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-orange-500">🔥</span>
              <span>{profile.current_streak} day streak</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
