import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Play, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Heart
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

export function HeroSection({ onGetStarted, onWatchDemo }: HeroSectionProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "Instant NFT Rentals",
      description: "Rent NFTs in seconds with our streamlined process",
      icon: <Zap className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Secure & Trustless",
      description: "Built on blockchain with smart contract security",
      icon: <Shield className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Global Marketplace",
      description: "Access NFTs from creators worldwide",
      icon: <Globe className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Next-Gen NFT Rental Platform
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Rent NFTs
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Instantly
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Experience the future of digital ownership. Rent, use, and enjoy NFTs 
                without the full purchase commitment.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active NFTs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2M+</div>
                <div className="text-sm text-muted-foreground">Volume</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg font-semibold group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onWatchDemo}
                className="px-8 py-4 text-lg font-semibold group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            {/* Main Feature Card */}
            <motion.div
              className="relative z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src="/placeholder.svg"
                      alt="NFT Preview"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-2">Digital Art Collection</h3>
                      <p className="text-sm opacity-90 mb-3">Rent for 0.05 ETH/hour</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>1.2K</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>24h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>+15%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Floating Feature Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs",
                  "border border-border/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3",
                  `bg-gradient-to-r ${features[currentFeature].color}`
                )}>
                  {features[currentFeature].icon}
                </div>
                <h4 className="font-semibold mb-1">{features[currentFeature].title}</h4>
                <p className="text-sm text-muted-foreground">
                  {features[currentFeature].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">1,234 Active</div>
                  <div className="text-sm text-muted-foreground">Rentals Today</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

