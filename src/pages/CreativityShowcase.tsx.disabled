import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Trophy, 
  Eye, 
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Play,
  Star,
  Heart,
  Share2,
  Download,
  ArrowRight,
  CheckCircle,
  Crown,
  Flame,
  Medal
} from 'lucide-react';

// Import our creative components
import { RealTimePaymentStream } from '@/components/RealTimePaymentStream';
import { InteractiveRentalDashboard } from '@/components/InteractiveRentalDashboard';
import { VirtualShowroom } from '@/components/VirtualShowroom';
import { AchievementDashboard } from '@/components/AchievementDashboard';
import { RentalTimeline } from '@/components/RentalTimeline';

const CreativityShowcase = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const creativeFeatures = [
    {
      id: 'micro-rental',
      title: 'Micro-Rental Revolution',
      description: 'Rent NFTs by the second with sub-cent fees',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-500',
      stats: ['1 second minimum', 'Sub-cent costs', 'Real-time streaming'],
      component: 'RealTimePaymentStream'
    },
    {
      id: 'interactive-dashboard',
      title: 'Interactive Global Dashboard',
      description: 'Live rental activity map with real-time updates',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-green-500 to-blue-500',
      stats: ['Global map view', 'Real-time pins', 'Live statistics'],
      component: 'InteractiveRentalDashboard'
    },
    {
      id: 'virtual-showroom',
      title: 'Virtual NFT Showroom',
      description: 'Immersive 3D and AR experiences',
      icon: <Eye className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      stats: ['3D models', 'AR preview', 'Interactive controls'],
      component: 'VirtualShowroom'
    },
    {
      id: 'achievement-system',
      title: 'Gamified Achievement System',
      description: 'On-chain achievements with rewards and XP',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500',
      stats: ['XP & levels', 'Rare achievements', 'Social sharing'],
      component: 'AchievementDashboard'
    },
    {
      id: 'rental-timeline',
      title: 'Visual Rental Timeline',
      description: 'Beautiful timeline of your rental journey',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-indigo-500 to-purple-500',
      stats: ['Timeline view', 'Rich details', 'Export data'],
      component: 'RentalTimeline'
    },
    {
      id: 'dynamic-pricing',
      title: 'AI-Powered Dynamic Pricing',
      description: 'Real-time pricing based on demand and utilization',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-red-500 to-pink-500',
      stats: ['AI algorithms', 'Demand analysis', 'Price predictions'],
      component: null
    }
  ];

  const innovationHighlights = [
    {
      title: 'Second-Based Rentals',
      description: 'First platform to enable micro-rentals by the second',
      impact: 'Revolutionary',
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: 'Real-Time Payment Streaming',
      description: 'Watch payments stream to owners in real-time',
      impact: 'Industry First',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: 'Reputation-Based Collateral',
      description: 'No collateral needed for trusted users',
      impact: 'Novel',
      icon: <Crown className="w-6 h-6" />
    },
    {
      title: 'Time-Slot Rentals',
      description: 'Reserve exclusive time slots for premium content',
      impact: 'Unique',
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: 'Collaborative Groups',
      description: 'Group rentals with shared costs and experiences',
      impact: 'Social',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Virtual Showroom',
      description: '3D and AR previews before renting',
      impact: 'Immersive',
      icon: <Eye className="w-6 h-6" />
    }
  ];

  const renderFeatureComponent = (componentName: string) => {
    switch (componentName) {
      case 'RealTimePaymentStream':
        return <RealTimePaymentStream streamId="demo-stream-123" />;
      case 'InteractiveRentalDashboard':
        return <InteractiveRentalDashboard />;
      case 'VirtualShowroom':
        return <VirtualShowroom />;
      case 'AchievementDashboard':
        return <AchievementDashboard />;
      case 'RentalTimeline':
        return <RentalTimeline />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                NFTFlow Creativity
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  & Innovation
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Experience the most creative and original NFT rental platform, 
                powered by Somnia's revolutionary blockchain technology
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Download className="w-5 h-5 mr-2" />
                  Download App
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Innovation Highlights */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Industry-First Innovations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              NFTFlow introduces groundbreaking features that were previously impossible on other blockchains
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {innovationHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                        {highlight.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{highlight.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {highlight.impact}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600">{highlight.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Interactive Features Showcase
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our creative components and see the future of NFT rentals
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Live Features</TabsTrigger>
              <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creativeFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedFeature(feature.id)}
                  >
                    <Card className={`h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${
                      selectedFeature === feature.id ? 'ring-2 ring-blue-500' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600 mb-4">{feature.description}</p>
                        <div className="space-y-2">
                          {feature.stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {stat}
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-4 group-hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('features');
                            setSelectedFeature(feature.id);
                          }}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Explore Feature
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-8">
              {selectedFeature && creativeFeatures.find(f => f.id === selectedFeature)?.component ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">
                      {creativeFeatures.find(f => f.id === selectedFeature)?.title}
                    </h3>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedFeature(null)}
                    >
                      Close
                    </Button>
                  </div>
                  {renderFeatureComponent(
                    creativeFeatures.find(f => f.id === selectedFeature)?.component || ''
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Feature to Explore</h3>
                  <p className="text-gray-600">Choose a feature from the overview to see it in action</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="demo" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Live Demo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Play className="w-16 h-16 mx-auto text-blue-500 mb-2" />
                        <p className="text-gray-600">Interactive Demo Video</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Watch a live demonstration of NFTFlow's creative features in action
                    </p>
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Start Demo
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Try It Yourself
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Quick Start</h4>
                        <p className="text-sm text-green-700">
                          Connect your wallet and start exploring NFTFlow's creative features
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Testnet Available</h4>
                        <p className="text-sm text-blue-700">
                          Try all features on our testnet with free test tokens
                        </p>
                      </div>
                      <Button className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Launch App
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Statistics */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Creativity by the Numbers
            </h2>
            <p className="text-xl text-blue-100">
              NFTFlow's innovative features in action
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Micro-Rentals', value: '1M+', description: 'Rentals by the second' },
              { label: 'Real-Time Updates', value: '1000+', description: 'Updates per second' },
              { label: 'Global Users', value: '50K+', description: 'Active renters worldwide' },
              { label: 'Achievements', value: '100+', description: 'Unique achievements' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-blue-100 mb-1">{stat.label}</div>
                <div className="text-sm text-blue-200">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users already experiencing the most creative NFT rental platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5 mr-2" />
                Share with Friends
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreativityShowcase;


