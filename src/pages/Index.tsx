import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Clock, Star, ArrowRight, Sparkles, TrendingUp, Users, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Rent by the Second",
      description: "Pay only for what you use - revolutionary micro-rentals",
      color: "from-blue-500 to-cyan-500",
      stats: "0.001 STT/sec"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Access",
      description: "Start using NFTs immediately - no waiting periods",
      color: "from-purple-500 to-pink-500",
      stats: "< 2 seconds"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Premium Content",
      description: "Access exclusive NFTs from top creators worldwide",
      color: "from-orange-500 to-red-500",
      stats: "10,000+ NFTs"
    }
  ];

  const stats = [
    { icon: <TrendingUp className="w-6 h-6" />, label: "Active Rentals", value: "2.4K" },
    { icon: <Users className="w-6 h-6" />, label: "Users", value: "15.2K" },
    { icon: <Shield className="w-6 h-6" />, label: "Secure", value: "100%" },
    { icon: <Globe className="w-6 h-6" />, label: "Countries", value: "50+" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        
        {/* Mouse-following effect */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full filter blur-3xl"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 0.1,
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            🚀 Powered by Somnia Network
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Netflix
            </span>
            <br />
            <span className="text-white">for NFTs</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
            Rent premium NFTs by the second. Access exclusive content instantly. 
            Experience the future of digital ownership.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link to="/netflix-marketplace" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Exploring
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
            
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all duration-200"
              >
                Learn How It Works
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Dynamic Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20 px-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              animate={{
                scale: currentFeature === index ? 1.05 : 1,
                opacity: currentFeature === index ? 1 : 0.7
              }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-black/40 backdrop-blur-lg border-gray-700 hover:border-purple-500 transition-all duration-300 h-full">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">{feature.description}</p>
                  <div className="text-sm font-semibold text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full inline-block">
                    {feature.stats}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20 px-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center px-4"
        >
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
              <span className="text-sm sm:text-base">Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-sm sm:text-base">Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <span className="text-sm sm:text-base">Pay Per Second</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;