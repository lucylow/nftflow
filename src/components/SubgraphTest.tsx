import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DAO_STATS } from '../services/subgraphService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export default function SubgraphTest() {
  const { data, loading, error } = useQuery(GET_DAO_STATS);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading subgraph data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subgraph Connection Error</CardTitle>
          <CardDescription>Unable to connect to the subgraph</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Error:</strong> {error.message}</p>
                <p className="text-sm text-gray-600">
                  This is expected if the subgraph hasn't been deployed yet. 
                  The subgraph needs to be deployed to Somnia before this component can fetch real data.
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  <p>Common causes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Subgraph not deployed to Somnia network</li>
                    <li>Network connectivity issues</li>
                    <li>Subgraph URL configuration incorrect</li>
                    <li>Subgraph indexing in progress</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const stats = data?.daoStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subgraph Connection Test</CardTitle>
        <CardDescription>Testing connection to NFTFlow DAO subgraph</CardDescription>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                ✅ Successfully connected to subgraph!
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Total Proposals</p>
                <p className="text-2xl font-bold">{stats.totalProposals}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Active Proposals</p>
                <p className="text-2xl font-bold">{stats.activeProposals}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Votes</p>
                <p className="text-2xl font-bold">{stats.totalVotes}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Treasury Balance</p>
                <p className="text-2xl font-bold">{(parseFloat(stats.treasuryBalance) / 1e18).toFixed(4)} ETH</p>
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No data received from subgraph. This could mean:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The subgraph hasn't been deployed yet</li>
                <li>The subgraph URL is incorrect</li>
                <li>There's no data indexed yet</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
