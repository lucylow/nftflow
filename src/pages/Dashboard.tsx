import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  Wallet, 
  Settings, 
  BarChart3,
  Calendar,
  Eye,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import NFTCard from "@/components/NFTCard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const userStats = [
    { label: "Total Earned", value: "156.78 STT", change: "+12.5%" },
    { label: "Active Rentals", value: "8", change: "+2" },
    { label: "Total Rented", value: "47 NFTs", change: "+5" },
    { label: "Reputation Score", value: "4.8/5", change: "+0.1" }
  ];

  const activeRentals = [
    {
      id: "1",
      name: "Cosmic Wizard #1234",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      collection: "Cosmic Wizards",
      pricePerHour: 0.5,
      isRented: true,
      owner: "0x1234567890abcdef",
      timeLeft: "2h 15m",
      rarity: "Rare"
    },
    {
      id: "2",
      name: "Galaxy Punk #5678", 
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      collection: "Galaxy Punks",
      pricePerHour: 1.2,
      isRented: true,
      owner: "0x9876543210fedcba", 
      timeLeft: "45m",
      rarity: "Epic"
    }
  ];

  const recentActivity = [
    { type: "rental", action: "Rented Cosmic Wizard #1234", time: "2 hours ago", amount: "+1.5 STT" },
    { type: "return", action: "Returned Space Ape #456", time: "5 hours ago", amount: "-0.8 STT" },
    { type: "rental", action: "Rented Digital Dragon #777", time: "1 day ago", amount: "+2.5 STT" },
    { type: "earning", action: "Earned from Neon Cat #9999", time: "2 days ago", amount: "+3.2 STT" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-slate-300">Manage your NFT rentals and earnings</p>
            </div>
            <Button variant="premium" size="lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border-border backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="rentals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Rentals
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Listings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">{stat.label}</p>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                        <Badge 
                          variant="default"
                          className="bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          {stat.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Active Rentals */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Active Rentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeRentals.map((nft) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'rental' ? 'bg-green-400' :
                          activity.type === 'return' ? 'bg-yellow-400' :
                          'bg-purple-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{activity.action}</p>
                          <p className="text-slate-400 text-sm">{activity.time}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={activity.amount.startsWith('+') ? "default" : "secondary"}
                        className={activity.amount.startsWith('+') ? 
                          "bg-green-500/20 text-green-400" : 
                          "bg-slate-600 text-slate-300"
                        }
                      >
                        {activity.amount}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rentals" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Current Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeRentals.map((nft) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Wallet className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">156.78 STT</p>
                  <p className="text-slate-400 text-sm">Total Earned</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">23.45 STT</p>
                  <p className="text-slate-400 text-sm">This Month</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">5.67 STT</p>
                  <p className="text-slate-400 text-sm">Today</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  My Listed NFTs
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    List New NFT
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-400">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No NFTs listed yet</p>
                  <p className="text-sm">Start earning by listing your NFTs for rent</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;