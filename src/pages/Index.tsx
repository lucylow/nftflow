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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "1M+ TPS",
      description: "Lightning-fast rentals with Somnia's high-throughput blockchain"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure", 
      description: "Fully on-chain contracts with built-in reputation system"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time",
      description: "Micro-payments streamed every second with sub-second finality"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Collateral-free rentals for trusted community members"
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
              Rent NFTs by the Second
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The first NFT rental marketplace with streaming payments. 
              Rent high-value NFTs from seconds to months with zero barriers.
            </p>
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

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose NFTFlow?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on Somnia's revolutionary blockchain technology for unprecedented rental experiences
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
