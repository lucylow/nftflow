import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useWeb3 } from '../contexts/Web3Context-minimal';
import { useToast } from '../hooks/use-toast';
import { 
  Crown, 
  CheckCircle, 
  XCircle, 
  Info,
  Zap,
  Shield,
  Users,
  Vote
} from 'lucide-react';

export default function GovernanceTokenMinter() {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  // Mock stats for demonstration
  const [stats, setStats] = useState({
    userVotingPower: 0,
    totalProposals: 5,
    activeProposals: 2
  });

  useEffect(() => {
    if (account && isConnected) {
      checkEligibilityStatus();
    }
  }, [account, isConnected]);

  const checkEligibilityStatus = async () => {
    try {
      setLoading(true);
      // Mock implementation - replace with actual contract call when deployed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock eligibility check - user is eligible if they have an account
      const eligible = !!account;
      setIsEligible(eligible);
      
      if (eligible) {
        setStats(prev => ({ ...prev, userVotingPower: 1 }));
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setIsEligible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMintToken = async () => {
    try {
      setMinting(true);
      
      // Mock implementation - replace with actual contract call when deployed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Governance Token Minted",
        description: "Your governance token has been minted successfully (Mock)",
      });
      
      // Update stats
      setStats(prev => ({ ...prev, userVotingPower: 1 }));
      setIsEligible(true);
    } catch (error) {
      console.error('Error minting token:', error);
      toast({
        title: "Minting Failed",
        description: "Failed to mint governance token",
        variant: "destructive",
      });
    } finally {
      setMinting(false);
    }
  };

  const getEligibilityStatus = () => {
    if (loading) {
      return {
        status: 'Checking...',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Info,
        description: 'Checking your eligibility for a governance token'
      };
    }

    if (isEligible === null) {
      return {
        status: 'Unknown',
        color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        icon: XCircle,
        description: 'Unable to determine eligibility'
      };
    }

    if (isEligible) {
      return {
        status: 'Eligible',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle,
        description: 'You are eligible to mint a governance token'
      };
    }

    return {
      status: 'Not Eligible',
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: XCircle,
      description: 'You are not currently eligible for a governance token'
    };
  };

  const statusInfo = getEligibilityStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-white">
            <Crown className="h-8 w-8 text-yellow-400" />
            Governance Token
          </h1>
          <p className="text-slate-400">
            Mint your governance token to participate in NFTFlow DAO decisions
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <StatusIcon className="h-5 w-5" />
              Eligibility Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              {statusInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Status</span>
              <Badge className={statusInfo.color}>
                {statusInfo.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Your Voting Power:</span>
                <div className="font-medium text-white">{stats.userVotingPower} tokens</div>
              </div>
              <div>
                <span className="text-slate-400">Total Proposals:</span>
                <div className="font-medium text-white">{stats.totalProposals}</div>
              </div>
            </div>

            {isEligible && (
              <Button 
                onClick={handleMintToken}
                disabled={minting || loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {minting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Minting...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Mint Governance Token
                  </>
                )}
              </Button>
            )}

            {!isEligible && !loading && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <Info className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400">
                  To become eligible for a governance token, you need to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Be an active user of the NFTFlow platform</li>
                    <li>Have completed at least one successful rental</li>
                    <li>Meet community requirements set by the DAO</li>
                  </ul>
                  Contact the DAO administrators if you believe you should be eligible.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Governance Token Benefits</CardTitle>
            <CardDescription className="text-slate-400">
              What you can do with a governance token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Vote className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-medium text-white">Vote on Proposals</h3>
                <p className="text-sm text-slate-400">
                  Participate in governance decisions that shape the platform
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-medium text-white">Create Proposals</h3>
                <p className="text-sm text-slate-400">
                  Submit your own proposals for platform improvements
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-medium text-white">Execute Decisions</h3>
                <p className="text-sm text-slate-400">
                  Help execute approved proposals and changes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">How Governance Works</CardTitle>
            <CardDescription className="text-slate-400">
              Understanding the NFTFlow DAO governance process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-white">Mint Governance Token</h4>
                  <p className="text-sm text-slate-400">
                    If eligible, mint your governance token to gain voting rights
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-white">Create or Vote on Proposals</h4>
                  <p className="text-sm text-slate-400">
                    Submit proposals for platform changes or vote on existing ones
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-white">Wait for Execution</h4>
                  <p className="text-sm text-slate-400">
                    Approved proposals are executed after a delay period
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-white">Platform Updates</h4>
                  <p className="text-sm text-slate-400">
                    Changes take effect and improve the platform for all users
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats && stats.userVotingPower > 0 && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Your Governance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {stats.userVotingPower}
                  </div>
                  <div className="text-sm text-green-400">Voting Power</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {stats.activeProposals}
                  </div>
                  <div className="text-sm text-blue-400">Active Proposals</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4 text-center">
                You can now participate in governance decisions!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
