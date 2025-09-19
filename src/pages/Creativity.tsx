import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { 
  Palette, 
  Brush, 
  Image, 
  Sparkles, 
  Camera,
  Music,
  Video,
  FileText,
  Download,
  Share2,
  Play,
  Pause,
  Upload,
  Wand2,
  Layers,
  Filter,
  Crop,
  RotateCcw,
  Save,
  Eye,
  Heart,
  Star,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

export default function Creativity() {
  const [activeTab, setActiveTab] = useState('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');

  // Mock data for active features
  const mockCreations = [
    {
      id: 1,
      title: "Cosmic Dreams",
      type: "AI Art",
      image: "/api/placeholder/300/300",
      likes: 1247,
      views: 8932,
      creator: "AliceWonder",
      price: 0.05,
      status: "active"
    },
    {
      id: 2,
      title: "Digital Symphony",
      type: "Music",
      image: "/api/placeholder/300/300",
      likes: 892,
      views: 4567,
      creator: "SoundMaster",
      price: 0.08,
      status: "active"
    },
    {
      id: 3,
      title: "Neon Cityscape",
      type: "Video",
      image: "/api/placeholder/300/300",
      likes: 2156,
      views: 12345,
      creator: "VisualPro",
      price: 0.12,
      status: "active"
    }
  ];

  const mockStats = {
    totalCreations: 1247,
    activeRentals: 89,
    totalEarnings: 2.45,
    monthlyGrowth: 23.5,
    topCategory: "AI Art",
    avgRating: 4.8
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Create Hub</h1>
          <p className="text-gray-300 text-lg">
            Unleash your artistic potential with AI-powered creative tools
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Creations</p>
                  <p className="text-2xl font-bold text-blue-600">{mockStats.totalCreations.toLocaleString()}</p>
                </div>
                <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Rentals</p>
                  <p className="text-2xl font-bold text-green-600">{mockStats.activeRentals}</p>
                </div>
                <Play className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-purple-600">{mockStats.totalEarnings} ETH</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Growth</p>
                  <p className="text-2xl font-bold text-orange-600">+{mockStats.monthlyGrowth}%</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Art Generator */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Palette className="h-5 w-5 text-pink-400" />
                      AI Art Generator
                      <Badge className="bg-green-500/20 text-green-400">Live</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Describe your vision</label>
                      <Textarea
                        placeholder="A futuristic cityscape with neon lights reflecting on wet streets..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['realistic', 'anime', 'oil painting', 'digital art'].map((style) => (
                          <Button
                            key={style}
                            variant={selectedStyle === style ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedStyle(style)}
                            className={selectedStyle === style ? "bg-purple-600" : "border-slate-600 text-white hover:bg-slate-700"}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Generating...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                      </div>
                    )}

                    <Button 
                      onClick={handleGenerate}
                      disabled={!prompt || isGenerating}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate Art'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Tools */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Brush className="h-5 w-5 text-blue-400" />
                      Quick Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="bg-blue-600 hover:bg-blue-700 h-20 flex flex-col gap-2">
                        <Image className="w-6 h-6" />
                        <span className="text-sm">Photo Edit</span>
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 h-20 flex flex-col gap-2">
                        <Music className="w-6 h-6" />
                        <span className="text-sm">Music</span>
                      </Button>
                      <Button className="bg-red-600 hover:bg-red-700 h-20 flex flex-col gap-2">
                        <Video className="w-6 h-6" />
                        <span className="text-sm">Video</span>
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700 h-20 flex flex-col gap-2">
                        <FileText className="w-6 h-6" />
                        <span className="text-sm">Writing</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Digital Painting",
                  icon: <Brush className="h-5 w-5 text-blue-400" />,
                  status: "active",
                  description: "Professional digital painting tools",
                  features: ["Advanced brush engine", "Layer support", "Real-time collaboration"]
                },
                {
                  title: "Photo Editor",
                  icon: <Image className="h-5 w-5 text-green-400" />,
                  status: "active",
                  description: "Edit and enhance your photos",
                  features: ["AI-powered filters", "Auto-correction", "Background removal"]
                },
                {
                  title: "Music Creator",
                  icon: <Music className="h-5 w-5 text-purple-400" />,
                  status: "active",
                  description: "Compose and produce music",
                  features: ["AI music generation", "Multi-track editing", "Export to NFT"]
                },
                {
                  title: "Video Editor",
                  icon: <Video className="h-5 w-5 text-red-400" />,
                  status: "active",
                  description: "Create and edit videos",
                  features: ["Real-time editing", "AI transitions", "4K export"]
                },
                {
                  title: "Content Writer",
                  icon: <FileText className="h-5 w-5 text-yellow-400" />,
                  status: "active",
                  description: "AI-powered writing assistant",
                  features: ["Smart content generation", "SEO optimization", "Multi-language"]
                },
                {
                  title: "3D Modeler",
                  icon: <Layers className="h-5 w-5 text-indigo-400" />,
                  status: "beta",
                  description: "Create 3D models and scenes",
                  features: ["VR/AR ready", "Real-time rendering", "Blockchain integration"]
                }
              ].map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        {tool.icon}
                        {tool.title}
                        <Badge className={`${
                          tool.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {tool.status === 'active' ? 'Live' : 'Beta'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{tool.description}</p>
                      <div className="space-y-2 mb-4">
                        {tool.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Play className="w-4 h-4 mr-2" />
                        Launch Tool
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCreations.map((creation, index) => (
                <motion.div
                  key={creation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors group">
                    <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-t-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                          {creation.type === 'AI Art' && <Palette className="w-8 h-8 text-white" />}
                          {creation.type === 'Music' && <Music className="w-8 h-8 text-white" />}
                          {creation.type === 'Video' && <Video className="w-8 h-8 text-white" />}
                        </div>
                        <p className="text-sm text-gray-300">{creation.type}</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2">{creation.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">by {creation.creator}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className="text-gray-300">{creation.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">{creation.views}</span>
                          </div>
                        </div>
                        <div className="text-green-400 font-semibold">{creation.price} ETH</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                          <Play className="w-3 h-3 mr-1" />
                          Rent
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Views</span>
                      <span className="text-white font-semibold">12,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Likes</span>
                      <span className="text-white font-semibold">4,293</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Rental Rate</span>
                      <span className="text-green-400 font-semibold">34.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold">{mockStats.avgRating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">First Creation</p>
                        <p className="text-sm text-gray-400">Created your first NFT</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Community Favorite</p>
                        <p className="text-sm text-gray-400">100+ likes on a creation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Top Creator</p>
                        <p className="text-sm text-gray-400">Top 10% of creators</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
