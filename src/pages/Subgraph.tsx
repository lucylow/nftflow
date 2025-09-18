import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Search, 
  BarChart3, 
  Activity, 
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

export default function Subgraph() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Subgraph Explorer</h1>
          <p className="text-gray-300 text-lg">
            Query blockchain data with GraphQL on Somnia Network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-blue-400" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">NFT Contracts</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rental Events</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">45K</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">User Transactions</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">128K</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-green-400" />
                Network Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">24h Volume</span>
                  <span className="text-white">2,450 STT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Active Rentals</span>
                  <span className="text-white">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">New Listings</span>
                  <span className="text-white">89</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Query Success Rate</span>
                  <span className="text-green-400">99.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Avg Response Time</span>
                  <span className="text-white">45ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Indexed Blocks</span>
                  <span className="text-white">1.2M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">GraphQL Playground</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-300">
{`query {
  nfts(first: 10) {
    id
    tokenId
    owner
    rentalPrice
    isListed
  }
}`}
                  </pre>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Run Query
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">GraphQL</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">REST API</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Beta</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">WebSocket</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-blue-400" />
              Subgraph Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h4 className="text-white font-medium mb-1">Real-time Data</h4>
                <p className="text-gray-400 text-sm">Live blockchain indexing</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h4 className="text-white font-medium mb-1">Secure</h4>
                <p className="text-gray-400 text-sm">Cryptographically verified</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h4 className="text-white font-medium mb-1">Scalable</h4>
                <p className="text-gray-400 text-sm">High-performance queries</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-white font-medium mb-1">Community</h4>
                <p className="text-gray-400 text-sm">Open source protocol</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/analytics">View Analytics</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                <Link to="/marketplace">Explore Data</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
