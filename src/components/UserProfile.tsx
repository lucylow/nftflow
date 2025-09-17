import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAchievements } from '../contexts/AchievementContext';
import { useDataAdapter } from '../hooks/useDataAdapter';

const UserProfile: React.FC = () => {
  const { account } = useWeb3();
  const { achievements, rentalStreak, getTotalPoints } = useAchievements();
  const { data: userData, isLoading } = useDataAdapter('userProfile');

  if (!account) {
    return (
      <div className="p-6 text-center">
        <p>Connect your wallet to view your profile</p>
      </div>
    );
  }

  const user = userData[0] || {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20">
        <div className="relative">
          <img
            src={user.ensAvatar || `/api/avatar/${account}`}
            alt="Profile"
            className="w-20 h-20 rounded-full border-2 border-white shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${account}`;
            }}
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {getTotalPoints()}
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {user.ensName || `${account.slice(0, 8)}...${account.slice(-6)}`}
          </h1>
          <p className="text-gray-600">NFT Rental Enthusiast</p>
          
          <div className="flex gap-6 mt-2">
            <div className="text-center">
              <div className="font-bold text-lg">{rentalStreak}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{user.completedRentals || 0}</div>
              <div className="text-xs text-gray-500">Rentals</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{user.earned || '0'} STT</div>
              <div className="text-xs text-gray-500">Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 text-center shadow-sm"
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
              <p className="text-xs text-gray-600">{achievement.description}</p>
              <div className="mt-2 text-xs font-mono text-blue-600">
                +{achievement.points} XP
              </div>
            </div>
          ))}
          
          {/* Locked achievements placeholder */}
          {achievements.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No achievements yet. Start renting to unlock achievements!
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/80 border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-600">{user.stats?.totalRentals || 0}</div>
            <div className="text-sm text-gray-600">Total Rentals</div>
          </div>
          <div className="p-4 rounded-xl bg-white/80 border border-white/20 text-center">
            <div className="text-2xl font-bold text-green-600">{user.stats?.totalHours || 0}</div>
            <div className="text-sm text-gray-600">Hours Rented</div>
          </div>
          <div className="p-4 rounded-xl bg-white/80 border border-white/20 text-center">
            <div className="text-2xl font-bold text-purple-600">{user.stats?.averageRentalDuration || 0}</div>
            <div className="text-sm text-gray-600">Avg Duration</div>
          </div>
          <div className="p-4 rounded-xl bg-white/80 border border-white/20 text-center">
            <div className="text-2xl font-bold text-orange-600">{user.stats?.mostExpensiveRental || '0'} STT</div>
            <div className="text-sm text-gray-600">Most Expensive</div>
          </div>
        </div>
      </div>

      {/* Rental History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Rental History</h2>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/50 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : user.rentalHistory?.length > 0 ? (
            user.rentalHistory.map((rental: any, index: number) => (
              <div key={index} className="p-4 rounded-xl bg-white/80 border border-white/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={rental.nftImage}
                      alt={rental.nftName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{rental.nftName}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(rental.startTime).toLocaleDateString()} • {rental.duration} hours
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{rental.cost} STT</div>
                    <div className={`text-xs ${rental.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                      {rental.status}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No rental history yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
