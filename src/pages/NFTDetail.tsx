import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, 
  User, 
  Star, 
  Share2, 
  Heart,
  ExternalLink,
  Activity,
  DollarSign,
  Shield,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NFTDetail = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  
  // Mock NFT data - in real app, fetch based on ID
  const nft = {
    id: id,
    name: "Cosmic Wizard #1234",
    description: "A mystical wizard from the cosmic realm, wielding ancient powers and stellar magic. This rare NFT features unique animated elements and unlocks special access to the Cosmic Guild.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    collection: "Cosmic Wizards",
    owner: "0x1234567890abcdef",
    creator: "0xabcdef1234567890",
    pricePerHour: 1.5,
    totalRentals: 47,
    totalVolume: 245.67,
    rarity: "Legendary",
    isRented: false,
    attributes: [
      { trait_type: "Background", value: "Cosmic Nebula", rarity: "5%" },
      { trait_type: "Robe", value: "Stellar Silk", rarity: "8%" },
      { trait_type: "Staff", value: "Void Crystal", rarity: "3%" },
      { trait_type: "Aura", value: "Galaxy Spiral", rarity: "12%" },
      { trait_type: "Eyes", value: "Starlight", rarity: "7%" }
    ]
  };

  const rentalHistory = [
    { renter: "0x9876543210fedcba", duration: "2.5h", amount: "3.75 STT", date: "2024-01-15" },
    { renter: "0x5678901234abcdef", duration: "1.0h", amount: "1.50 STT", date: "2024-01-14" },
    { renter: "0x3456789012345678", duration: "4.2h", amount: "6.30 STT", date: "2024-01-13" },
    { renter: "0x7890123456789012", duration: "0.8h", amount: "1.20 STT", date: "2024-01-12" }
  ];

  const priceHistory = [
    { date: "2024-01-10", price: 1.2 },
    { date: "2024-01-11", price: 1.3 },
    { date: "2024-01-12", price: 1.4 },
    { date: "2024-01-13", price: 1.5 },
    { date: "2024-01-14", price: 1.5 },
    { date: "2024-01-15", price: 1.5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                  {nft.isRented && (
                    <div className="absolute top-4 right-4 bg-destructive/90 text-white px-3 py-1 rounded-lg font-medium backdrop-blur-sm">
                      Currently Rented
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="default" className="bg-primary/90 text-white backdrop-blur-sm">
                      {nft.rarity}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">{nft.name}</h1>
              <p className="text-xl text-muted-foreground mb-4">{nft.collection}</p>
              <p className="text-muted-foreground leading-relaxed">{nft.description}</p>
            </div>

            {/* Owner and Creator */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-primary/10 bg-card/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>OW</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-muted-foreground">Owner</div>
                      <div className="font-mono text-sm">{nft.owner.slice(0, 8)}...</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>CR</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-muted-foreground">Creator</div>
                      <div className="font-mono text-sm">{nft.creator.slice(0, 8)}...</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rental Info */}
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-rental">{nft.pricePerHour} STT</div>
                    <div className="text-sm text-muted-foreground">per hour</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{nft.totalRentals}</div>
                    <div className="text-sm text-muted-foreground">total rentals</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">1 Hour</div>
                    <div className="font-semibold">{nft.pricePerHour} STT</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">1 Day</div>
                    <div className="font-semibold">{(nft.pricePerHour * 24).toFixed(1)} STT</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">1 Week</div>
                    <div className="font-semibold">{(nft.pricePerHour * 24 * 7).toFixed(0)} STT</div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  variant="rental"
                  disabled={nft.isRented}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {nft.isRented ? "Currently Rented" : "Rent Now"}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-primary/10 bg-card/30 text-center">
                <CardContent className="p-4">
                  <div className="text-xl font-bold text-success">{nft.totalVolume} STT</div>
                  <div className="text-xs text-muted-foreground">Total Volume</div>
                </CardContent>
              </Card>
              <Card className="border-primary/10 bg-card/30 text-center">
                <CardContent className="p-4">
                  <div className="text-xl font-bold">4.8</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </CardContent>
              </Card>
              <Card className="border-primary/10 bg-card/30 text-center">
                <CardContent className="p-4">
                  <div className="text-xl font-bold text-warning">12</div>
                  <div className="text-xs text-muted-foreground">Views (24h)</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="attributes" className="space-y-6">
          <TabsList className="bg-card/50 border-border backdrop-blur-sm">
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="history">Rental History</TabsTrigger>
            <TabsTrigger value="activity">Price Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="attributes">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nft.attributes.map((attr, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-muted/30 rounded-lg border border-primary/10"
                    >
                      <div className="text-sm text-muted-foreground mb-1">{attr.trait_type}</div>
                      <div className="font-semibold mb-2">{attr.value}</div>
                      <Badge variant="outline" className="text-xs">
                        {attr.rarity} rare
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Rental History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rentalHistory.map((rental, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-mono text-sm">{rental.renter.slice(0, 12)}...</div>
                          <div className="text-xs text-muted-foreground">{rental.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{rental.amount}</div>
                        <div className="text-xs text-muted-foreground">{rental.duration}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Price Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg mb-6">
                  <p className="text-muted-foreground">Price chart visualization would go here</p>
                </div>
                <div className="space-y-2">
                  {priceHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{entry.date}</span>
                      <span className="font-mono">{entry.price} STT/hour</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NFTDetail;