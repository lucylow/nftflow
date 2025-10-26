import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Star,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWeb3 } from '@/contexts/Web3Context';
import { useNFTFlow } from '@/hooks/useNFTFlow';
import { useReputationSystem } from '@/hooks/useReputationSystem';
import { usePaymentStream } from '@/hooks/usePaymentStream';

interface UserDashboardProps {
  className?: string;
}

const UserDashboard = ({ className }: UserDashboardProps) => {
  const { account, isConnected } = useWeb3();
  const { 
    getUserReputation, 
    getSuccessRate, 
    getUserAchievements,
    getReputationTier,
    getReputationColor 
  } = useReputationSystem();
  const { getSenderStreams, getRecipientStreams } = usePaymentStream();

  const [collateralBalance, setCollateralBalance] = useState('0');
  const [reputation, setReputation] = useState<{
    reputationScore: number;
    totalRentals: number;
    successfulRentals: number;
    successRate: number;
    tier: number;
    requiresCollateral: boolean;
    collateralMultiplier: number;
    isWhitelisted: boolean;
    isBlacklisted: boolean;
  } | null>(null);
  const [successRate, setSuccessRate] = useState(0);
  const [achievements, setAchievements] = useState<number[]>([]);
  const [senderStreams, setSenderStreams] = useState<string[]>([]);
  const [recipientStreams, setRecipientStreams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !account) {
      setIsLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        // Check if all functions are available
        if (!getUserReputation || !getSuccessRate || 
            !getUserAchievements || !getSenderStreams || !getRecipientStreams) {
          console.error('One or more required functions are not available');
          setIsLoading(false);
          return;
        }

        const [
          userReputation,
          rate,
          userAchievements,
          sender,
          recipient
        ] = await Promise.all([
          getUserReputation(),
          getSuccessRate(),
          getUserAchievements(),
          getSenderStreams(),
          getRecipientStreams()
        ]);

        setCollateralBalance('0'); // Mock collateral balance
        setReputation(userReputation);
        setSuccessRate(rate);
        setAchievements(userAchievements);
        setSenderStreams(sender);
        setRecipientStreams(recipient);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [account, isConnected, getUserReputation, getSuccessRate, getUserAchievements, getSenderStreams, getRecipientStreams]);

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Connect your wallet to view your dashboard</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const reputationTier = reputation ? getReputationTier(reputation.reputationScore) : 'Newcomer';
  const reputationColor = getReputationColor(reputationTier);

  return (
    <div className={className}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collateral Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {parseFloat(collateralBalance).toFixed(4)} STT
                  </p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reputation Score</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {reputation?.reputationScore || 0}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {successRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rentals</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {reputation?.totalRentals || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reputation Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Reputation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Tier</span>
                <Badge className={`${reputationColor} bg-opacity-20`}>
                  {reputationTier}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reputation Progress</span>
                  <span>{reputation?.reputationScore || 0}/1000</span>
                </div>
                <Progress 
                  value={(reputation?.reputationScore || 0) / 10} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-lg font-semibold text-green-600">
                    {reputation?.successfulRentals || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-lg font-semibold text-red-600">
                    {(reputation?.totalRentals || 0) - (reputation?.successfulRentals || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-2">
                  {achievements.map((achievementId) => (
                    <div key={achievementId} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Achievement #{achievementId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete rentals to unlock achievements
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Streams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Payment Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Outgoing Streams</h4>
                {senderStreams.length > 0 ? (
                  <div className="space-y-2">
                    {senderStreams.map((streamId) => (
                      <div key={streamId} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-mono">Stream #{streamId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No outgoing streams</p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Incoming Streams</h4>
                {recipientStreams.length > 0 ? (
                  <div className="space-y-2">
                    {recipientStreams.map((streamId) => (
                      <div key={streamId} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-mono">Stream #{streamId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No incoming streams</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
