import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Users, 
  Zap, 
  ArrowRight,
  Sparkles,
  Globe,
  Shield,
  Clock,
  Palette,
  MessageSquare,
  Heart,
  Share2,
  Calendar,
  Download,
  Plus,
  Upload,
  Image
} from 'lucide-react';

const Discover = () => {
  const [activeTab, setActiveTab] = useState('home');

  // AI Art Generator state
  const [artPrompt, setArtPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('realistic');
  const [artResolution, setArtResolution] = useState('1024x1024');
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [generatedArt, setGeneratedArt] = useState<string | null>(null);

  // Style Transfer state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [targetStyle, setTargetStyle] = useState('van-gogh');
  const [styleIntensity, setStyleIntensity] = useState(50);
  const [isProcessingStyle, setIsProcessingStyle] = useState(false);
  const [styledImage, setStyledImage] = useState<string | null>(null);

  // AI Art Generator functions
  const handleGenerateArt = async () => {
    if (!artPrompt.trim()) return;

    setIsGeneratingArt(true);

    // Simulate AI generation process
    setTimeout(() => {
      setGeneratedArt('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFJIE5GVCBBcnQ8L3RleHQ+PC9zdmc+');
      setIsGeneratingArt(false);
    }, 3000);
  };

  // Style Transfer functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const handleStyleTransfer = async () => {
    if (!uploadedImage) return;

    setIsProcessingStyle(true);

    // Simulate style transfer process
    setTimeout(() => {
      setStyledImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOTk2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0eWxlZCBJbWFnZTwvdGV4dD48L3N2Zz4=');
      setIsProcessingStyle(false);
    }, 4000);
  };

  const trendingNFTs = [
    {
      id: 1,
      name: "Cyberpunk Ape",
      creator: "Digital Dreams",
      price: "0.5 ETH",
      image: "/nfts/cyberpunk-ape.png",
      likes: 120,
      views: 500
    },
    {
      id: 2,
      name: "Abstract Waves",
      creator: "Artistic AI",
      price: "0.3 ETH",
      image: "/nfts/abstract-waves.png",
      likes: 85,
      views: 320
    },
    {
      id: 3,
      name: "Galactic Explorer",
      creator: "Space Visions",
      price: "0.8 ETH",
      image: "/nfts/galactic-explorer.png",
      likes: 150,
      views: 620
    },
    {
      id: 4,
      name: "Neon Cityscape",
      creator: "Urban Digital",
      price: "0.4 ETH",
      image: "/nfts/neon-cityscape.png",
      likes: 95,
      views: 410
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure Transactions",
      description: "Blockchain-backed security for all your NFT dealings."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Instant Rentals",
      description: "Rent NFTs in seconds with our streamlined process."
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "AI-Powered Creation",
      description: "Generate unique NFTs with advanced AI tools."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Vibrant Community",
      description: "Connect with creators and collectors worldwide."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto px-4"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Discover, Create, & Rent <span className="text-primary">NFTs</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Your gateway to the decentralized world of digital assets.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/marketplace">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300">
                Explore Marketplace <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/create">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300">
                Create NFT <Palette className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center text-white mb-12"
          >
            Why NFTFlow?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-300 text-center p-6">
                  <div className="flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search collections, creators, and NFTs..."
              className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border/50 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-4"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 max-w-2xl mx-auto">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="creativity" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Creativity
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home">
            {/* Trending NFTs Section */}
            <section className="py-12">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center justify-between mb-8"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold text-white">Trending NFTs</h2>
                  </div>
                  <Link to="/marketplace">
                    <Button variant="ghost" className="text-primary hover:text-primary/80">
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingNFTs.map((nft, index) => (
                    <motion.div
                      key={nft.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <Badge className="absolute top-3 right-3 bg-primary/80 text-white">Trending</Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-1">{nft.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">by {nft.creator}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-white">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{nft.price}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Heart className="h-4 w-4" />
                              <span>{nft.likes}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Creativity Tab */}
          <TabsContent value="creativity">
            <div className="max-w-7xl mx-auto py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    AI-Powered Creativity
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Creative Tools & AI</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Unleash your creativity with AI-powered tools for generating, editing, and enhancing NFTs.
                </p>
              </motion.div>

              <div className="space-y-8">
                {/* AI Art Generator */}
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Palette className="h-6 w-6 text-primary" />
                      AI Art Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Prompt</label>
                          <textarea
                            placeholder="Describe the NFT art you want to create..."
                            className="w-full p-3 bg-background/30 border border-border/30 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows={3}
                            value={artPrompt}
                            onChange={(e) => setArtPrompt(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Style</label>
                          <select
                            className="w-full p-3 bg-background/30 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={artStyle}
                            onChange={(e) => setArtStyle(e.target.value)}
                          >
                            <option value="realistic">Realistic</option>
                            <option value="abstract">Abstract</option>
                            <option value="cartoon">Cartoon</option>
                            <option value="cyberpunk">Cyberpunk</option>
                            <option value="minimalist">Minimalist</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Resolution</label>
                          <select
                            className="w-full p-3 bg-background/30 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={artResolution}
                            onChange={(e) => setArtResolution(e.target.value)}
                          >
                            <option value="512x512">512x512</option>
                            <option value="1024x1024">1024x1024</option>
                            <option value="2048x2048">2048x2048</option>
                          </select>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                          onClick={handleGenerateArt}
                          disabled={!artPrompt.trim() || isGeneratingArt}
                        >
                          <Palette className="mr-2 h-4 w-4" />
                          {isGeneratingArt ? 'Generating...' : 'Generate NFT Art'}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="aspect-square bg-background/30 border border-border/30 rounded-lg flex items-center justify-center overflow-hidden">
                          {generatedArt ? (
                            <img
                              src={generatedArt}
                              alt="Generated NFT Art"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Palette className="h-12 w-12 mx-auto mb-2" />
                              <p>{isGeneratingArt ? 'Generating art...' : 'Generated art will appear here'}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!generatedArt}
                            onClick={() => generatedArt && window.open(generatedArt, '_blank')}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!generatedArt}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create NFT
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Style Transfer */}
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Style Transfer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Upload NFT Image</label>
                          <div className="border-2 border-dashed border-border/30 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                            </label>
                          </div>
                          {uploadedImage && (
                            <p className="text-sm text-green-400 mt-2">✓ {uploadedImage.name} uploaded</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Target Style</label>
                          <select
                            className="w-full p-3 bg-background/30 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={targetStyle}
                            onChange={(e) => setTargetStyle(e.target.value)}
                          >
                            <option value="van-gogh">Van Gogh</option>
                            <option value="picasso">Picasso</option>
                            <option value="monet">Monet</option>
                            <option value="warhol">Warhol</option>
                            <option value="cyberpunk">Cyberpunk</option>
                            <option value="anime">Anime</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Intensity: {styleIntensity}%</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={styleIntensity}
                            onChange={(e) => setStyleIntensity(Number(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Subtle</span>
                            <span>Strong</span>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                          onClick={handleStyleTransfer}
                          disabled={!uploadedImage || isProcessingStyle}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {isProcessingStyle ? 'Processing...' : 'Apply Style Transfer'}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="aspect-square bg-background/30 border border-border/30 rounded-lg flex items-center justify-center overflow-hidden">
                            {uploadedImage ? (
                              <img
                                src={URL.createObjectURL(uploadedImage)}
                                alt="Original"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-muted-foreground">
                                <Image className="h-8 w-8 mx-auto mb-1" />
                                <p className="text-xs">Original</p>
                              </div>
                            )}
                          </div>
                          <div className="aspect-square bg-background/30 border border-border/30 rounded-lg flex items-center justify-center overflow-hidden">
                            {styledImage && uploadedImage ? (
                              <img
                                src={styledImage}
                                alt="Styled"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-muted-foreground">
                                <Sparkles className="h-8 w-8 mx-auto mb-1" />
                                <p className="text-xs">{isProcessingStyle ? 'Processing...' : 'Styled'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!styledImage || !uploadedImage}
                            onClick={() => styledImage && window.open(styledImage, '_blank')}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!styledImage || !uploadedImage}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create NFT
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3D Model Creator */}
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Globe className="h-6 w-6 text-primary" />
                      3D Model Creator
                      <Badge className="bg-yellow-500/20 text-yellow-400">Coming Soon</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold text-white mb-2">3D Model Creator</h3>
                      <p className="text-muted-foreground mb-6">
                        Generate 3D NFT models with AI assistance. This feature is currently in development.
                      </p>
                      <div className="bg-background/30 border border-border/30 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-white mb-2">Planned Features:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Text-to-3D model generation</li>
                          <li>• Customizable materials and textures</li>
                          <li>• Animation support</li>
                          <li>• Export to multiple 3D formats</li>
                        </ul>
                      </div>
                      <Button variant="outline" disabled>
                        <Globe className="mr-2 h-4 w-4" />
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <div className="max-w-7xl mx-auto py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Community Hub
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Social & Community</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Connect with creators, share your NFTs, and join the vibrant NFTFlow community.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Community Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          author: "NFTMaster",
                          content: "Just created my first AI-generated NFT collection!",
                          likes: 23,
                          comments: 5,
                          time: "2 hours ago"
                        },
                        {
                          author: "CryptoArtist",
                          content: "The new rental feature is amazing for testing NFTs before buying",
                          likes: 45,
                          comments: 12,
                          time: "4 hours ago"
                        }
                      ].map((post, index) => (
                        <div key={index} className="p-4 bg-background/30 rounded-lg border border-border/30">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{post.author}</h4>
                                <span className="text-xs text-muted-foreground">{post.time}</span>
                              </div>
                              <p className="text-muted-foreground mb-2">{post.content}</p>
                              <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                                  <Heart className="mr-1 h-3 w-3" />
                                  {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  {post.comments}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                                  <Share2 className="mr-1 h-3 w-3" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Members</span>
                        <span className="text-white font-medium">12,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Today</span>
                        <span className="text-white font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posts Today</span>
                        <span className="text-white font-medium">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NFTs Shared</span>
                        <span className="text-white font-medium">456</span>
                      </div>
                    </div>
                    <Button className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Discover;
