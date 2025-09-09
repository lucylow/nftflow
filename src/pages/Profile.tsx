import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Wallet,
  Star,
  Trophy,
  Calendar,
  Activity,
  Edit,
  ExternalLink,
  Copy,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/contexts/Web3Context";

const Profile = () => {
  const { toast } = useToast();
  const { isConnected, account, balance } = useWeb3();
  const [userProfile, setUserProfile] = useState({
    username: "CosmicTrader",
    address: account || "0x1234567890abcdef1234567890abcdef12345678",
    avatar: "/placeholder-avatar.jpg",
    bio: "NFT enthusiast and active renter on NFTFlow. Love exploring new collections!",
    joinDate: "2024-01-01",
    verified: true
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    rental: true,
    offers: true
  });

  // Update user profile when account changes
  useEffect(() => {
    if (account) {
      setUserProfile(prev => ({
        ...prev,
        address: account
      }));
    }
  }, [account]);

  const userStats = [
    { label: "Total Rentals", value: "47", icon: Activity },
    { label: "Total Spent", value: "234.56 STT", icon: Wallet },
    { label: "Reputation Score", value: "892/1000", icon: Star },
    { label: "Member Since", value: "3 months", icon: Calendar }
  ];

  const achievements = [
    { name: "First Rental", description: "Completed your first NFT rental", earned: true, icon: "🎯", progress: 100 },
    { name: "Power User", description: "Rented 25+ NFTs", earned: true, icon: "⚡", progress: 100 },
    { name: "Top Renter", description: "Top 10% of active renters", earned: true, icon: "🏆", progress: 100 },
    { name: "Explorer", description: "Rented from 10+ collections", earned: true, icon: "🗺️", progress: 100 },
    { name: "Whale", description: "Spent 1000+ STT on rentals", earned: false, icon: "🐋", progress: 23 },
    { name: "Early Adopter", description: "Joined in the first month", earned: true, icon: "🚀", progress: 100 },
    { name: "Diversity Champion", description: "Rented from 20+ different categories", earned: false, icon: "🌈", progress: 75 },
    { name: "Night Owl", description: "Completed 50+ rentals between 10PM-6AM", earned: false, icon: "🦉", progress: 60 },
    { name: "Weekend Warrior", description: "Rented 30+ NFTs on weekends", earned: true, icon: "⚔️", progress: 100 },
    { name: "Loyal Customer", description: "Rented the same NFT 5+ times", earned: true, icon: "💎", progress: 100 },
    { name: "Social Butterfly", description: "Shared 10+ rentals on social media", earned: false, icon: "🦋", progress: 40 },
    { name: "Review Master", description: "Left 50+ reviews for rentals", earned: false, icon: "⭐", progress: 80 }
  ];

  const recentActivity = [
    { type: "rental", action: "Rented Cosmic Wizard #1234", time: "2 hours ago", amount: "+1.5 STT", nftId: "1234" },
    { type: "return", action: "Returned Space Ape #456", time: "1 day ago", amount: "-0.8 STT", nftId: "456" },
    { type: "rating", action: "Rated Digital Dragon #777", time: "2 days ago", amount: "", nftId: "777" },
    { type: "rental", action: "Rented AI Trading Bot License", time: "3 days ago", amount: "+1.08 STT", nftId: "888" },
    { type: "earning", action: "Earned from Virtual Real Estate Plot", time: "4 days ago", amount: "+1.44 STT", nftId: "555" },
    { type: "return", action: "Returned Music Production Studio", time: "5 days ago", amount: "-0.65 STT", nftId: "333" },
    { type: "rental", action: "Rented Fitness Coach AI", time: "1 week ago", amount: "+0.5 STT", nftId: "222" },
    { type: "achievement", action: "Earned 'Weekend Warrior' achievement", time: "1 week ago", amount: "", nftId: "" },
    { type: "rating", action: "Rated Luxury Car Showroom", time: "1 week ago", amount: "", nftId: "111" },
    { type: "rental", action: "Rented Language Learning Tutor", time: "2 weeks ago", amount: "+0.3 STT", nftId: "999" }
  ];

  const favoriteCategories = [
    { category: "Gaming Utilities", rentals: 15, totalSpent: 45.6, avgRating: 4.8 },
    { category: "AI Services", rentals: 8, totalSpent: 32.4, avgRating: 4.9 },
    { category: "Creative Tools", rentals: 12, totalSpent: 28.7, avgRating: 4.7 },
    { category: "Virtual Land", rentals: 5, totalSpent: 67.2, avgRating: 4.6 },
    { category: "Health & Wellness", rentals: 7, totalSpent: 12.3, avgRating: 4.5 }
  ];

  const socialStats = [
    { platform: "Twitter", followers: 1234, posts: 56, engagement: "4.2%" },
    { platform: "Discord", members: 567, messages: 1234, activity: "Daily" },
    { platform: "Telegram", members: 234, messages: 456, activity: "Weekly" }
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(userProfile.address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Please connect your wallet to view your profile and access all features.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Profile Header */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback className="text-2xl">CT</AvatarFallback>
                  </Avatar>
                  {userProfile.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{userProfile.username}</h1>
                    {userProfile.verified && (
                      <Badge variant="default" className="bg-success/10 text-success border-success/20">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {userProfile.address.slice(0, 16)}...
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyAddress}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`https://etherscan.io/address/${userProfile.address}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Edit Profile",
                          description: "Profile editing feature coming soon!",
                        });
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Settings",
                          description: "Settings panel opened",
                        });
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-primary mb-3">
                    <stat.icon className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-card/50 border-border backdrop-blur-sm">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'rental' ? 'bg-success' :
                          activity.type === 'return' ? 'bg-warning' :
                          activity.type === 'rating' ? 'bg-primary' :
                          activity.type === 'earning' ? 'bg-accent' :
                          activity.type === 'achievement' ? 'bg-purple-500' : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      {activity.amount && (
                        <Badge 
                          variant={activity.amount.startsWith('+') ? "default" : "secondary"}
                          className={activity.amount.startsWith('+') ? 
                            "bg-success/10 text-success" : 
                            "bg-muted text-muted-foreground"
                          }
                        >
                          {activity.amount}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        achievement.earned 
                          ? 'bg-success/10 border-success/20' 
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          achievement.earned ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          <span className="text-lg">{achievement.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {achievement.earned ? (
                          <Badge variant="default" className="bg-success/20 text-success">
                            Earned
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted/30 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${achievement.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Favorite Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {favoriteCategories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {category.category.split(' ')[0].slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.rentals} rentals • Avg Rating: {category.avgRating}/5
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{category.totalSpent} STT</p>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Social Presence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialStats.map((platform, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {platform.platform.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{platform.platform}</h3>
                          <p className="text-sm text-muted-foreground">
                            {platform.platform === 'Twitter' ? `${platform.followers} followers` :
                             platform.platform === 'Discord' ? `${platform.members} members` :
                             `${platform.members} members`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {platform.platform === 'Twitter' ? platform.posts :
                           platform.platform === 'Discord' ? platform.messages :
                           platform.messages}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {platform.platform === 'Twitter' ? 'Posts' :
                           platform.platform === 'Discord' ? 'Messages' :
                           'Messages'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={userProfile.username} />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" value={userProfile.bio} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <Switch 
                      id="email-notif" 
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, email: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notif">Push Notifications</Label>
                    <Switch 
                      id="push-notif" 
                      checked={notifications.push}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, push: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rental-notif">Rental Updates</Label>
                    <Switch 
                      id="rental-notif" 
                      checked={notifications.rental}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, rental: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="offers-notif">Special Offers</Label>
                    <Switch 
                      id="offers-notif" 
                      checked={notifications.offers}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, offers: checked})
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;