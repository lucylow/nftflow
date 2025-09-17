import React from 'react';
import UserDashboard from '@/components/UserDashboard';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">User Dashboard</h1>
          <p className="text-gray-300 text-lg">
            Manage your NFTs, track rentals, and view analytics
          </p>
        </div>
        
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">My Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="user" className="mt-6">
            <UserDashboard />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
