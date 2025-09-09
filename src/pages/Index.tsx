import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight,
  Play,
  TrendingUp,
  Sparkles,
  DollarSign,
  Target,
  CheckCircle,
  Star,
  Globe,
  Gamepad2,
  Palette,
  Building2,
  Trophy,
  Lightbulb,
  Rocket,
  BarChart3,
  Timer,
  CreditCard,
  Gamepad,
  TrendingUp as TrendingUpIcon,
  Users2,
  Award,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Micro-Utility Access",
      description: "Rent NFT utilities by the second—impossible on other chains"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Try Before You Buy", 
      description: "Test premium NFT utilities risk-free before committing to purchase"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Streaming",
      description: "Watch payments stream to owners in real-time with sub-second finality"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Democratized Access",
      description: "Access $10K+ NFT utilities for just cents per second"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <Sparkles className="w-5 h-5" />
              <span>Powered by Somnia Blockchain</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              NFTFlow
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-foreground/90">
              The Netflix for NFTs
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Unlock NFT utility with real-time, pay-per-second rentals. Access premium NFT utilities 
              by the second with streaming payments—no ownership required. Built on Somnia's revolutionary 
              blockchain technology for unprecedented utility access.
            </p>
            
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">$200B+</div>
                <div className="text-sm text-muted-foreground">Frozen NFT Market</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">&lt;1s</div>
                <div className="text-sm text-muted-foreground">Rental Finality</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">&lt;$0.01</div>
                <div className="text-sm text-muted-foreground">Transaction Cost</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/marketplace">
              <Button size="xl" variant="premium" className="px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="outline" size="xl" className="px-8 py-3">
                List Your NFT
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              The <span className="text-destructive">$200 Billion</span> NFT Market is Frozen
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Most NFTs sit idle in wallets, generating zero yield while remaining inaccessible to the masses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-destructive mb-4">
                  <Shield className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Low Utility</h3>
                <p className="text-muted-foreground text-sm">Most NFTs sit idle in wallets, generating zero yield</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-destructive mb-4">
                  <DollarSign className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">High Barrier</h3>
                <p className="text-muted-foreground text-sm">Premium NFTs are too expensive for most users to own</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-destructive mb-4">
                  <TrendingUp className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Illiquid & Speculative</h3>
                <p className="text-muted-foreground text-sm">Value is based on hype, not real-world usage</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-destructive mb-4">
                  <Target className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Risk Aversion</h3>
                <p className="text-muted-foreground text-sm">Users hesitant to buy expensive assets without trying them</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-primary">Instant, Affordable Access</span> to Any NFT
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              NFTFlow enables micro-rentals of NFTs, powered by Somnia's sub-second finality and sub-cent fees
            </p>
            <Badge variant="secondary" className="text-lg px-6 py-2">
              "It's like Netflix for NFTs, with the payment model of Spotify"
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <Timer className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Rent by the Second</h3>
                <p className="text-muted-foreground text-sm">Users can rent a high-value NFT for minutes, hours, or days</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <CreditCard className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Streaming Payments</h3>
                <p className="text-muted-foreground text-sm">Payments are streamed to the owner in real-time</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <Gamepad className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Try-Before-You-Buy</h3>
                <p className="text-muted-foreground text-sm">Experience an NFT in-game or metaverse before committing</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <TrendingUpIcon className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Earn Yield</h3>
                <p className="text-muted-foreground text-sm">NFT owners earn passive income from their idle digital assets</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              One-Click Rentals, <span className="text-primary">Powered by Somnia</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A simple three-step process that takes less than a second to complete
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Browse</h3>
              <p className="text-muted-foreground">Discover NFTs from games, art collections, and metaverses</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Rent</h3>
              <p className="text-muted-foreground">Click "Rent," choose your duration, and confirm. <span className="text-primary font-semibold">Transaction confirms in &lt;1 second</span></p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Use</h3>
              <p className="text-muted-foreground">The NFT is transferred to your wallet instantly. Use it in any supported app</p>
            </div>
          </div>
          
          <div className="bg-card/30 border border-primary/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-8">The Technical Magic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-primary mb-3">
                  <Shield className="w-8 h-8 mx-auto" />
                </div>
                <h4 className="font-semibold mb-2">Smart Contracts</h4>
                <p className="text-sm text-muted-foreground">Modified ERC-4907 standard for rental logic</p>
              </div>
              
              <div className="text-center">
                <div className="text-primary mb-3">
                  <CreditCard className="w-8 h-8 mx-auto" />
                </div>
                <h4 className="font-semibold mb-2">Payment Streaming</h4>
                <p className="text-sm text-muted-foreground">Custom Sablier-inspired contracts for real-time micro-payments</p>
              </div>
              
              <div className="text-center">
                <div className="text-primary mb-3">
                  <Star className="w-8 h-8 mx-auto" />
                </div>
                <h4 className="font-semibold mb-2">Reputation System</h4>
                <p className="text-sm text-muted-foreground">On-chain score reduces/eliminates collateral for trusted users</p>
              </div>
              
              <div className="text-center">
                <div className="text-primary mb-3">
                  <Zap className="w-8 h-8 mx-auto" />
                </div>
                <h4 className="font-semibold mb-2">Somnia MultiCall</h4>
                <p className="text-sm text-muted-foreground">Bundles transactions for a seamless one-click user experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Somnia Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              This is <span className="text-primary">ONLY possible</span> on Somnia
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We are the perfect dApp to showcase Somnia's revolutionary technology
            </p>
          </div>
          
          <div className="bg-card/30 border border-primary/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="text-left p-6 font-semibold">Feature</th>
                    <th className="text-center p-6 font-semibold">Another Chain</th>
                    <th className="text-center p-6 font-semibold">On Somnia</th>
                    <th className="text-left p-6 font-semibold">Benefit for NFTFlow</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/50">
                    <td className="p-6 font-medium">Avg. Tx Cost</td>
                    <td className="p-6 text-center text-destructive">$2 - $50</td>
                    <td className="p-6 text-center text-primary font-semibold">&lt;$0.01</td>
                    <td className="p-6 text-muted-foreground">Enables micro-payments & micro-rentals</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="p-6 font-medium">Finality Time</td>
                    <td className="p-6 text-center text-destructive">12-60 sec</td>
                    <td className="p-6 text-center text-primary font-semibold">&lt;1 Second</td>
                    <td className="p-6 text-muted-foreground">Instant rental starts & real-time UX</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="p-6 font-medium">Throughput (TPS)</td>
                    <td className="p-6 text-center text-destructive">10-100</td>
                    <td className="p-6 text-center text-primary font-semibold">1,000,000+</td>
                    <td className="p-6 text-muted-foreground">Scales to millions of concurrent rentals</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="p-6 font-medium">Our Use Case</td>
                    <td className="p-6 text-center text-destructive">Economically impossible</td>
                    <td className="p-6 text-center text-primary font-semibold">Perfect Fit</td>
                    <td className="p-6 text-muted-foreground">Unlocks a net new market</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture Deep Dive Section */}
      <section className="px-4 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Technical Architecture <span className="text-primary">Deep Dive</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built from first principles to leverage Somnia's revolutionary capabilities. 
              Micro-rentals that are economically and technically infeasible on any other network.
            </p>
          </div>

          {/* Network Layer */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">
              <span className="text-primary">3.1</span> Network Layer: Why Somnia is Non-Negotiable
            </h3>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
              The core innovation of NFTFlow is predicated on a blockchain that can support 
              high-frequency, low-value transactions with instant finality. Somnia is the only 
              network that provides this specific combination of features.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Timer className="w-6 h-6 text-primary" />
                    Sub-Second Finality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    The user experience of renting an NFT must be comparable to streaming a movie. 
                    Any perceptible delay destroys the illusion of instant access.
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">~500ms</div>
                    <div className="text-sm text-muted-foreground">Somnia's block finality time</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Implementation:</strong> When a user initiates a rental, the transaction 
                    is confirmed in under one second, granting immediate access to the rented asset.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-primary" />
                    Sub-Cent Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    The economic model of micro-rentals requires that transaction costs are a 
                    negligible fraction of the rental price.
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">~$0.00025</div>
                    <div className="text-sm text-muted-foreground">Somnia's transaction cost</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Implementation:</strong> A 10-minute rental costing $0.0167 has a gas 
                    fee representing only ~1.5% of the rental value, making the business model sustainable.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-primary" />
                    1M+ TPS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    NFTFlow envisions millions of users renting thousands of NFTs simultaneously 
                    without congestion or increased fees.
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">1M+</div>
                    <div className="text-sm text-muted-foreground">Theoretical throughput</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Implementation:</strong> Even during peak demand for popular NFT drops, 
                    the network processes all transactions without delay or increased cost.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Smart Contract Layer */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">
              <span className="text-primary">3.2</span> Smart Contract Layer
            </h3>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
              The smart contract suite deployed on Somnia forms the immutable, trustless backbone of the protocol.
            </p>

            <div className="space-y-8">
              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    NFTFlowCore.sol: Rental Management Logic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Temporal Access Control</h4>
                      <p className="text-sm text-muted-foreground">
                        Built upon modified ERC-4907 standard with granular control and automatic 
                        access revocation upon expiration.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Collateral Escrow</h4>
                      <p className="text-sm text-muted-foreground">
                        For low-reputation users, holds 2x rental value in escrow with pro-rata 
                        refunds for early cancellations.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Dispute Resolution</h4>
                      <p className="text-sm text-muted-foreground">
                        On-chain mechanism for resolving conflicts with third-party arbitrators 
                        and enforced decisions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-primary" />
                    PaymentStream.sol: Real-Time Value Transfer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Continuous Payments</h4>
                      <p className="text-sm text-muted-foreground">
                        Linear stream algorithm calculates releasable amounts based on elapsed time, 
                        providing smooth value transfer.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Stream Cancellation</h4>
                      <p className="text-sm text-muted-foreground">
                        Allows either party or arbitrators to cancel streams with pro-rata 
                        distribution of funds.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Fee Distribution</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatic 2.5% protocol fee deduction on each fund release, sent to 
                        NFTFlow treasury.
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Payment Stream Algorithm:</h5>
                    <code className="text-sm text-muted-foreground">
                      releasableAmount = (totalAmount × elapsedTime) / totalDuration - releasedAmount
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-primary" />
                    ReputationSystem.sol: Trust Minimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">On-Chain History</h4>
                      <p className="text-sm text-muted-foreground">
                        Immutable record of every user's rental history, publicly verifiable 
                        and serving as reputation foundation.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Collateral Algorithm</h4>
                      <p className="text-sm text-muted-foreground">
                        Dynamic collateral requirements based on reputation scores, reducing 
                        barriers for trusted users.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Sybil Resistance</h4>
                      <p className="text-sm text-muted-foreground">
                        Integration with identity providers and on-chain metrics to prevent 
                        reputation gaming.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Off-Chain Infrastructure */}
          <div>
            <h3 className="text-3xl font-bold mb-8 text-center">
              <span className="text-primary">3.3</span> Off-Chain Infrastructure
            </h3>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
              While the core logic is on-chain, a lean off-chain infrastructure layer is essential 
              for performance and user experience.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-card/30 border-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-accent" />
                    Event Indexing & Query Layer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Dedicated service listens for on-chain events and indexes them into a 
                    PostgreSQL database for efficient querying.
                  </p>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-accent mb-2">Key Events:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• RentalStarted</li>
                      <li>• RentalCompleted</li>
                      <li>• FundsReleased</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Implementation:</strong> Uses The Graph or custom indexer to maintain 
                    a fast, queryable database replica of the chain's rental state.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-accent" />
                    Metadata Cache & IPFS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    NFT metadata stored on IPFS is cached in Redis for instant access, 
                    drastically improving page load times.
                  </p>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-accent mb-2">Cache Strategy:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Check Redis first</li>
                      <li>• Fetch from IPFS on miss</li>
                      <li>• Store in Redis for future</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Implementation:</strong> Redis cache stores metadata JSON blobs, 
                    serving them instantly while maintaining IPFS as the source of truth.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-accent" />
                    Price Oracle Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Fair, market-based pricing through DIA Oracle integration ensures 
                    rental prices reflect real market data.
                  </p>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-accent mb-2">Oracle Details:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• DIA Oracle on Somnia</li>
                      <li>• Real-time price feeds</li>
                      <li>• Anti-manipulation</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Implementation:</strong> Contract queries DIA oracle for current 
                    rental prices before finalizing agreements, preventing price manipulation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Somnia Network Integration Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Somnia Network <span className="text-primary">Integration</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              NFTFlow is not merely deployed on Somnia; it is fundamentally architected to leverage 
              the network's unique capabilities to their maximum potential.
            </p>
          </div>

          {/* Technical Implementation */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">
              <span className="text-primary">5.1</span> Technical Implementation
            </h3>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
              Deep integration with Somnia's infrastructure transforms technical compromises into defining features.
            </p>

            <div className="space-y-8">
              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-primary" />
                    Custom RPC Configuration for Optimal Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Dedicated Node Infrastructure</h4>
                      <p className="text-sm text-muted-foreground">
                        Load-balanced Somnia RPC node cluster with sub-50ms ping and high request quotas, 
                        eliminating public endpoint bottlenecks.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">WebSocket Real-Time State</h4>
                      <p className="text-sm text-muted-foreground">
                        Persistent WebSocket connection for instant blockchain event subscription, 
                        enabling live price updates and rental status changes.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Failover & Redundancy</h4>
                      <p className="text-sm text-muted-foreground">
                        Multiple fallback RPC providers including Ankr's infrastructure for 99.99% uptime 
                        and seamless failover.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    MultiCallV3 for Batch Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Unified Rental Transactions</h4>
                      <p className="text-sm text-muted-foreground">
                        Single "Rent Now" transaction bundles approval, payment, and access grant, 
                        reducing wallet pop-ups and gas consumption.
                      </p>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <div className="text-xs font-mono text-muted-foreground">
                          MultiCall bundles: Approval → Payment → Access Grant
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Efficient Data Fetching</h4>
                      <p className="text-sm text-muted-foreground">
                        Aggregates multiple view function calls into single atomic requests, 
                        drastically reducing load times and RPC calls.
                      </p>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <div className="text-xs font-mono text-muted-foreground">
                          Contract: 0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-primary" />
                    Event Listening for Real-Time Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">On-Chain Event Indexing</h4>
                      <p className="text-sm text-muted-foreground">
                        Dedicated backend service listens for key blockchain events: NFTRented, 
                        RentalCompleted, FundsReleased.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Real-Time Database Sync</h4>
                      <p className="text-sm text-muted-foreground">
                        Immediate PostgreSQL updates when events are emitted, enabling fast 
                        database queries instead of slow blockchain queries.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">WebSocket Push to UI</h4>
                      <p className="text-sm text-muted-foreground">
                        Socket.io pushes updates to all connected clients, enabling real-time 
                        UI updates without page refreshes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Benchmarks */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">
              <span className="text-primary">5.2</span> Performance Benchmarks
            </h3>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
              Recorded on Somnia Testnet (Shannon), demonstrating transformative performance enabled by the network.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-card/30 border-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Timer className="w-6 h-6 text-accent" />
                    Transaction Latency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">~1.2s</div>
                    <div className="text-sm text-muted-foreground">Start to Finish</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Signing & Broadcast</span>
                      <span className="text-accent">~200ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Block Inclusion & Finality</span>
                      <span className="text-accent">~800ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Event Detection & UI Update</span>
                      <span className="text-accent">~200ms</span>
                    </div>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      <strong>50x faster</strong> than Ethereum L1 (15-60s)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-accent" />
                    Cost per Rental
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">~0.0000025</div>
                    <div className="text-sm text-muted-foreground">STT Total Cost</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Create Rental</span>
                      <span className="text-accent">~0.0000015 STT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fund Release (per call)</span>
                      <span className="text-accent">~0.0000001 STT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Complete Rental</span>
                      <span className="text-accent">~0.0000009 STT</span>
                    </div>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      <strong>~$0.00000025</strong> at $0.10/STT
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-accent" />
                    Concurrent Rentals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">1,000</div>
                    <div className="text-sm text-muted-foreground">Simultaneous Rentals</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <strong>Test Scenario:</strong> 1,000 users renting 100 NFTs in 60 seconds
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Result:</strong> All transactions included in next block
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Performance:</strong> No congestion, stable gas fees
                    </div>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      <strong>Global scale</strong> without degradation
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Network Effects & Synergies */}
          <div>
            <h3 className="text-3xl font-bold mb-8 text-center">
              <span className="text-primary">5.3</span> Network Effects & Synergies
            </h3>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
              NFTFlow is designed to be a flagship dApp that actively contributes to and benefits from Somnia ecosystem growth.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-primary" />
                    Driving SOMI Token Utility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Medium of Exchange</div>
                        <div className="text-sm text-muted-foreground">All rentals and payments denominated in SOMI</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Network Security</div>
                        <div className="text-sm text-muted-foreground">High-frequency transactions contribute to network security</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Staking Integration</div>
                        <div className="text-sm text-muted-foreground">Future: Stake SOMI for fee discounts and revenue sharing</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-primary" />
                    Showcasing Technical Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Technical Benchmark</div>
                        <div className="text-sm text-muted-foreground">Live proof of 1M+ TPS, sub-second finality, sub-cent fees</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Developer Inspiration</div>
                        <div className="text-sm text-muted-foreground">Open-source codebase demonstrates Somnia best practices</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Real-World Application</div>
                        <div className="text-sm text-muted-foreground">Complex dApp running seamlessly on the network</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Rocket className="w-6 h-6 text-primary" />
                    Attracting NFT Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">New Revenue Stream</div>
                        <div className="text-sm text-muted-foreground">Continuous rental revenue beyond initial NFT sales</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Enhanced Accessibility</div>
                        <div className="text-sm text-muted-foreground">Lower barriers to entry expand potential user base</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Ecosystem Cross-Pollination</div>
                        <div className="text-sm text-muted-foreground">User acquisition funnel for entire Somnia ecosystem</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="px-4 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Tapping a <span className="text-primary">Multi-Billion Dollar</span> Greenfield Market
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The NFT rental market is a massive opportunity waiting to be unlocked
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">$200B+</div>
                <div className="text-lg font-semibold">Total Addressable Market (TAM)</div>
                <div className="text-muted-foreground">NFT Market Cap</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">$45B+</div>
                <div className="text-lg font-semibold">Serviceable Addressable Market (SAM)</div>
                <div className="text-muted-foreground">Gaming & Metaverse NFTs</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">$450M+</div>
                <div className="text-lg font-semibold">Serviceable Obtainable Market (SOM)</div>
                <div className="text-muted-foreground">Annual rental fees (1% penetration of SAM)</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-8">Target Customers</h3>
              
              <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg">
                <div className="text-primary">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold">Gamers</h4>
                  <p className="text-sm text-muted-foreground">Access premium characters, skins, and items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg">
                <div className="text-primary">
                  <Palette className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold">Collectors</h4>
                  <p className="text-sm text-muted-foreground">Monetize their idle NFT portfolios</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg">
                <div className="text-primary">
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold">Metaverse Users</h4>
                  <p className="text-sm text-muted-foreground">Rent land, avatars, and wearables for events</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-card/30 rounded-lg">
                <div className="text-primary">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold">Guilds (GameFi)</h4>
                  <p className="text-sm text-muted-foreground">Rent high-tier assets to scholarship players</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Sustainable Revenue from a <span className="text-primary">Thriving Ecosystem</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We take a <span className="text-primary font-semibold">2.5% platform fee</span> on all rental transactions
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-card/30 border border-primary/20 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Revenue Projections</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <div>
                      <div className="font-semibold">Platform Fees</div>
                      <div className="text-sm text-muted-foreground">2.5% of all transactions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">$5M</div>
                      <div className="text-sm text-muted-foreground">Year 3</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg">
                    <div>
                      <div className="font-semibold">Premium Features</div>
                      <div className="text-sm text-muted-foreground">Featured listings, analytics, API access</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">$1.5M</div>
                      <div className="text-sm text-muted-foreground">Year 3</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-primary/20 rounded-lg border border-primary/30">
                    <div className="font-semibold">Total Revenue</div>
                    <div className="text-xl font-bold text-primary">$6.5M</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-card/30 border border-accent/20 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Future Tokenomics</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Platform Fee Buyback</div>
                      <div className="text-sm text-muted-foreground">Platform fees used to buy back and stake governance tokens</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Community Alignment</div>
                      <div className="text-sm text-muted-foreground">Incentives aligned with community growth and platform success</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Governance Rights</div>
                      <div className="text-sm text-muted-foreground">Token holders participate in platform governance decisions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traction & Roadmap Section */}
      <section className="px-4 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Live on Somnia Testnet, <span className="text-primary">Ready to Grow</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've built a working MVP and have a clear path to mainnet launch
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-center mb-8">✅ Achieved (Hackathon MVP)</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-card/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Working Smart Contracts</div>
                    <div className="text-sm text-muted-foreground">Deployed on Somnia Testnet with full rental functionality</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-card/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Functional dApp</div>
                    <div className="text-sm text-muted-foreground">Complete UI with wallet connect & rental interface</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-card/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Real-time Payment Streaming</div>
                    <div className="text-sm text-muted-foreground">Live dashboard showing streaming payments</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-card/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Initial User Testing</div>
                    <div className="text-sm text-muted-foreground">50+ testers have tried the platform</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-center mb-8">🚀 Roadmap</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Q2 2024: Mainnet Launch</div>
                    <div className="text-sm text-muted-foreground">Launch on Somnia mainnet with full production features</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Q3 2024: Ecosystem Partnerships</div>
                    <div className="text-sm text-muted-foreground">Partner with 5+ Somnia NFT projects</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Q4 2024: Mobile & Analytics</div>
                    <div className="text-sm text-muted-foreground">Mobile app release & advanced analytics dashboard</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">2025: Cross-chain & Token</div>
                    <div className="text-sm text-muted-foreground">Cross-chain expansion and governance token launch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why NFTFlow Will Win Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              We're Not Just Winning a Hackathon; <span className="text-primary">We're Launching an Industry</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              NFTFlow is positioned to become the leading NFT rental marketplace
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <Trophy className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Maximizes Somnia's Tech</h3>
                <p className="text-muted-foreground text-sm">We use its 1M TPS, sub-second finality, and low fees to the max</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <Lightbulb className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Deeply Original</h3>
                <p className="text-muted-foreground text-sm">Solves a real problem with a novel, fun solution</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <Rocket className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Mass Market Appeal</h3>
                <p className="text-muted-foreground text-sm">Appeals to gamers and collectors, not just DeFi users</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4">
                  <BarChart3 className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-World Viability</h3>
                <p className="text-muted-foreground text-sm">Clear business model and path to growth</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to <span className="text-primary">Unlock NFT Utility</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the revolution and start renting or listing NFTs today. Experience the future of NFT utility on Somnia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/marketplace">
              <Button size="xl" variant="premium" className="px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Start Renting NFTs
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="outline" size="xl" className="px-8 py-3">
                List Your NFT
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Live on Somnia Testnet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>50+ Active Testers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Sub-second Finality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">The NFT Utility Revolution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform idle NFT assets into active utility generators. Built on Somnia's revolutionary blockchain technology for unprecedented utility access.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/30 border-primary/10 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm flex-grow">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
