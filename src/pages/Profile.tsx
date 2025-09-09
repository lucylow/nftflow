import { useState } from "react";
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
  Copy
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

const Profile = () => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState({
    username: "CosmicTrader",
    address: "0x1234567890abcdef1234567890abcdef12345678",
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

  const userStats = [
    { label: "Total Rentals", value: "47", icon: Activity },
    { label: "Total Spent", value: "234.56 STT", icon: Wallet },
    { label: "Reputation Score", value: "892/1000", icon: Star },
    { label: "Member Since", value: "3 months", icon: Calendar }
  ];

  const achievements = [
    { name: "First Rental", description: "Completed your first NFT rental", earned: true },
    { name: "Power User", description: "Rented 25+ NFTs", earned: true },
    { name: "Top Renter", description: "Top 10% of active renters", earned: true },
    { name: "Explorer", description: "Rented from 10+ collections", earned: false },
    { name: "Whale", description: "Spent 1000+ STT on rentals", earned: false }
  ];

  const recentActivity = [
    { type: "rental", action: "Rented Cosmic Wizard #1234", time: "2 hours ago" },
    { type: "return", action: "Returned Space Ape #456", time: "1 day ago" },
    { type: "rating", action: "Rated Digital Dragon #777", time: "2 days ago" },
    { type: "rental", action: "Rented Neon Cat #9999", time: "3 days ago" }
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(userProfile.address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

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
                      className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'rental' ? 'bg-success' :
                        activity.type === 'return' ? 'bg-warning' :
                        activity.type === 'rating' ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
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
                          <Trophy className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && (
                        <Badge variant="default" className="mt-2 bg-success/20 text-success">
                          Earned
                        </Badge>
                      )}
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