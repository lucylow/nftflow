import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, DollarSign, Clock, Info, AlertCircle, Zap, Shield, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeb3 } from "@/contexts/Web3Context";
import { useNFTFlow } from "@/hooks/useNFTFlow";
import { useNFTManagement } from "@/hooks/useNFTManagement";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { FormSkeleton, LoadingSpinner } from "@/components/ui/skeleton";

const Create = () => {
  const { isConnected, account } = useWeb3();
  const { listForRental, isLoading } = useNFTFlow();
  const { mintNFT, getUserNFTs, approveNFTFlow, isLoading: isMinting } = useNFTManagement();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerSecond: "",
    minDuration: "",
    maxDuration: "",
    collateralRequired: "",
    nftContract: CONTRACT_ADDRESSES.MockERC721,
    tokenId: "",
    image: null,
    collection: "",
    attributes: []
  });

  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [showMintForm, setShowMintForm] = useState(false);
  const [mintFormData, setMintFormData] = useState({
    name: "",
    description: "",
    image: "",
    attributes: []
  });

  // Load user's NFTs
  const loadUserNFTs = async () => {
    if (!isConnected) return;
    
    try {
      const nfts = await getUserNFTs();
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Failed to load user NFTs:', error);
    }
  };

  // Handle minting a new NFT
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint an NFT",
        variant: "destructive",
      });
      return;
    }

    try {
      await mintNFT(mintFormData);
      setMintFormData({ name: "", description: "", image: "", attributes: [] });
      setShowMintForm(false);
      await loadUserNFTs(); // Refresh the list
    } catch (error) {
      console.error("Failed to mint NFT:", error);
    }
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

    try {
      await listForRental(
        formData.nftContract,
        formData.tokenId,
        formData.pricePerSecond,
        formData.minDuration,
        formData.maxDuration,
        formData.collateralRequired
      );
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        pricePerSecond: "",
        minDuration: "",
        maxDuration: "",
        collateralRequired: "",
        nftContract: CONTRACT_ADDRESSES.MockERC721,
        tokenId: "",
        image: null,
        collection: "",
        attributes: []
      });
      
      await loadUserNFTs(); // Refresh the list
    } catch (error) {
      console.error("Failed to list NFT:", error);
    }
  };

  // Load user NFTs on component mount
  useEffect(() => {
    loadUserNFTs();
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            List Your NFT for Rent
          </h1>
          <p className="text-muted-foreground text-lg">
            Earn passive income by renting out your valuable NFTs to other users
          </p>
        </motion.div>

        {!isConnected && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to list an NFT for rental.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    NFT Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nftContract">NFT Contract Address</Label>
                    <Input
                      id="nftContract"
                      placeholder="0x..."
                      value={formData.nftContract}
                      onChange={(e) => setFormData({...formData, nftContract: e.target.value})}
                      disabled={!isConnected}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Address of the NFT contract
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="tokenId">Token ID</Label>
                    <Input
                      id="tokenId"
                      placeholder="1234"
                      value={formData.tokenId}
                      onChange={(e) => setFormData({...formData, tokenId: e.target.value})}
                      disabled={!isConnected}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      The specific token ID to list
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">NFT Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Cosmic Wizard #1234"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="collection">Collection (Optional)</Label>
                    <Input
                      id="collection"
                      placeholder="e.g. Cosmic Wizards"
                      value={formData.collection}
                      onChange={(e) => setFormData({...formData, collection: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your NFT and what makes it special..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    Rental Pricing & Duration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pricePerSecond">Price per Second (STT)</Label>
                    <Input
                      id="pricePerSecond"
                      type="number"
                      step="0.000001"
                      placeholder="0.000001"
                      value={formData.pricePerSecond}
                      onChange={(e) => setFormData({...formData, pricePerSecond: e.target.value})}
                      disabled={!isConnected}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Recommended: 0.000001 - 0.00001 STT per second
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minDuration">Minimum Duration (seconds)</Label>
                      <Input
                        id="minDuration"
                        type="number"
                        placeholder="3600"
                        value={formData.minDuration}
                        onChange={(e) => setFormData({...formData, minDuration: e.target.value})}
                        disabled={!isConnected}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum rental time (1 hour = 3600 seconds)
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="maxDuration">Maximum Duration (seconds)</Label>
                      <Input
                        id="maxDuration"
                        type="number"
                        placeholder="2592000"
                        value={formData.maxDuration}
                        onChange={(e) => setFormData({...formData, maxDuration: e.target.value})}
                        disabled={!isConnected}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Maximum rental time (30 days = 2,592,000 seconds)
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="collateralRequired">Collateral Required (STT)</Label>
                    <Input
                      id="collateralRequired"
                      type="number"
                      step="0.01"
                      placeholder="1.0"
                      value={formData.collateralRequired}
                      onChange={(e) => setFormData({...formData, collateralRequired: e.target.value})}
                      disabled={!isConnected}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Security deposit required from renters
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">1 Hour</div>
                      <div className="font-semibold text-success">
                        {formData.pricePerSecond ? (parseFloat(formData.pricePerSecond) * 3600).toFixed(6) : "0"} STT
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">1 Day</div>
                      <div className="font-semibold text-success">
                        {formData.pricePerSecond ? (parseFloat(formData.pricePerSecond) * 86400).toFixed(6) : "0"} STT
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">1 Week</div>
                      <div className="font-semibold text-success">
                        {formData.pricePerSecond ? (parseFloat(formData.pricePerSecond) * 604800).toFixed(6) : "0"} STT
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-6">
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-accent" />
                    NFT Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Upload NFT Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop or click to upload
                    </p>
                    <Button 
                      variant="outline" 
                      className="mb-2"
                      onClick={() => {
                        toast({
                          title: "File Upload",
                          description: "File upload feature coming soon!",
                        });
                      }}
                    >
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">
                      {formData.name || "NFT Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.collection || "Collection"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        <Clock className="w-3 h-3 mr-1" />
                        {formData.pricePerSecond || "0"} STT/second
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
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
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 relative overflow-hidden group"
              disabled={!isConnected || isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
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