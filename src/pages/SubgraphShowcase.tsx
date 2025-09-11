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
  Globe,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  ExternalLink,
  Code,
  Play,
  Download,
  Share2
} from 'lucide-react';
import SubgraphDashboardMock from '@/components/SubgraphDashboardMock';
import RentalSubgraphMock from '@/components/RentalSubgraphMock';

const SubgraphShowcase = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      title: 'Real-Time Data',
      description: 'Live blockchain data with automatic refresh',
      icon: <Activity className="w-6 h-6" />,
      color: 'text-green-500'
    },
    {
      title: 'GraphQL Queries',
      description: 'Efficient data fetching with GraphQL',
      icon: <Code className="w-6 h-6" />,
      color: 'text-blue-500'
    },
    {
      title: 'Apollo Client',
      description: 'Advanced caching and state management',
      icon: <Database className="w-6 h-6" />,
      color: 'text-purple-500'
    },
    {
      title: 'Somnia Integration',
      description: 'Native Somnia subgraph support',
      icon: <Globe className="w-6 h-6" />,
      color: 'text-orange-500'
    }
  ];

  const subgraphEndpoints = [
    {
      name: 'SomFlip Game',
      url: 'https://proxy.somnia.chain.love/subgraphs/name/somnia-testnet/SomFlip',
      description: 'Coin flip game results and statistics',
      status: 'Active'
    },
    {
      name: 'NFTFlow Rentals',
      url: 'https://proxy.somnia.chain.love/subgraphs/name/nftflow/rentals',
      description: 'NFT rental activity and analytics',
      status: 'Active'
    },
    {
      name: 'Somnia Network',
      url: 'https://proxy.somnia.chain.love/subgraphs/name/somnia/network',
      description: 'Network statistics and block data',
      status: 'Active'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Somnia Subgraph
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Dashboard
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Real-time blockchain data visualization and analytics powered by Somnia's 
                high-performance subgraph infrastructure
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Play className="w-5 h-5 mr-2" />
                  View Live Data
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Code className="w-5 h-5 mr-2" />
                  View Queries
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Subgraph Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on Somnia's high-performance infrastructure for real-time blockchain data
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Subgraph Endpoints */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available Subgraph Endpoints
            </h2>
            <p className="text-xl text-gray-600">
              Connect to various Somnia subgraphs for different data types
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subgraphEndpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        {endpoint.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{endpoint.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Database className="w-4 h-4 text-gray-400" />
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                          {endpoint.url}
                        </code>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.open(endpoint.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Endpoint
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Dashboard */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Interactive Data Dashboard
            </h2>
            <p className="text-xl text-gray-600">
              Explore real-time blockchain data with our interactive components
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="overview">Game Data</TabsTrigger>
              <TabsTrigger value="rentals">Rental Data</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <SubgraphDashboardMock />
            </TabsContent>

            <TabsContent value="rentals">
              <RentalSubgraphMock />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Technical Details */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Technical Implementation
            </h2>
            <p className="text-xl text-blue-100">
              Built with modern web technologies for optimal performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Apollo Client', description: 'GraphQL client with caching' },
              { name: 'React Query', description: 'Server state management' },
              { name: 'TypeScript', description: 'Type-safe development' },
              { name: 'Tailwind CSS', description: 'Utility-first styling' }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-white mb-2">{tech.name}</div>
                <div className="text-blue-100">{tech.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Code Examples
            </h2>
            <p className="text-xl text-gray-600">
              Learn how to integrate Somnia subgraphs into your applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  GraphQL Query
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`query GetFlipResults($first: Int!, $skip: Int!) {
  flipResults(
    first: $first
    skip: $skip
    orderBy: blockTimestamp
    orderDirection: desc
  ) {
    id
    player
    betAmount
    choice
    result
    payout
    blockTimestamp
  }
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Apollo Client Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm">
{`import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://proxy.somnia.chain.love/subgraphs/name/somnia-testnet/SomFlip',
  cache: new InMemoryCache(),
});

export default client;`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Build with Somnia Subgraphs?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start building your next dApp with real-time blockchain data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Database className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5 mr-2" />
                Share Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubgraphShowcase;
