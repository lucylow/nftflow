import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  Send,
  User,
  Trophy,
  UserPlus,
  UserMinus,
  Award,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  address: string;
  username: string;
  avatar: string;
  bio: string;
  reputation: number;
  totalRentals: number;
  joinDate: Date;
  isFollowing: boolean;
  followers: number;
  following: number;
  badges: string[];
}

interface Review {
  id: string;
  reviewer: UserProfile;
  reviewee: string;
  nftId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
  notHelpful: number;
}

interface CommunityPost {
  id: string;
  author: UserProfile;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  isLiked: boolean;
}

const SocialFeatures: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('community');
  const [newPost, setNewPost] = useState('');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  // Mock data for demonstration
  const mockUserProfile: UserProfile = {
    address: account || '0x1234567890abcdef',
    username: 'NFTExplorer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    bio: 'Passionate NFT collector and rental enthusiast. Always exploring new utilities!',
    reputation: 850,
    totalRentals: 47,
    joinDate: new Date('2023-06-15'),
    isFollowing: false,
    followers: 1234,
    following: 567,
    badges: ['Power User', 'Early Adopter', 'Community Helper']
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      reviewer: {
        address: '0x9876543210fedcba',
        username: 'CryptoArtLover',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        bio: 'Digital art enthusiast',
        reputation: 720,
        totalRentals: 23,
        joinDate: new Date('2023-08-20'),
        isFollowing: false,
        followers: 456,
        following: 234,
        badges: ['Art Collector']
      },
      reviewee: '0x1234567890abcdef',
      nftId: '1',
      rating: 5,
      comment: 'Amazing NFT! The utility was exactly as described and the rental process was smooth.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      helpful: 12,
      notHelpful: 0
    },
    {
      id: '2',
      reviewer: {
        address: '0x5555666677778888',
        username: 'MetaverseExplorer',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        bio: 'Exploring the metaverse one NFT at a time',
        reputation: 650,
        totalRentals: 18,
        joinDate: new Date('2023-09-10'),
        isFollowing: false,
        followers: 789,
        following: 345,
        badges: ['Metaverse Pioneer']
      },
      reviewee: '0x1234567890abcdef',
      nftId: '2',
      rating: 4,
      comment: 'Good NFT with solid utility. Would recommend for anyone interested in metaverse experiences.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      helpful: 8,
      notHelpful: 1
    }
  ];

  const mockCommunityPosts: CommunityPost[] = [
    {
      id: '1',
      author: {
        address: '0x1111222233334444',
        username: 'GamingGuru',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        bio: 'Gaming NFT specialist',
        reputation: 920,
        totalRentals: 67,
        joinDate: new Date('2023-05-01'),
        isFollowing: false,
        followers: 2345,
        following: 890,
        badges: ['Gaming Expert', 'Top Renter']
      },
      content: 'Just discovered this amazing gaming NFT collection! The utilities are incredible - you can actually use these weapons in multiple games. Highly recommend checking them out!',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
      likes: 45,
      comments: 12,
      shares: 8,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isLiked: false
    },
    {
      id: '2',
      author: {
        address: '0x6666777788889999',
        username: 'ArtCollector',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        bio: 'Digital art collector and curator',
        reputation: 780,
        totalRentals: 34,
        joinDate: new Date('2023-07-15'),
        isFollowing: false,
        followers: 1567,
        following: 456,
        badges: ['Art Curator', 'Community Leader']
      },
      content: 'The virtual gallery spaces on NFTFlow are revolutionizing how we experience digital art. Being able to rent exhibition spaces for short periods is game-changing for artists!',
      likes: 32,
      comments: 7,
      shares: 15,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isLiked: true
    }
  ];

  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(mockCommunityPosts);

  const handleFollow = (address: string) => {
    setUserProfile(prev => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
    }));
    
    toast({
      title: userProfile.isFollowing ? "Unfollowed" : "Following",
      description: `You are now ${userProfile.isFollowing ? 'unfollowing' : 'following'} this user`,
    });
  };

  const handleLikePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: userProfile,
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date(),
      isLiked: false
    };

    setCommunityPosts(prev => [post, ...prev]);
    setNewPost('');
    
    toast({
      title: "Post Published",
      description: "Your post has been shared with the community",
    });
  };

  const handleSubmitReview = () => {
    if (!newReview.comment.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      reviewer: userProfile,
      reviewee: '0x1234567890abcdef',
      nftId: '1',
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: new Date(),
      helpful: 0,
      notHelpful: 0
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 5, comment: '' });
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to access social features</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Social Features
          </h2>
          <p className="text-muted-foreground">Connect with the NFTFlow community</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList 
          className="grid w-full grid-cols-2 sm:grid-cols-4" 
          scrollable={true}
        >
          <TabsTrigger 
            value="community" 
            variant="pills"
            icon={<MessageCircle className="w-4 h-4" />}
          >
            Community
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            variant="pills"
            icon={<Star className="w-4 h-4" />}
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            variant="pills"
            icon={<User className="w-4 h-4" />}
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard" 
            variant="pills"
            icon={<Trophy className="w-4 h-4" />}
          >
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="community" className="space-y-6">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Share with Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback>{userProfile.username[0]}</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Share your thoughts with the NFTFlow community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmitPost} disabled={!newPost.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Community Posts */}
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{post.author.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.author.reputation} rep
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {post.author.bio}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {post.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className={post.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      {post.shares}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {/* Write Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Write a Review
              </CardTitle>
              <CardDescription>
                Share your experience with other users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className={star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'}
                    >
                      <Star className={`h-4 w-4 ${star <= newReview.rating ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
              </div>
              <Button onClick={handleSubmitReview} disabled={!newReview.comment.trim()}>
                Submit Review
              </Button>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.reviewer.avatar} />
                      <AvatarFallback>{review.reviewer.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.reviewer.username}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {review.reviewer.bio}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed mb-4">{review.comment}</p>
                  
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {review.helpful}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {review.notHelpful}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback className="text-2xl">{userProfile.username[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{userProfile.username}</h3>
                  <p className="text-muted-foreground">{userProfile.address.slice(0, 6)}...{userProfile.address.slice(-4)}</p>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{userProfile.bio}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{userProfile.reputation}</div>
                      <div className="text-sm text-muted-foreground">Reputation</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{userProfile.totalRentals}</div>
                      <div className="text-sm text-muted-foreground">Total Rentals</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{userProfile.followers}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{userProfile.following}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>
                Top users by reputation and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, username: 'NFTMaster', reputation: 1250, rentals: 89, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
                  { rank: 2, username: 'CryptoCollector', reputation: 1180, rentals: 76, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
                  { rank: 3, username: 'MetaverseExplorer', reputation: 1100, rentals: 67, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
                  { rank: 4, username: 'ArtEnthusiast', reputation: 1050, rentals: 58, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
                  { rank: 5, username: 'GamingPro', reputation: 980, rentals: 52, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
                ].map((user) => (
                  <div key={user.rank} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {user.rank}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.rentals} rentals • {user.reputation} reputation
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialFeatures;
