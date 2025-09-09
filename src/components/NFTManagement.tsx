import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Upload, 
  Settings, 
  Eye, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3 } from "@/contexts/Web3Context";
import { useNFTManagement } from "@/hooks/useNFTManagement";
import { useNFTFlow } from "@/hooks/useNFTFlow";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

const NFTManagement = () => {
  const { isConnected, account } = useWeb3();
  const { 
    mintNFT, 
    getUserNFTs, 
    approveNFTFlow, 
    isLoading: isMinting 
  } = useNFTManagement();
  const { listForRental, isLoading: isListing } = useNFTFlow();
  const { toast } = useToast();

  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mintFormData, setMintFormData] = useState({
    name: "",
    description: "",
    image: "",
    attributes: []
  });
  const [listingFormData, setListingFormData] = useState({
    tokenId: "",
    pricePerSecond: "",
    minDuration: "",
    maxDuration: "",
    collateralRequired: ""
  });

  // Load user's NFTs
  const loadUserNFTs = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const nfts = await getUserNFTs();
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Failed to load user NFTs:', error);
      toast({
        title: "Failed to Load NFTs",
        description: "Could not load your NFTs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      await loadUserNFTs(); // Refresh the list
    } catch (error) {
      console.error("Failed to mint NFT:", error);
    }
  };

  // Handle listing NFT for rental
  const handleListForRental = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to list an NFT",
        variant: "destructive",
      });
      return;
    }

    try {
      await listForRental(
        CONTRACT_ADDRESSES.MockERC721,
        listingFormData.tokenId,
        listingFormData.pricePerSecond,
        listingFormData.minDuration,
        listingFormData.maxDuration,
        listingFormData.collateralRequired
      );
      
      setListingFormData({
        tokenId: "",
        pricePerSecond: "",
        minDuration: "",
        maxDuration: "",
        collateralRequired: ""
      });
      
      await loadUserNFTs(); // Refresh the list
    } catch (error) {
      console.error("Failed to list NFT:", error);
    }
  };

  // Approve NFTFlow for all NFTs
  const handleApproveAll = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      await approveNFTFlow("0"); // This approves for all tokens
      await loadUserNFTs(); // Refresh the list
    } catch (error) {
      console.error("Failed to approve NFTFlow:", error);
    }
  };

  useEffect(() => {
    loadUserNFTs();
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to manage NFTs</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">NFT Management</h2>
        <Button onClick={loadUserNFTs} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="mint" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mint">Mint NFT</TabsTrigger>
          <TabsTrigger value="list">List for Rental</TabsTrigger>
          <TabsTrigger value="manage">Manage NFTs</TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Mint New NFT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMint} className="space-y-4">
                <div>
                  <Label htmlFor="mint-name">Name</Label>
                  <Input
                    id="mint-name"
                    value={mintFormData.name}
                    onChange={(e) => setMintFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter NFT name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mint-description">Description</Label>
                  <Textarea
                    id="mint-description"
                    value={mintFormData.description}
                    onChange={(e) => setMintFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter NFT description"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mint-image">Image URL</Label>
                  <Input
                    id="mint-image"
                    value={mintFormData.image}
                    onChange={(e) => setMintFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Enter image URL"
                    required
                  />
                </div>
                <Button type="submit" disabled={isMinting} className="w-full">
                  {isMinting ? "Minting..." : "Mint NFT"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                List NFT for Rental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleListForRental} className="space-y-4">
                <div>
                  <Label htmlFor="list-tokenId">Token ID</Label>
                  <Input
                    id="list-tokenId"
                    value={listingFormData.tokenId}
                    onChange={(e) => setListingFormData(prev => ({ ...prev, tokenId: e.target.value }))}
                    placeholder="Enter token ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="list-price">Price per Second (ETH)</Label>
                  <Input
                    id="list-price"
                    type="number"
                    step="0.000001"
                    value={listingFormData.pricePerSecond}
                    onChange={(e) => setListingFormData(prev => ({ ...prev, pricePerSecond: e.target.value }))}
                    placeholder="0.000001"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="list-minDuration">Min Duration (seconds)</Label>
                    <Input
                      id="list-minDuration"
                      type="number"
                      value={listingFormData.minDuration}
                      onChange={(e) => setListingFormData(prev => ({ ...prev, minDuration: e.target.value }))}
                      placeholder="3600"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="list-maxDuration">Max Duration (seconds)</Label>
                    <Input
                      id="list-maxDuration"
                      type="number"
                      value={listingFormData.maxDuration}
                      onChange={(e) => setListingFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
                      placeholder="2592000"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="list-collateral">Collateral Required (ETH)</Label>
                  <Input
                    id="list-collateral"
                    type="number"
                    step="0.1"
                    value={listingFormData.collateralRequired}
                    onChange={(e) => setListingFormData(prev => ({ ...prev, collateralRequired: e.target.value }))}
                    placeholder="0.1"
                    required
                  />
                </div>
                <Button type="submit" disabled={isListing} className="w-full">
                  {isListing ? "Listing..." : "List for Rental"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your NFTs ({userNFTs.length})</h3>
            <Button onClick={handleApproveAll} variant="outline" size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve All for Rental
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userNFTs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No NFTs found. Mint your first NFT!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userNFTs.map((nft) => (
                <motion.div
                  key={nft.tokenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-semibold mb-2">{nft.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{nft.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={nft.isApproved ? "default" : "secondary"}>
                          {nft.isApproved ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Not Approved
                            </>
                          )}
                        </Badge>
                        <Badge variant={nft.isListed ? "default" : "outline"}>
                          {nft.isListed ? "Listed" : "Not Listed"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NFTManagement;
