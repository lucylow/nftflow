import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Zap, 
  Clock, 
  Users, 
  ArrowRight,
  Play,
  Sparkles,
  CheckCircle,
  Star,
  Gamepad2,
  Palette,
  Globe,
  Building2,
  Timer,
  CreditCard,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/contexts/Web3Context";
import { runFullWalletTest } from "@/utils/walletTest";
import { useState } from "react";

const Index = () => {
  const { isConnected, account, chainId } = useWeb3();
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleWalletTest = async () => {
    setIsTesting(true);
    try {
      const results = await runFullWalletTest();
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Rent by the Second",
      description: "Access premium NFTs instantly with pay-per-second rentals"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Access", 
      description: "Sub-second finality means you start using NFTs immediately"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Streaming Payments",
      description: "Real-time payments to NFT owners as you use them"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Try Before You Buy",
      description: "Test expensive NFTs before committing to purchase"
    }
  ];

  const stats = [
    { value: "1,200+", label: "Active Rentals" },
    { value: "50+", label: "NFT Collections" },
    { value: "<1s", label: "Average Rental Time" },
    { value: "$0.0001", label: "Average Cost/Second" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Somnia Blockchain
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Rent NFTs by the Second
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Access premium NFT utilities instantly. No ownership required. 
              Pay only for what you use with streaming payments.
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/marketplace">
              <Button size="xl" variant="premium" className="px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Start Renting NFTs
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="outline" size="xl" className="px-8 py-4 text-lg">
                List Your NFT
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose NFTFlow?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The only platform that makes NFT rentals economically viable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group h-full">
                  <CardContent className="p-6 text-center h-full flex flex-col">
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

      {/* How It Works Section */}
      <section className="px-4 py-16 md:py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rent NFTs in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Browse</h3>
              <p className="text-muted-foreground">Discover NFTs from games, art collections, and metaverses</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Rent</h3>
              <p className="text-muted-foreground">Click "Rent," choose your duration, and confirm. Transaction confirms in &lt;1 second</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Use</h3>
              <p className="text-muted-foreground">The NFT is transferred to your wallet instantly. Use it in any supported app</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wallet Debug Section - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-white">🔧 Wallet Connection Debug</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Connected:</span>
                      <span className={`ml-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {isConnected ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Account:</span>
                      <span className="ml-2 text-slate-300 font-mono">
                        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Network:</span>
                      <span className={`ml-2 ${chainId === 50312 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {chainId === 50312 ? 'Somnia Testnet' : `Chain ${chainId}`}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleWalletTest}
                    disabled={isTesting}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300"
                  >
                    {isTesting ? 'Testing...' : 'Run Wallet Test'}
                  </Button>
                  
                  {testResults && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="font-semibold mb-2 text-white">Test Results:</h4>
                      <pre className="text-xs text-slate-300 overflow-auto">
                        {JSON.stringify(testResults, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="text-primary">Rent NFTs</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of users already renting NFTs by the second. 
              Start exploring premium NFT utilities today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/marketplace">
                <Button size="xl" variant="premium" className="px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                  Browse Marketplace
              </Button>
            </Link>
            <Link to="/create">
                <Button variant="outline" size="xl" className="px-8 py-4 text-lg">
                List Your NFT
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Live on Somnia</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Sub-second Finality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>No Gas Fees</span>
            </div>
              </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;