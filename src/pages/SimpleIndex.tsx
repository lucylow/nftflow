import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/WalletConnect';
import { Wallet, Zap, Shield, Clock, BarChart3, ShoppingCart, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SimpleIndex = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">NFTFlow</h1>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-bold text-white mb-6">
            Rent NFTs on
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}Somnia
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            The next-generation NFT rental platform built on Somnia blockchain. 
            Unlock utility without ownership.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2 text-purple-400">
                  <Wallet className="h-6 w-6" />
                  <span>Connect Wallet</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Connect your MetaMask wallet to start renting NFTs on Somnia network
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2 text-blue-400">
                  <Clock className="h-6 w-6" />
                  <span>Micro Rentals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Rent NFTs for as little as seconds with precision timing and fair pricing
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2 text-green-400">
                  <Shield className="h-6 w-6" />
                  <span>Secure & Fast</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Built on Somnia's high-performance blockchain for instant transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => navigate('/marketplace')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Explore Marketplace
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access Navigation */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-8">
            Explore NFTFlow Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Dashboard</h4>
                <p className="text-sm text-slate-300">Manage your NFTs and view analytics</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => navigate('/marketplace')}
            >
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Marketplace</h4>
                <p className="text-sm text-slate-300">Browse and rent NFTs</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/50 border-slate-700/50 hover:border-green-500/50 transition-all cursor-pointer"
              onClick={() => navigate('/create')}
            >
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Create</h4>
                <p className="text-sm text-slate-300">Mint and list new NFTs</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/50 border-slate-700/50 hover:border-pink-500/50 transition-all cursor-pointer"
              onClick={() => navigate('/analytics')}
            >
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Analytics</h4>
                <p className="text-sm text-slate-300">View detailed analytics and insights</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800/30 border-slate-700/30 max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Somnia Testnet</span>
            </div>
            <p className="text-sm text-slate-400">
              Connected to Somnia's high-performance blockchain
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleIndex;