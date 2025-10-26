import React, { useState } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Eye, CheckCircle } from 'lucide-react';

interface Recommendation {
  collection: string;
  tokenId: string;
  reason: string;
  score: number;
  pricePerSecond?: string;
}

/**
 * Accessible AI Agent Recommendations Component
 * Integrates with agent service and AutonomousController
 */
export const AccessibleAgentRecommendations: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [proposing, setProposing] = useState(false);

  const fetchRecommendations = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // In production, this would call your agent service
      const res = await axios.post('/api/agent/recommendations', { 
        user: address 
      });
      setRecs(res.data.recommendations || []);
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      alert('Failed to fetch recommendations. Using fallback data.');
      // Fallback recommendations
      setRecs([
        {
          collection: '0xExampleNFT',
          tokenId: '1',
          reason: 'Popular in your network',
          score: 85
        },
        {
          collection: '0xExampleNFT',
          tokenId: '2',
          reason: 'Trending this week',
          score: 78
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const proposePriceChange = async (rec: Recommendation) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    const newPrice = prompt(
      'Enter new suggested price per second (in wei):',
      '2000000000000'
    );
    
    if (!newPrice) return;

    setProposing(true);
    try {
      // This would call the agent service which calls AutonomousController
      const res = await axios.post('/api/agent/propose-price', {
        listingId: rec.tokenId,
        newPrice,
        reasonCID: `ipfs://reason-${Date.now()}`
      });

      alert(`✅ Price proposal submitted!\nTransaction: ${res.data.txHash}`);
    } catch (err: any) {
      console.error('Failed to propose price:', err);
      alert(`Failed to propose price: ${err.message}`);
    } finally {
      setProposing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">🤖 AI Agent Recommendations</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Personalized NFT rental suggestions powered by AI
          </p>
        </div>
        <Button 
          onClick={fetchRecommendations} 
          disabled={loading || !isConnected}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Get Recommendations
            </>
          )}
        </Button>
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            ⚠️ Connect your wallet to receive personalized recommendations
          </p>
        </div>
      )}

      {recs.length === 0 && !loading && isConnected && (
        <div className="text-center py-12 text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recommendations yet. Click the button above to get AI suggestions.</p>
        </div>
      )}

      <div className="space-y-3">
        {recs.map((rec, idx) => (
          <Card 
            key={idx} 
            className="p-4 hover:bg-accent transition-colors cursor-pointer"
            onClick={() => setSelectedRec(selectedRec === rec ? null : rec)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Token #{rec.tokenId}</span>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Score: {rec.score}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {rec.reason}
                </p>
                {rec.pricePerSecond && (
                  <p className="text-xs text-muted-foreground">
                    Price: {rec.pricePerSecond} wei/sec
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    proposePriceChange(rec);
                  }}
                  disabled={proposing}
                >
                  {proposing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Propose Price
                    </>
                  )}
                </Button>
              </div>
            </div>

            {selectedRec === rec && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">AI Reasoning:</h4>
                <p className="text-sm text-muted-foreground">
                  This NFT is recommended because {rec.reason.toLowerCase()}.
                  The AI analyzed your rental history and market trends to suggest this as a good fit.
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {recs.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>How it works:</strong> These recommendations are generated by AI agents
            analyzing market trends and your rental history. Click "Propose Price" to have an agent
            suggest pricing adjustments for these NFTs.
          </p>
        </div>
      )}
    </Card>
  );
};

