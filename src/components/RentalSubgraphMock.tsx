import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { MockDataService } from '@/mockData';

interface RentalSubgraphProps {
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

// Rental Activity Component
const RentalActivity = () => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  const rentals = MockDataService.getActiveRentals();
  const loading = false;
  const error = null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading rental activity...</span>
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

  if (!rentals?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No rental activity found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">NFT Rental Activity</h3>
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
              <th className="text-left py-3 px-2">NFT</th>
              <th className="text-left py-3 px-2">Owner</th>
              <th className="text-left py-3 px-2">Renter</th>
              <th className="text-left py-3 px-2">Price/sec</th>
              <th className="text-left py-3 px-2">Duration</th>
              <th className="text-left py-3 px-2">Total Cost</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-left py-3 px-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental: any, index: number) => (
              <motion.tr
                key={rental.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {truncateHash(rental.contractAddress)}
                    </code>
                    <span className="text-xs text-gray-500">#{rental.nftId}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {truncateHash(rental.lender)}
                  </code>
                </td>
                <td className="py-3 px-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {truncateHash(rental.tenant)}
                  </code>
                </td>
                <td className="py-3 px-2 font-medium">
                  {rental.pricePerSecond} STT
                </td>
                <td className="py-3 px-2">
                  {formatDuration(rental.startTime, rental.endTime)}
                </td>
                <td className="py-3 px-2 font-medium">
                  {rental.totalPrice} STT
                </td>
                <td className="py-3 px-2">
                  <Badge 
                    variant={rental.status === 'active' ? 'default' : 'secondary'}
                    className={rental.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                  >
                    {rental.status}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-xs text-gray-500">
                  {formatTime(rental.startTime)}
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
          disabled={rentals.length < itemsPerPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Recent Rentals Component
const RecentRentals = () => {
  const rentals = MockDataService.getActiveRentals().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Recent Rentals</h3>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse" />
          Live
        </Badge>
      </div>

      <div className="space-y-3">
        {rentals.map((rental: any, index: number) => (
          <motion.div
            key={rental.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {rental.nftName}
                  </code>
                  <span className="text-sm text-gray-500">
                    {rental.pricePerSecond} STT/sec
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    Owner: <code className="text-xs">{truncateHash(rental.lender)}</code>
                  </span>
                  <span>
                    Renter: <code className="text-xs">{truncateHash(rental.tenant)}</code>
                  </span>
                  <span className="font-medium">
                    {rental.totalPrice} STT
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={rental.status === 'active' ? 'default' : 'secondary'}
                  className={rental.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {rental.status}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(rental.startTime)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Rental Statistics Component
const RentalStatistics = () => {
  const rentalStats = MockDataService.getRentalActivity();
  const analytics = MockDataService.getAnalytics();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Rental Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium">Total Rentals</span>
            </div>
            <div className="text-2xl font-bold">{rentalStats.totalRentals.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Total Volume</span>
            </div>
            <div className="text-2xl font-bold">{rentalStats.totalVolume} STT</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Active Rentals</span>
            </div>
            <div className="text-2xl font-bold">{rentalStats.activeRentals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold">{rentalStats.successRate}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.popularCategories.map((category, index) => (
              <div key={category.name} className="flex justify-between items-center">
                <span className="text-sm font-medium">{category.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Component
export default function RentalSubgraphMock({ className }: RentalSubgraphProps) {
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Database className="w-6 h-6" />
          NFT Rental Subgraph
        </h2>
        <p className="text-gray-600">
          Real-time NFT rental data from Somnia subgraphs (Mock Data)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentRentals />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <RentalStatistics />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Rentals</CardTitle>
        </CardHeader>
        <CardContent>
          <RentalActivity />
        </CardContent>
      </Card>
    </div>
  );
}



