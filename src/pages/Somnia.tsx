import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Network, 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function Somnia() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Somnia Network</h1>
          <p className="text-gray-300 text-lg">
            The next-generation blockchain for NFT utilities and micro-transactions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Network className="h-5 w-5 text-blue-400" />
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Block Height</span>
                  <span className="text-white">1,234,567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Network Hash</span>
                  <span className="text-white font-mono text-sm">0x1234...5678</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">TPS</span>
                  <span className="text-white">2,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Block Time</span>
                  <span className="text-white">2.5s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Gas Price</span>
                  <span className="text-white">0.001 STT</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-green-400" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Active Users</span>
                  <span className="text-white">12,345</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Validators</span>
                  <span className="text-white">150</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Staked Tokens</span>
                  <span className="text-white">2.5M STT</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Network Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <div>
                    <h4 className="text-white font-medium">Enhanced Security</h4>
                    <p className="text-gray-400 text-sm">Advanced cryptographic protocols</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-green-400" />
                  <div>
                    <h4 className="text-white font-medium">Global Access</h4>
                    <p className="text-gray-400 text-sm">Worldwide network coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">Scalable Infrastructure</h4>
                    <p className="text-gray-400 text-sm">Built for high throughput</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Connect to Somnia Network and start using NFT utilities with micro-transactions.
                </p>
                <div className="flex gap-3">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/wallet">Connect Wallet</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                    <Link to="/marketplace">Explore Marketplace</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}