import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, Image as ImageIcon, Palette, Zap, CheckCircle, Download, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AIGeneratedImage {
  id: string;
  prompt: string;
  style: string;
  model: string;
  image: string;
  status: 'generating' | 'completed' | 'failed';
  timestamp: Date;
}

export const AIImageGenerationShowcase: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<AIGeneratedImage[]>([
    {
      id: '1',
      prompt: 'Epic Legendary Sword - glowing blue energy, fantasy RPG style',
      style: 'Game Asset',
      model: 'DALL-E 3',
      image: '/api/placeholder/400/400',
      status: 'completed',
      timestamp: new Date(Date.now() - 5000)
    },
    {
      id: '2',
      prompt: 'Abstract digital art - vibrant colors, modern NFT aesthetic',
      style: 'Digital Art',
      model: 'Midjourney',
      image: '/api/placeholder/400/400',
      status: 'completed',
      timestamp: new Date(Date.now() - 10000)
    },
    {
      id: '3',
      prompt: 'Metaverse avatar - cyberpunk style, neon aesthetics',
      style: '3D Avatar',
      model: 'Stable Diffusion',
      image: '/api/placeholder/400/400',
      status: 'completed',
      timestamp: new Date(Date.now() - 15000)
    }
  ]);

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(0);
    
    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    setTimeout(() => {
      const promptElement = document.getElementById('prompt') as HTMLTextAreaElement;
      const newImage: AIGeneratedImage = {
        id: Date.now().toString(),
        prompt: promptElement?.value || 'Custom AI-generated NFT',
        style: 'Auto',
        model: 'GPT-4 DALL-E',
        image: '/api/placeholder/400/400',
        status: 'completed',
        timestamp: new Date()
      };
      setGeneratedImages(prev => [newImage, ...prev]);
      setGenerating(false);
      setProgress(0);
    }, 3000);
  };

  const models = [
    { name: 'DALL-E 3', provider: 'OpenAI', quality: 'Ultra High', cost: 'Premium' },
    { name: 'Midjourney', provider: 'Midjourney', quality: 'High', cost: 'Standard' },
    { name: 'Stable Diffusion', provider: 'Stability AI', quality: 'High', cost: 'Budget' },
    { name: 'DeepFloyd IF', provider: 'Stability AI', quality: 'Ultra High', cost: 'Premium' }
  ];

  return (
    <div className="space-y-12 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4">
          🎨 AI Image Generation
        </Badge>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Create Stunning NFTs with AI
        </h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Generate unique NFT images with cutting-edge AI models. From concept to minting in seconds.
        </p>
      </motion.div>

      {/* AI Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {models.map((model, idx) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Wand2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{model.name}</CardTitle>
                    <p className="text-sm text-slate-400">{model.provider}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Quality</span>
                  <Badge className="bg-purple-500/20 text-purple-400">{model.quality}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Cost</span>
                  <Badge className="bg-green-500/20 text-green-400">{model.cost}</Badge>
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Model
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Generation Interface */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Palette className="w-6 h-6 text-purple-400" />
            AI Generation Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Describe Your NFT
                </label>
                <textarea
                  id="prompt"
                  className="w-full h-32 p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  placeholder="e.g., Epic fantasy dragon with glowing blue scales, digital art style..."
                />
              </div>
              <div className="flex gap-3">
                <select className="flex-1 p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                  <option>Auto Style</option>
                  <option>Game Asset</option>
                  <option>Digital Art</option>
                  <option>3D Render</option>
                  <option>Pixel Art</option>
                </select>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
              {generating && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-slate-400">Creating your NFT... {progress}%</p>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <div className="aspect-square bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-center">
                {generating ? (
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
                    <p className="text-slate-400">Generating your image...</p>
                  </div>
                ) : (
                  <ImageIcon className="w-24 h-24 text-slate-600" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Badge className="bg-purple-500/20 text-purple-400 justify-center py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  AI Generated
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 justify-center py-2">
                  <Download className="w-4 h-4 mr-2" />
                  Ready to Mint
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Gallery */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Recent AI Generations
          </h3>
          <Button variant="outline">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {generatedImages.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-purple-900 to-pink-900">
                    <img
                      src={image.image}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <Badge className="bg-purple-500/20 text-purple-400 mb-2">
                          {image.model}
                        </Badge>
                        <p className="text-sm text-slate-300 line-clamp-2">{image.prompt}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{image.style}</span>
                      <span>{image.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
                        Mint NFT
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Features Banner */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Zap, label: 'Lightning Fast', value: '< 10 seconds', desc: 'Generate images in seconds' },
              { icon: Sparkles, label: 'Multiple Models', value: '4 AI Models', desc: 'Choose the best for your needs' },
              { icon: CheckCircle, label: 'High Quality', value: '4K Resolution', desc: 'Museum-quality outputs' }
            ].map((feature, idx) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <div className="text-3xl font-bold text-white mb-2">{feature.value}</div>
                <div className="text-lg font-semibold text-slate-300 mb-1">{feature.label}</div>
                <div className="text-sm text-slate-400">{feature.desc}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

