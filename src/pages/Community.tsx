import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Vote, 
  Crown, 
  TrendingUp, 
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Star,
  Heart,
  Share2
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const Community = () => {
  const { account } = useWeb3();
  const [activeTab, setActiveTab] = useState('dao');

  const daoStats = {
    totalMembers: 1247,
    activeProposals: 8,
    totalProposals: 156,
    votingPower: '2.4%'
  };

  const proposals = [
    {
      id: 1,
      title: "Increase rental fees by 10%",
      description: "Proposal to increase platform rental fees to improve sustainability",
      status: "Active",
      votesFor: 234,
      votesAgainst: 89,
      endDate: "2024-02-15",
      category: "Economics"
    },
    {
      id: 2,
      title: "Add new NFT categories",
      description: "Proposal to add Gaming and Music categories to the platform",
      status: "Passed",
      votesFor: 456,
      votesAgainst: 123,
      endDate: "2024-01-30",
      category: "Feature"
    },
    {
      id: 3,
      title: "Implement staking rewards",
      description: "Proposal to add staking rewards for long-term NFT holders",
      status: "Draft",
      votesFor: 0,
      votesAgainst: 0,
      endDate: "2024-03-01",
      category: "Rewards"
    }
  ];

  const communityPosts = [
    {
      id: 1,
      author: "NFTMaster",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      title: "New rental feature is amazing!",
      content: "Just tried the new hourly rental feature and it's incredible. The UX is so smooth!",
      likes: 23,
      comments: 5,
      time: "2 hours ago",
      category: "Feature"
    },
    {
      id: 2,
      author: "CryptoArtist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      title: "Tips for new creators",
      content: "Here are some tips I've learned after listing 50+ NFTs on the platform...",
      likes: 45,
      comments: 12,
      time: "4 hours ago",
      category: "Tips"
    },
    {
      id: 3,
      author: "BlockchainDev",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      title: "Technical discussion: Smart contracts",
      content: "Let's discuss the technical implementation of our rental smart contracts...",
      likes: 18,
      comments: 8,
      time: "6 hours ago",
      category: "Technical"
    }
  ];

  const governanceTokens = {
    totalSupply: "1,000,000",
    circulatingSupply: "750,000",
    stakedTokens: "200,000",
    votingPower: account ? "2.4%" : "0%"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Community Governance
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">DAO & Governance</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Participate in community decisions, vote on proposals, and help shape the future of NFTFlow.
            Your voice matters in our decentralized governance system.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-white">{daoStats.totalMembers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Proposals</p>
                  <p className="text-2xl font-bold text-white">{daoStats.activeProposals}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Vote className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Proposals</p>
                  <p className="text-2xl font-bold text-white">{daoStats.totalProposals}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Voting Power</p>
                  <p className="text-2xl font-bold text-white">{daoStats.votingPower}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dao" className="flex items-center gap-2">
                <Vote className="h-4 w-4" />
                DAO
              </TabsTrigger>
              <TabsTrigger value="governance" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Governance
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Community
              </TabsTrigger>
              <TabsTrigger value="tokens" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tokens
              </TabsTrigger>
            </TabsList>

            {/* DAO Tab */}
            <TabsContent value="dao">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Proposal
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id} className="bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                              <Badge 
                                className={
                                  proposal.status === 'Active' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : proposal.status === 'Passed'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }
                              >
                                {proposal.status}
                              </Badge>
                              <Badge variant="outline">{proposal.category}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">{proposal.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Ends: {proposal.endDate}
                              </div>
                            </div>
                          </div>
                        </div>

                        {proposal.status === 'Active' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Votes For</span>
                              <span className="text-green-400 font-medium">{proposal.votesFor}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Votes Against</span>
                              <span className="text-red-400 font-medium">{proposal.votesAgainst}</span>
                            </div>
                            <div className="w-full bg-muted/20 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` 
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Vote For
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Vote Against
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Governance Overview</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Proposal
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Vote className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Voting Power</h3>
                          <p className="text-sm text-muted-foreground">Your influence</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">2.4%</div>
                      <p className="text-sm text-muted-foreground">Based on token holdings</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Votes Cast</h3>
                          <p className="text-sm text-muted-foreground">This month</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">12</div>
                      <p className="text-sm text-muted-foreground">Out of 15 proposals</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Crown className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Delegation</h3>
                          <p className="text-sm text-muted-foreground">Voting power</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">0%</div>
                      <p className="text-sm text-muted-foreground">Self-delegated</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Governance Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          proposal: "Increase rental fees by 10%",
                          status: "Passed",
                          yourVote: "For",
                          result: "234 For, 89 Against",
                          date: "2024-01-15"
                        },
                        {
                          proposal: "Add new NFT categories",
                          status: "Passed",
                          yourVote: "For",
                          result: "456 For, 123 Against",
                          date: "2024-01-10"
                        },
                        {
                          proposal: "Implement staking rewards",
                          status: "Active",
                          yourVote: "Pending",
                          result: "Voting in progress",
                          date: "2024-01-20"
                        }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border/30">
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">{activity.proposal}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Status: <Badge className={activity.status === 'Passed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>{activity.status}</Badge></span>
                              <span>Your Vote: {activity.yourVote}</span>
                              <span>Result: {activity.result}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Community Posts</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {communityPosts.map((post) => (
                    <Card key={post.id} className="bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={post.avatar}
                            alt={post.author}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-white">{post.author}</h3>
                              <Badge variant="outline" className="text-xs">{post.category}</Badge>
                              <span className="text-sm text-muted-foreground">{post.time}</span>
                            </div>
                            <h4 className="text-lg font-medium text-white mb-2">{post.title}</h4>
                            <p className="text-muted-foreground mb-4">{post.content}</p>
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                                <Heart className="mr-1 h-4 w-4" />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                                <MessageSquare className="mr-1 h-4 w-4" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                                <Share2 className="mr-1 h-4 w-4" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tokens Tab */}
            <TabsContent value="tokens">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Governance Token Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Supply</span>
                      <span className="text-white font-medium">{governanceTokens.totalSupply}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Circulating Supply</span>
                      <span className="text-white font-medium">{governanceTokens.circulatingSupply}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Staked Tokens</span>
                      <span className="text-white font-medium">{governanceTokens.stakedTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Voting Power</span>
                      <span className="text-primary font-medium">{governanceTokens.votingPower}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Token Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Star className="mr-2 h-4 w-4" />
                      Stake Tokens
                    </Button>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Claim Rewards
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      View Staking History
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;
