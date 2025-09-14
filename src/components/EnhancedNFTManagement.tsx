import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Upload,
  Plus,
  Zap,
  Fuel,
  Shield,
  Layers,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useEnhancedNFTFlow } from '@/hooks/useEnhancedNFTFlow';
import { useBlockchainEvents } from '@/hooks/useBlockchainEvents';
import { TransactionStatus } from '@/components/TransactionStatus';
import { useToast } from '@/hooks/use-toast';

interface BatchListingItem {
  tokenId: string;
  pricePerSecond: string;
  minDuration: number;
  maxDuration: number;
  collateralRequired: string;
}

export const EnhancedNFTManagement: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const { 
    listForRentalEnhanced,
    batchListNFTs,
    transactionStatus,
    gasEstimate,
    clearTransactionStatus,
    isLoading
  } = useEnhancedNFTFlow();
  const { userEvents, isListening } = useBlockchainEvents();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('single');
  const [validateMetadata, setValidateMetadata] = useState(true);
  const [gasOptimization, setGasOptimization] = useState(true);

  // Single listing form
  const [singleForm, setSingleForm] = useState({
    nftContract: '',
    tokenId: '',
    pricePerSecond: '',
    minDuration: 3600,
    maxDuration: 86400,
    collateralRequired: '1.0'
  });

  // Batch listing form
  const [batchItems, setBatchItems] = useState<BatchListingItem[]>([{
    tokenId: '',
    pricePerSecond: '',
    minDuration: 3600,
    maxDuration: 86400,
    collateralRequired: '1.0'
  }]);
  const [batchProgress, setBatchProgress] = useState(0);

  // Handle single NFT listing
  const handleSingleListing = async (e: React.FormEvent) => {
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
      await listForRentalEnhanced(
        singleForm.nftContract,
        singleForm.tokenId,
        singleForm.pricePerSecond,
        singleForm.minDuration,
        singleForm.maxDuration,
        singleForm.collateralRequired,
        validateMetadata
      );

      // Reset form on success
      setSingleForm({
        nftContract: '',
        tokenId: '',
        pricePerSecond: '',
        minDuration: 3600,
        maxDuration: 86400,
        collateralRequired: '1.0'
      });
    } catch (error) {
      console.error('Single listing failed:', error);
    }
  };

  // Handle batch listing
  const handleBatchListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || batchItems.length === 0) {
      toast({
        title: "Invalid Batch",
        description: "Please connect wallet and add items to batch",
        variant: "destructive",
      });
      return;
    }

    setBatchProgress(0);

    try {
      const listings = batchItems
        .filter(item => item.tokenId && item.pricePerSecond)
        .map(item => ({
          nftContract: singleForm.nftContract, // Use same contract for batch
          tokenId: item.tokenId,
          pricePerSecond: item.pricePerSecond,
          minDuration: item.minDuration,
          maxDuration: item.maxDuration,
          collateralRequired: item.collateralRequired
        }));

      if (listings.length === 0) {
        toast({
          title: "No Valid Items",
          description: "Please fill in required fields for at least one item",
          variant: "destructive",
        });
        return;
      }

      const results = await batchListNFTs(listings);
      
      if (results) {
        setBatchProgress(100);
        // Reset batch items
        setBatchItems([{
          tokenId: '',
          pricePerSecond: '',
          minDuration: 3600,
          maxDuration: 86400,
          collateralRequired: '1.0'
        }]);
      }
    } catch (error) {
      console.error('Batch listing failed:', error);
    }
  };

  // Add batch item
  const addBatchItem = () => {
    setBatchItems(prev => [...prev, {
      tokenId: '',
      pricePerSecond: '',
      minDuration: 3600,
      maxDuration: 86400,
      collateralRequired: '1.0'
    }]);
  };

  // Remove batch item
  const removeBatchItem = (index: number) => {
    setBatchItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update batch item
  const updateBatchItem = (index: number, field: keyof BatchListingItem, value: any) => {
    setBatchItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to access enhanced NFT management</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <TransactionStatus 
        status={transactionStatus} 
        onClose={clearTransactionStatus}
      />

      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{userEvents.length}</div>
            <div className="text-sm text-muted-foreground">Recent Events</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
          <CardContent className="p-4 text-center">
            <Fuel className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent">{gasEstimate}</div>
            <div className="text-sm text-muted-foreground">Est. Gas (ETH)</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-500">{isListening ? 'ON' : 'OFF'}</div>
            <div className="text-sm text-muted-foreground">Event Listening</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-purple-500">
              {gasOptimization ? 'OPTIMIZED' : 'STANDARD'}
            </div>
            <div className="text-sm text-muted-foreground">Gas Mode</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Metadata Validation</Label>
              <p className="text-sm text-muted-foreground">
                Validate NFT metadata before listing
              </p>
            </div>
            <Switch
              checked={validateMetadata}
              onCheckedChange={setValidateMetadata}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Gas Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Use optimized gas settings for transactions
              </p>
            </div>
            <Switch
              checked={gasOptimization}
              onCheckedChange={setGasOptimization}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Single Listing
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Batch Listing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>List NFT for Rental</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleListing} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nftContract">NFT Contract Address</Label>
                    <Input
                      id="nftContract"
                      value={singleForm.nftContract}
                      onChange={(e) => setSingleForm(prev => ({ ...prev, nftContract: e.target.value }))}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tokenId">Token ID</Label>
                    <Input
                      id="tokenId"
                      value={singleForm.tokenId}
                      onChange={(e) => setSingleForm(prev => ({ ...prev, tokenId: e.target.value }))}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pricePerSecond">Price per Second (STT)</Label>
                    <Input
                      id="pricePerSecond"
                      type="number"
                      step="0.000001"
                      value={singleForm.pricePerSecond}
                      onChange={(e) => setSingleForm(prev => ({ ...prev, pricePerSecond: e.target.value }))}
                      placeholder="0.000001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minDuration">Min Duration (seconds)</Label>
                    <Select
                      value={singleForm.minDuration.toString()}
                      onValueChange={(value) => setSingleForm(prev => ({ ...prev, minDuration: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3600">1 Hour</SelectItem>
                        <SelectItem value="7200">2 Hours</SelectItem>
                        <SelectItem value="21600">6 Hours</SelectItem>
                        <SelectItem value="43200">12 Hours</SelectItem>
                        <SelectItem value="86400">1 Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxDuration">Max Duration (seconds)</Label>
                    <Select
                      value={singleForm.maxDuration.toString()}
                      onValueChange={(value) => setSingleForm(prev => ({ ...prev, maxDuration: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="86400">1 Day</SelectItem>
                        <SelectItem value="172800">2 Days</SelectItem>
                        <SelectItem value="604800">7 Days</SelectItem>
                        <SelectItem value="2592000">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="collateralRequired">Collateral Required (STT)</Label>
                  <Input
                    id="collateralRequired"
                    type="number"
                    step="0.1"
                    value={singleForm.collateralRequired}
                    onChange={(e) => setSingleForm(prev => ({ ...prev, collateralRequired: e.target.value }))}
                    placeholder="1.0"
                    required
                  />
                </div>

                {gasEstimate !== '0' && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Fuel className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Gas Estimate</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimated gas cost: {gasEstimate} ETH
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      List for Rental
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch List NFTs</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBatchListing} className="space-y-4">
                <div>
                  <Label htmlFor="batchContract">NFT Contract Address (for all items)</Label>
                  <Input
                    id="batchContract"
                    value={singleForm.nftContract}
                    onChange={(e) => setSingleForm(prev => ({ ...prev, nftContract: e.target.value }))}
                    placeholder="0x..."
                    required
                  />
                </div>

                {batchProgress > 0 && batchProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Batch Progress</span>
                      <span>{batchProgress}%</span>
                    </div>
                    <Progress value={batchProgress} />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Batch Items ({batchItems.length})</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBatchItem}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  {batchItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Item {index + 1}</span>
                        {batchItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBatchItem(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div>
                          <Label>Token ID</Label>
                          <Input
                            value={item.tokenId}
                            onChange={(e) => updateBatchItem(index, 'tokenId', e.target.value)}
                            placeholder="123"
                          />
                        </div>
                        <div>
                          <Label>Price/sec</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            value={item.pricePerSecond}
                            onChange={(e) => updateBatchItem(index, 'pricePerSecond', e.target.value)}
                            placeholder="0.000001"
                          />
                        </div>
                        <div>
                          <Label>Min Duration</Label>
                          <Input
                            type="number"
                            value={item.minDuration}
                            onChange={(e) => updateBatchItem(index, 'minDuration', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Max Duration</Label>
                          <Input
                            type="number"
                            value={item.maxDuration}
                            onChange={(e) => updateBatchItem(index, 'maxDuration', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Collateral</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={item.collateralRequired}
                            onChange={(e) => updateBatchItem(index, 'collateralRequired', e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || batchItems.some(item => !item.tokenId || !item.pricePerSecond)} 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing Batch...
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4 mr-2" />
                      List All NFTs ({batchItems.filter(item => item.tokenId && item.pricePerSecond).length})
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};