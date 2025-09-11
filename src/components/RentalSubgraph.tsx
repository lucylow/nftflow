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
import { useQuery } from '@apollo/client';
import { 
  GET_RENTALS,
  GET_RECENT_RENTALS,
  GET_RENTAL_STATISTICS
} from '@/lib/graphql-queries';

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

  const { loading, error, data, refetch } = useQuery(GET_RENTALS, {
    variables: {
      first: itemsPerPage,
      skip: page * itemsPerPage,
      orderBy: 'blockTimestamp',
      orderDirection: 'desc',
    },
    pollInterval: 15000,
  });

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

  if (!data?.rentals?.length) {
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
          onClick={() => refetch()}
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
            {data.rentals.map((rental: any, index: number) => (
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
                      {truncateHash(rental.nftContract)}
                    </code>
                    <span className="text-xs text-gray-500">#{rental.tokenId}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {truncateHash(rental.owner)}
                  </code>
                </td>
                <td className="py-3 px-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {truncateHash(rental.renter)}
                  </code>
                </td>
                <td className="py-3 px-2 font-medium">
                  {formatEther(rental.pricePerSecond)} STT
                </td>
                <td className="py-3 px-2">
                  {formatDuration(rental.startTime, rental.endTime)}
                </td>
                <td className="py-3 px-2 font-medium">
                  {formatEther(rental.totalCost)} STT
                </td>
                <td className="py-3 px-2">
                  <Badge 
                    variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={rental.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}
                  >
                    {rental.status}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-xs text-gray-500">
                  {formatTime(rental.blockTimestamp)}
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
          disabled={data.rentals.length < itemsPerPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Recent Rentals Component
const RecentRentals = () => {
  const { loading, error, data } = useQuery(GET_RECENT_RENTALS, {
    variables: { first: 10 },
    pollInterval: 10000,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading recent rentals...</span>
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

  if (!data?.rentals?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No recent rentals</p>
      </div>
    );
  }

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
        {data.rentals.map((rental: any, index: number) => (
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
                    {truncateHash(rental.nftContract)}#{rental.tokenId}
                  </code>
                  <span className="text-sm text-gray-500">
                    {formatEther(rental.pricePerSecond)} STT/sec
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    Owner: <code className="text-xs">{truncateHash(rental.owner)}</code>
                  </span>
                  <span>
                    Renter: <code className="text-xs">{truncateHash(rental.renter)}</code>
                  </span>
                  <span className="font-medium">
                    {formatEther(rental.totalCost)} STT
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className={rental.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {rental.status}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(rental.blockTimestamp)}
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
  const { loading, data } = useQuery(GET_RENTAL_STATISTICS);

  const calculateRentalStats = () => {
    if (!data?.rentals) return null;

    const rentals = data.rentals;
    const totalRentals = rentals.length;
    const totalVolume = rentals.reduce((sum: number, rental: any) => sum + parseFloat(rental.totalCost), 0);
    const activeRentals = rentals.filter((rental: any) => rental.status === 'ACTIVE').length;
    const averagePrice = rentals.reduce((sum: number, rental: any) => sum + parseFloat(rental.pricePerSecond), 0) / totalRentals;

    return {
      totalRentals,
      totalVolume: formatEther(totalVolume.toString()),
      activeRentals,
      averagePrice: formatEther(averagePrice.toString())
    };
  };

  const rentalStatsData = calculateRentalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Rental Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rentalStatsData && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-medium">Total Rentals</span>
                </div>
                <div className="text-2xl font-bold">{rentalStatsData.totalRentals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Total Volume</span>
                </div>
                <div className="text-2xl font-bold">{rentalStatsData.totalVolume} STT</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">Active Rentals</span>
                </div>
                <div className="text-2xl font-bold">{rentalStatsData.activeRentals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Avg Price/sec</span>
                </div>
                <div className="text-2xl font-bold">{rentalStatsData.averagePrice} STT</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function RentalSubgraph({ className }: RentalSubgraphProps) {
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Database className="w-6 h-6" />
          NFT Rental Subgraph
        </h2>
        <p className="text-gray-600">
          Real-time NFT rental data from Somnia subgraphs
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

