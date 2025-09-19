import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Image, 
  FileText, 
  DollarSign, 
  Clock, 
  Tag,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context-minimal';

const CreateAndUpload = () => {
  const { account } = useWeb3();
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    tags: '',
    image: null as File | null
  });

  const handleInputChange = (field: string, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('image', file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const categories = [
    'Art', 'Gaming', 'Music', 'Sports', 'Collectibles', 'Utility', 'Virtual Worlds'
  ];

  const durations = [
    '1 hour', '1 day', '1 week', '1 month', '3 months', '6 months', '1 year'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Creator Tools
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Create & Upload NFTs</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            List your NFTs for rental or create new digital assets. Set your terms, 
            pricing, and duration to start earning from your creations.
          </p>
        </motion.div>

        {/* Wallet Connection Check */}
        {!account && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Wallet Required</h3>
                    <p className="text-muted-foreground">
                      Please connect your wallet to create and upload NFTs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New NFT
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Existing NFT
              </TabsTrigger>
            </TabsList>

            {/* Create New NFT Tab */}
            <TabsContent value="create">
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Create New NFT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">NFT Image</label>
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {formData.image ? (
                            <div className="space-y-2">
                              <Image className="h-12 w-12 text-primary mx-auto" />
                              <p className="text-white font-medium">{formData.image.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                              <p className="text-white font-medium">Upload NFT Image</p>
                              <p className="text-sm text-muted-foreground">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">NFT Name</label>
                        <Input
                          placeholder="Enter NFT name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Description</label>
                      <Textarea
                        placeholder="Describe your NFT and its utility..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="bg-background/50 border-border/50 min-h-[100px]"
                      />
                    </div>

                    {/* Pricing and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Rental Price (ETH)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="0.001"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="pl-10 bg-background/50 border-border/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Minimum Duration</label>
                        <select
                          value={formData.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select duration</option>
                          {durations.map(duration => (
                            <option key={duration} value={duration}>{duration}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Tags</label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="art, digital, unique, rare..."
                          value={formData.tags}
                          onChange={(e) => handleInputChange('tags', e.target.value)}
                          className="pl-10 bg-background/50 border-border/50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Separate tags with commas
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        disabled={!account}
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Create NFT
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upload Existing NFT Tab */}
            <TabsContent value="upload">
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload Existing NFT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contract Address */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">NFT Contract Address</label>
                      <Input
                        placeholder="0x..."
                        className="bg-background/50 border-border/50 font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the smart contract address of your existing NFT
                      </p>
                    </div>

                    {/* Token ID */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Token ID</label>
                      <Input
                        placeholder="123"
                        type="number"
                        className="bg-background/50 border-border/50"
                      />
                    </div>

                    {/* Rental Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Rental Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Rental Price (ETH)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              type="number"
                              step="0.001"
                              placeholder="0.001"
                              className="pl-10 bg-background/50 border-border/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Minimum Duration</label>
                          <select className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                            <option value="">Select duration</option>
                            {durations.map(duration => (
                              <option key={duration} value={duration}>{duration}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        disabled={!account}
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Upload for Rental
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-background/50 border-border/50 text-center p-6">
              <div className="text-2xl font-bold text-primary mb-2">1,234</div>
              <div className="text-muted-foreground">NFTs Listed</div>
            </Card>
            <Card className="bg-background/50 border-border/50 text-center p-6">
              <div className="text-2xl font-bold text-primary mb-2">567</div>
              <div className="text-muted-foreground">Active Rentals</div>
            </Card>
            <Card className="bg-background/50 border-border/50 text-center p-6">
              <div className="text-2xl font-bold text-primary mb-2">89.2 ETH</div>
              <div className="text-muted-foreground">Total Volume</div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAndUpload;
