import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Activity, 
  TrendingUp, 
  Clock,
  DollarSign,
  Zap,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { MockDataService } from '@/mockData';

interface SubgraphDashboardProps {
  className?: string;
}

// Utility functions
const truncateHash = (hash: string) => {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const formatEther = (wei: string) => {
  const ether = parseFloat(wei) / 1e18;
  return ether.toFixed(4);
};

const formatTime = (timestamp: string) => {
  const milliseconds = parseInt(timestamp) * 1000;
  const date = new Date(milliseconds);
  return date.toLocaleString();
};

const formatDuration = (startTime: string, endTime: string) => {
  const start = parseInt(startTime);
  const end = parseInt(endTime);
  const duration = end - start;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// Generate mock flip results
const generateMockFlipResults = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `flip-${i + 1}`,
    player: `0x${Math.random().toString(16).substr(2, 40)}`,
    betAmount: (Math.random() * 5 + 0.1).toFixed(4),
    choice: Math.random() > 0.5 ? 'HEADS' : 'TAILS',
    result: Math.random() > 0.5 ? 'HEADS' : 'TAILS',
    payout: Math.random() > 0.5 ? (Math.random() * 10).toFixed(4) : '0',
    blockNumber: 12345678 + i,
    blockTimestamp: (Date.now() / 1000 - i * 300).toString(),
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
  }));
};

// Flip Results Component
const FlipResults = () => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  const flipResults = generateMockFlipResults(itemsPerPage);
  const loading = false;
  const error = null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading flip results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>Error: {error.message}</span>
      </div>
    );
  }

  if (!flipResults?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No flip results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Coin Flip Results</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Player</th>
              <th className="text-left py-3 px-2">Bet Amount</th>
              <th className="text-left py-3 px-2">Choice</th>
              <th className="text-left py-3 px-2">Result</th>
              <th className="text-left py-3 px-2">Payout</th>
              <th className="text-left py-3 px-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {flipResults.map((flip: any, index: number) => (
              <motion.tr
                key={flip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3 px-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {truncateHash(flip.player)}
                  </code>
                </td>
                <td className="py-3 px-2 font-medium">
                  {flip.betAmount} STT
                </td>
                <td className="py-3 px-2">
                  <Badge variant={flip.choice === 'HEADS' ? 'default' : 'secondary'}>
                    {flip.choice}
                  </Badge>
                </td>
                <td className="py-3 px-2">
                  <Badge 
                    variant={flip.result === 'HEADS' ? 'default' : 'secondary'}
                    className={flip.result === flip.choice ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {flip.result}
                  </Badge>
                </td>
                <td className="py-3 px-2">
                  <span className={flip.payout !== '0' ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {flip.payout !== '0' ? `+${flip.payout}` : '0'} STT
                  </span>
                </td>
                <td className="py-3 px-2 text-xs text-gray-500">
                  {formatTime(flip.blockTimestamp)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">Page {page + 1}</span>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={flipResults.length < itemsPerPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Live Feed Component
const LiveFeed = () => {
  const recentFlips = generateMockFlipResults(10);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-500" />
        <h3 className="text-lg font-semibold">Live Activity Feed</h3>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
          Live
        </Badge>
      </div>

      <div className="space-y-3">
        {recentFlips.map((flip: any, index: number) => (
          <motion.div
            key={flip.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {truncateHash(flip.player)}
                  </code>
                  <span className="text-sm text-gray-500">
                    bet {flip.betAmount} STT
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    Choice: <Badge variant="outline">{flip.choice}</Badge>
                  </span>
                  <span>
                    Result: <Badge 
                      variant={flip.result === flip.choice ? 'default' : 'destructive'}
                      className={flip.result === flip.choice ? 'bg-green-500' : 'bg-red-500'}
                    >
                      {flip.result}
                    </Badge>
                  </span>
                  <span className={flip.payout !== '0' ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {flip.payout !== '0' ? `+${flip.payout} STT` : 'No win'}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                {formatTime(flip.blockTimestamp)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Statistics Component
const Statistics = () => {
  const flipStats = MockDataService.getFlipResults();
  const networkData = MockDataService.getNetworkData();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Network Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Total Flips</span>
            </div>
            <div className="text-2xl font-bold">{flipStats.totalFlips.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Total Volume</span>
            </div>
            <div className="text-2xl font-bold">{flipStats.totalVolume} STT</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            <div className="text-2xl font-bold">{flipStats.winRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Avg Bet</span>
            </div>
            <div className="text-2xl font-bold">{flipStats.averageBet} STT</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Network Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Current Block:</span>
              <div className="font-mono text-lg">{networkData.currentBlock.toLocaleString()}</div>
            </div>
            <div>
              <span className="font-medium">Block Time:</span>
              <div className="font-mono text-lg">{networkData.blockTime}s</div>
            </div>
            <div>
              <span className="font-medium">TPS:</span>
              <div className="font-mono text-lg">{networkData.transactionsPerSecond.toLocaleString()}</div>
            </div>
            <div>
              <span className="font-medium">Gas Price:</span>
              <div className="font-mono text-lg">{networkData.gasPrice} STT</div>
            </div>
            <div>
              <span className="font-medium">Active Accounts:</span>
              <div className="font-mono text-lg">{networkData.activeAccounts.toLocaleString()}</div>
            </div>
            <div>
              <span className="font-medium">Uptime:</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{networkData.uptime}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
export default function SubgraphDashboardMock({ className }: SubgraphDashboardProps) {
  const [activeTab, setActiveTab] = useState('flips');

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Database className="w-6 h-6" />
          Somnia Subgraph Dashboard
        </h2>
        <p className="text-gray-600">
          Real-time blockchain data from Somnia subgraphs (Mock Data)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flips">Coin Flips</TabsTrigger>
          <TabsTrigger value="live">Live Feed</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="flips" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <FlipResults />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <LiveFeed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <Statistics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


