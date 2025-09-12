import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useWeb3 } from '../contexts/Web3Context';
import { useDAO } from '../hooks/useDAO';
import { useToast } from '../hooks/use-toast';
import { 
  Crown, 
  CheckCircle, 
  XCircle, 
  Info,
  Zap,
  Shield,
  Users
} from 'lucide-react';

export default function GovernanceTokenMinter() {
  const { account, contract } = useWeb3();
  const { checkEligibility, mintGovernanceToken, stats } = useDAO();
  const { toast } = useToast();
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    if (account && contract?.governanceToken) {
      checkEligibilityStatus();
    }
  }, [account, contract?.governanceToken]);

  const checkEligibilityStatus = async () => {
    try {
      setLoading(true);
      const eligible = await checkEligibility();
      setIsEligible(eligible);
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
      await mintGovernanceToken();
      // Refresh eligibility status
      await checkEligibilityStatus();
    } catch (error) {
      console.error('Error minting token:', error);
    } finally {
      setMinting(false);
    }
  };

  const getEligibilityStatus = () => {
    if (loading) {
      return {
        status: 'Checking...',
        color: 'bg-yellow-500',
        icon: Info,
        description: 'Checking your eligibility for a governance token'
      };
    }

    if (isEligible === null) {
      return {
        status: 'Unknown',
        color: 'bg-gray-500',
        icon: XCircle,
        description: 'Unable to determine eligibility'
      };
    }

    if (isEligible) {
      return {
        status: 'Eligible',
        color: 'bg-green-500',
        icon: CheckCircle,
        description: 'You are eligible to mint a governance token'
      };
    }

    return {
      status: 'Not Eligible',
      color: 'bg-red-500',
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
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Governance Token
          </h1>
          <p className="text-muted-foreground">
            Mint your governance token to participate in NFTFlow DAO decisions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Eligibility Status
            </CardTitle>
            <CardDescription>
              {statusInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={statusInfo.color}>
                {statusInfo.status}
              </Badge>
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Your Voting Power:</span>
                  <div className="font-medium">{stats.userVotingPower} tokens</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Proposals:</span>
                  <div className="font-medium">{stats.totalProposals}</div>
                </div>
              </div>
            )}

            {isEligible && (
              <Button 
                onClick={handleMintToken}
                disabled={minting || loading}
                className="w-full"
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
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>Governance Token Benefits</CardTitle>
            <CardDescription>
              What you can do with a governance token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Vote className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium">Vote on Proposals</h3>
                <p className="text-sm text-muted-foreground">
                  Participate in governance decisions that shape the platform
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium">Create Proposals</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your own proposals for platform improvements
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium">Execute Decisions</h3>
                <p className="text-sm text-muted-foreground">
                  Help execute approved proposals and changes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Governance Works</CardTitle>
            <CardDescription>
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
                  <h4 className="font-medium">Mint Governance Token</h4>
                  <p className="text-sm text-muted-foreground">
                    If eligible, mint your governance token to gain voting rights
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Create or Vote on Proposals</h4>
                  <p className="text-sm text-muted-foreground">
                    Submit proposals for platform changes or vote on existing ones
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Wait for Execution</h4>
                  <p className="text-sm text-muted-foreground">
                    Approved proposals are executed after a delay period
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Platform Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Changes take effect and improve the platform for all users
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats && stats.userVotingPower > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Governance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.userVotingPower}
                  </div>
                  <div className="text-sm text-green-600">Voting Power</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.activeProposals}
                  </div>
                  <div className="text-sm text-blue-600">Active Proposals</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                You can now participate in governance decisions!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
