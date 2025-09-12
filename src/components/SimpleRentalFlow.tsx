import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from './ui/use-toast';
import { Clock, Users, Zap, Shield } from 'lucide-react';

interface NFTItem {
  id: string;
  name: string;
  image: string;
  collection: string;
  pricePerSecond: number;
  isRented: boolean;
  owner: string;
}

const SimpleRentalFlow: React.FC = () => {
  const { isConnected, account, nftFlowContract } = useWeb3();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock NFT data for demonstration
  useEffect(() => {
    const mockNFTs: NFTItem[] = [
      {
        id: '1',
        name: 'Cool NFT #1',
        image: '/placeholder.svg',
        collection: 'Cool Collection',
        pricePerSecond: 0.00001,
        isRented: false,
        owner: '0x123...'
      },
      {
        id: '2',
        name: 'Awesome NFT #2',
        image: '/placeholder.svg',
        collection: 'Awesome Collection',
        pricePerSecond: 0.00002,
        isRented: true,
        owner: '0x456...'
      }
    ];
    setNfts(mockNFTs);
  }, []);

  const handleRentNFT = async (nft: NFTItem) => {
    if (!isConnected || !nftFlowContract) {
      toast({
        title: "Please connect your wallet",
        description: "You need to connect your wallet to rent NFTs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate rental transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNfts(prev => prev.map(n => 
        n.id === nft.id ? { ...n, isRented: true } : n
      ));
      
      toast({
        title: "NFT Rented Successfully!",
        description: `You have rented ${nft.name} for 24 hours`,
      });
    } catch (error) {
      console.error('Rental failed:', error);
      toast({
        title: "Rental Failed",
        description: "There was an error processing your rental",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleListNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Please connect your wallet",
        description: "You need to connect your wallet to list NFTs",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "List NFT",
      description: "NFT listing functionality will be available soon",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">NFT Rental Marketplace</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Rent NFTs instantly on Somnia Network. Experience lightning-fast transactions with minimal fees.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Instant Rentals</p>
                <p className="text-xs text-muted-foreground">Sub-second finality</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Secure</p>
                <p className="text-xs text-muted-foreground">Smart contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Flexible Duration</p>
                <p className="text-xs text-muted-foreground">Hours to months</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Community</p>
                <p className="text-xs text-muted-foreground">Growing ecosystem</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <Card key={nft.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              {nft.isRented && (
                <Badge className="absolute top-2 right-2" variant="secondary">
                  Rented
                </Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{nft.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{nft.collection}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price per second</span>
                  <span className="font-semibold">{nft.pricePerSecond} STT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h Cost</span>
                  <span className="font-semibold">
                    {(nft.pricePerSecond * 24 * 3600).toFixed(6)} STT
                  </span>
                </div>
                <Button
                  onClick={() => handleRentNFT(nft)}
                  disabled={nft.isRented || loading}
                  className="w-full"
                >
                  {nft.isRented ? 'Already Rented' : 'Rent for 24h'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="text-center pt-8">
        <Button onClick={handleListNFT} variant="outline" size="lg">
          List Your NFT for Rental
        </Button>
      </div>
    </div>
  );
};

export default SimpleRentalFlow;