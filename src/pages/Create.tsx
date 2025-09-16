import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, DollarSign, Clock, Info, AlertCircle, Zap, Shield, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Create = () => {
  const { isConnected, account } = useWeb3();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerSecond: "",
    minDuration: "",
    maxDuration: "",
    collateralRequired: "",
    nftContract: "",
    tokenId: "",
    image: null,
    collection: "",
    attributes: []
  });

  const [userNFTs, setUserNFTs] = useState<{
    id: string;
    name: string;
    description: string;
    image: string;
    collection: string;
    pricePerSecond: number;
    isRented: boolean;
    owner: string;
    rarity: string;
    utilityType: string;
  }[]>([]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Clean up previous file URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData(prev => ({ ...prev, image: url }));
    
    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded successfully`,
    });
  }, [toast, previewUrl]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle listing NFT for rental
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to list an NFT",
        variant: "destructive",
      });
      return;
    }

    if (!formData.tokenId) {
      toast({
        title: "Token ID Required",
        description: "Please select an NFT to list",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock implementation - replace with actual contract call when deployed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "NFT Listed Successfully",
        description: "Your NFT has been listed for rental (Mock)",
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        pricePerSecond: "",
        minDuration: "",
        maxDuration: "",
        collateralRequired: "",
        nftContract: "",
        tokenId: "",
        image: null,
        collection: "",
        attributes: []
      });
      
      // Clean up uploaded file
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
      setUploadedFile(null);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to list NFT:", error);
      toast({
        title: "Failed to List NFT",
        description: "An error occurred while listing your NFT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            List Your NFT for Rent
          </h1>
          <p className="text-slate-300 text-lg">
            Earn passive income by renting out your valuable NFTs to other users
          </p>
        </motion.div>

        {!isConnected && (
          <Alert className="mb-8 bg-yellow-500/10 border-yellow-500/30">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Please connect your wallet to list an NFT for rental.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <Card className="border-purple-500/10 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Info className="w-5 h-5 text-purple-400" />
                    NFT Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nftContract" className="text-white">NFT Contract Address</Label>
                    <Input
                      id="nftContract"
                      placeholder="0x..."
                      value={formData.nftContract}
                      onChange={(e) => setFormData({...formData, nftContract: e.target.value})}
                      disabled={!isConnected}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <p className="text-sm text-slate-400 mt-1">
                      Address of the NFT contract
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="tokenId" className="text-white">Token ID</Label>
                    <Input
                      id="tokenId"
                      placeholder="1234"
                      value={formData.tokenId}
                      onChange={(e) => setFormData({...formData, tokenId: e.target.value})}
                      disabled={!isConnected}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <p className="text-sm text-slate-400 mt-1">
                      The specific token ID to list
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="name" className="text-white">NFT Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Cosmic Wizard #1234"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="collection" className="text-white">Collection (Optional)</Label>
                    <Input
                      id="collection"
                      placeholder="e.g. Cosmic Wizards"
                      value={formData.collection}
                      onChange={(e) => setFormData({...formData, collection: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your NFT and what makes it special..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/10 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Rental Pricing & Duration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pricePerSecond" className="text-white">Price per Second (STT)</Label>
                    <Input
                      id="pricePerSecond"
                      type="number"
                      step="0.000001"
                      placeholder="0.000001"
                      value={formData.pricePerSecond}
                      onChange={(e) => setFormData({...formData, pricePerSecond: e.target.value})}
                      disabled={!isConnected}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <p className="text-sm text-slate-400 mt-1">
                      Recommended: 0.000001 - 0.00001 STT per second
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minDuration" className="text-white">Minimum Duration (seconds)</Label>
                      <Input
                        id="minDuration"
                        type="number"
                        placeholder="3600"
                        value={formData.minDuration}
                        onChange={(e) => setFormData({...formData, minDuration: e.target.value})}
                        disabled={!isConnected}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <p className="text-sm text-slate-400 mt-1">
                        Minimum rental time (1 hour = 3600 seconds)
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="maxDuration" className="text-white">Maximum Duration (seconds)</Label>
                      <Input
                        id="maxDuration"
                        type="number"
                        placeholder="2592000"
                        value={formData.maxDuration}
                        onChange={(e) => setFormData({...formData, maxDuration: e.target.value})}
                        disabled={!isConnected}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <p className="text-sm text-slate-400 mt-1">
                        Maximum rental time (30 days = 2,592,000 seconds)
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="collateralRequired" className="text-white">Collateral Required (STT)</Label>
                    <Input
                      id="collateralRequired"
                      type="number"
                      step="0.01"
                      placeholder="1.0"
                      value={formData.collateralRequired}
                      onChange={(e) => setFormData({...formData, collateralRequired: e.target.value})}
                      disabled={!isConnected}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <p className="text-sm text-slate-400 mt-1">
                      Security deposit required from renters
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <div className="text-sm text-slate-400">1 Hour</div>
                      <div className="font-semibold text-green-400">
                        {formData.pricePerSecond ? (parseFloat(formData.pricePerSecond) * 3600).toFixed(6) : "0"} STT
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <div className="text-sm text-slate-400">1 Day</div>
                      <div className="font-semibold text-green-400">
                        {formData.pricePerSecond ? (parseFloat(formData.pricePerSecond) * 86400).toFixed(6) : "0"} STT
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <div className="text-sm text-slate-400">1 Week</div>
                      <div className="font-semibold text-green-400">
                        {formData.pricePerSecond ? (parseFloat(formData.pricePerSecond) * 604800).toFixed(6) : "0"} STT
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-6">
              <Card className="border-purple-500/10 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    NFT Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? "border-purple-500 bg-purple-500/5" 
                        : "border-purple-500/20 hover:border-purple-500/40"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2 text-white">Upload NFT Image</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Drag and drop or click to upload
                    </p>
                    <Button 
                      variant="outline" 
                      className="mb-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={handleFileInputClick}
                      disabled={!isConnected}
                    >
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-400">
                      Supports JPG, PNG, GIF, WebP up to 10MB
                    </p>
                  </div>

                  {uploadedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-white">{uploadedFile.name}</span>
                          <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null);
                            setPreviewUrl("");
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-purple-500/10 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-slate-700/30 rounded-lg flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-white">
                      {formData.name || "NFT Name"}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {formData.collection || "Collection"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        {formData.pricePerSecond || "0"} STT/second
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={!isConnected}
              onClick={() => {
                toast({
                  title: "Save as Draft",
                  description: "Draft saving feature coming soon!",
                });
              }}
            >
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 relative overflow-hidden group"
              disabled={!isConnected || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              <span className="relative z-10">
                {isLoading ? "Listing NFT..." : "List NFT for Rent"}
              </span>
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;
