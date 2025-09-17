import React, { useState } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  address?: string;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  disabled?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing = false,
  onFollow,
  onUnfollow,
  disabled = false,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (following) {
        await onUnfollow?.();
        setFollowing(false);
      } else {
        await onFollow?.();
        setFollowing(true);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant={following ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {following ? (
        <>
          <UserMinus className="w-4 h-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;