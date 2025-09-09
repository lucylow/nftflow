import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  Square, 
  Zap, 
  Clock, 
  DollarSign, 
  Settings,
  Trash2,
  Edit,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

interface NFTItem {
  id: string;
  name: string;
  image: string;
  collection: string;
  pricePerSecond: number;
  isRented: boolean;
  owner: string;
  rarity: string;
  utilityType: string;
}

interface BulkOperation {
  id: string;
  type: 'rent' | 'list' | 'unlist' | 'update_price' | 'delete';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  nftIds: string[];
  parameters?: any;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

const BulkOperations: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationType, setOperationType] = useState<'rent' | 'list' | 'unlist' | 'update_price' | 'delete'>('rent');
  const [operationParams, setOperationParams] = useState<any>({});

  // Mock NFT data for demonstration
  const mockNFTs: NFTItem[] = [
    {
      id: '1',
      name: 'Epic Dragon Sword',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      collection: 'Epic Gaming Weapons',
      pricePerSecond: 0.000001,
      isRented: false,
      owner: account || '0x1234567890abcdef',
      rarity: 'Legendary',
      utilityType: 'Gaming Weapon'
    },
    {
      id: '2',
      name: 'Metaverse Land Plot',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop',
      collection: 'Metaverse Land',
      pricePerSecond: 0.000008,
      isRented: false,
      owner: account || '0x1234567890abcdef',
      rarity: 'Epic',
      utilityType: 'Virtual Land'
    },
    {
      id: '3',
      name: 'AI Trading Bot',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
      collection: 'AI Services',
      pricePerSecond: 0.000012,
      isRented: true,
      owner: account || '0x1234567890abcdef',
      rarity: 'Rare',
      utilityType: 'AI Service'
    },
    {
      id: '4',
      name: 'Virtual Gallery Space',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
      collection: 'Virtual Galleries',
      pricePerSecond: 0.000004,
      isRented: false,
      owner: account || '0x1234567890abcdef',
      rarity: 'Common',
      utilityType: 'Art Display'
    },
    {
      id: '5',
      name: 'Music Production Studio',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      collection: 'Creative Tools',
      pricePerSecond: 0.000004,
      isRented: false,
      owner: account || '0x1234567890abcdef',
      rarity: 'Rare',
      utilityType: 'Creative Tool'
    }
  ];

  const [nfts, setNfts] = useState<NFTItem[]>(mockNFTs);

  useEffect(() => {
    if (isConnected && account) {
      // Filter NFTs owned by the current user
      const userNFTs = mockNFTs.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
      setNfts(userNFTs);
    }
  }, [isConnected, account]);

  const handleSelectNFT = (nftId: string, checked: boolean) => {
    if (checked) {
      setSelectedNFTs(prev => [...prev, nftId]);
    } else {
      setSelectedNFTs(prev => prev.filter(id => id !== nftId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNFTs(nfts.map(nft => nft.id));
    } else {
      setSelectedNFTs([]);
    }
  };

  const handleBulkOperation = async () => {
    if (selectedNFTs.length === 0) {
      toast({
        title: "No NFTs Selected",
        description: "Please select at least one NFT to perform bulk operations",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const operation: BulkOperation = {
      id: Date.now().toString(),
      type: operationType,
      status: 'processing',
      nftIds: selectedNFTs,
      parameters: operationParams,
      createdAt: new Date()
    };

    setBulkOperations(prev => [operation, ...prev]);

    try {
      // Simulate bulk operation processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update operation status
      setBulkOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'completed', completedAt: new Date() }
            : op
        )
      );

      // Update NFT states based on operation
      setNfts(prev => prev.map(nft => {
        if (selectedNFTs.includes(nft.id)) {
          switch (operationType) {
            case 'rent':
              return { ...nft, isRented: true };
            case 'list':
              return { ...nft, isRented: false };
            case 'unlist':
              return { ...nft, isRented: false };
            case 'update_price':
              return { ...nft, pricePerSecond: operationParams.newPrice || nft.pricePerSecond };
            case 'delete':
              return nft; // Don't actually delete, just mark as processed
            default:
              return nft;
          }
        }
        return nft;
      }));

      toast({
        title: "Bulk Operation Completed",
        description: `Successfully processed ${selectedNFTs.length} NFTs`,
      });

      setSelectedNFTs([]);
    } catch (error) {
      setBulkOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'failed', error: error.message }
            : op
        )
      );

      toast({
        title: "Bulk Operation Failed",
        description: "An error occurred while processing the bulk operation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'rent': return <Zap className="h-4 w-4" />;
      case 'list': return <CheckCircle className="h-4 w-4" />;
      case 'unlist': return <Square className="h-4 w-4" />;
      case 'update_price': return <DollarSign className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportSelectedNFTs = () => {
    const selectedNFTData = nfts.filter(nft => selectedNFTs.includes(nft.id));
    const csvData = [
      ['ID', 'Name', 'Collection', 'Price (STT/second)', 'Rarity', 'Utility Type', 'Status'],
      ...selectedNFTData.map(nft => [
        nft.id,
        nft.name,
        nft.collection,
        nft.pricePerSecond.toString(),
        nft.rarity,
        nft.utilityType,
        nft.isRented ? 'Rented' : 'Available'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nftflow-bulk-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to manage your NFTs</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bulk Operations
          </h2>
          <p className="text-muted-foreground">Manage multiple NFTs efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportSelectedNFTs} disabled={selectedNFTs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage NFTs</TabsTrigger>
          <TabsTrigger value="operations">Operation History</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Selection Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                NFT Selection
              </CardTitle>
              <CardDescription>
                Select NFTs to perform bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedNFTs.length === nfts.length && nfts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">
                    Select All ({selectedNFTs.length}/{nfts.length})
                  </Label>
                </div>
                <Badge variant="secondary">
                  {selectedNFTs.length} selected
                </Badge>
              </div>

              {/* Operation Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operation-type">Operation Type</Label>
                  <Select value={operationType} onValueChange={setOperationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent NFTs</SelectItem>
                      <SelectItem value="list">List for Rental</SelectItem>
                      <SelectItem value="unlist">Unlist from Rental</SelectItem>
                      <SelectItem value="update_price">Update Price</SelectItem>
                      <SelectItem value="delete">Delete Listings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {operationType === 'update_price' && (
                  <div>
                    <Label htmlFor="new-price">New Price (STT/second)</Label>
                    <Input
                      id="new-price"
                      type="number"
                      step="0.000001"
                      placeholder="0.000001"
                      value={operationParams.newPrice || ''}
                      onChange={(e) => setOperationParams({ ...operationParams, newPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                )}

                {operationType === 'rent' && (
                  <div>
                    <Label htmlFor="rental-duration">Rental Duration (hours)</Label>
                    <Input
                      id="rental-duration"
                      type="number"
                      min="1"
                      max="720"
                      placeholder="24"
                      value={operationParams.duration || ''}
                      onChange={(e) => setOperationParams({ ...operationParams, duration: parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={handleBulkOperation}
                disabled={selectedNFTs.length === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {getOperationIcon(operationType)}
                    <span className="ml-2">
                      {operationType === 'rent' && 'Rent Selected NFTs'}
                      {operationType === 'list' && 'List Selected NFTs'}
                      {operationType === 'unlist' && 'Unlist Selected NFTs'}
                      {operationType === 'update_price' && 'Update Prices'}
                      {operationType === 'delete' && 'Delete Listings'}
                    </span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Card key={nft.id} className={`transition-all duration-200 ${
                selectedNFTs.includes(nft.id) ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedNFTs.includes(nft.id)}
                      onCheckedChange={(checked) => handleSelectNFT(nft.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="aspect-square w-full mb-3 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium truncate">{nft.name}</h4>
                          <p className="text-sm text-muted-foreground">{nft.collection}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {nft.rarity}
                          </Badge>
                          <Badge variant={nft.isRented ? "destructive" : "secondary"} className="text-xs">
                            {nft.isRented ? "Rented" : "Available"}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-medium">{(nft.pricePerSecond * 3600).toFixed(6)} STT/hour</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {nfts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
                <p className="text-muted-foreground">You don't have any NFTs to manage</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operation History
              </CardTitle>
              <CardDescription>
                Track your bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bulkOperations.length > 0 ? (
                <div className="space-y-4">
                  {bulkOperations.map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(operation.type)}
                          <div>
                            <div className="font-medium capitalize">
                              {operation.type.replace('_', ' ')} Operation
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {operation.nftIds.length} NFTs • {operation.createdAt.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(operation.status)}>
                          {operation.status}
                        </Badge>
                        {operation.status === 'processing' && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No operations yet</p>
                  <p className="text-sm">Your bulk operations will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkOperations;
