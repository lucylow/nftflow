import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';

// Lazy load all page components to prevent circular dependencies
const Index = lazy(() => import('@/pages/Index'));
const Marketplace = lazy(() => import('@/pages/Marketplace-simple'));
const NetflixMarketplace = lazy(() => import('@/pages/NetflixMarketplace'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Create = lazy(() => import('@/pages/Create'));
const Wallet = lazy(() => import('@/components/SimpleWallet'));
const OnboardingFlow = lazy(() => import('@/components/Onboarding/OnboardingFlow'));
const WalletConnector = lazy(() => import('@/components/WalletConnection/WalletConnector'));

// Additional pages referenced in navigation
const Upload = lazy(() => import('@/pages/Upload'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const DAO = lazy(() => import('@/pages/DAO'));
const Governance = lazy(() => import('@/pages/Governance'));
const Creativity = lazy(() => import('@/pages/Creativity'));
const Somnia = lazy(() => import('@/pages/Somnia'));
const Subgraph = lazy(() => import('@/pages/Subgraph'));
const Social = lazy(() => import('@/pages/Social'));
const WalletTest = lazy(() => import('@/pages/WalletTest'));
const Rental = lazy(() => import('@/pages/Rental'));
const Mobile = lazy(() => import('@/pages/Mobile'));
const UserProfile = lazy(() => import('@/pages/UserProfile'));
const NFTDetail = lazy(() => import('@/pages/NFTDetail'));
const Discover = lazy(() => import('@/pages/Discover'));
const Community = lazy(() => import('@/pages/Community'));
const WalletAndTools = lazy(() => import('@/pages/WalletAndTools'));
const EnhancedMarketplace = lazy(() => import('@/pages/EnhancedMarketplace'));
const CreativityShowcase = lazy(() => import('@/pages/CreativityShowcase'));
const SubgraphDashboard = lazy(() => import('@/pages/SubgraphDashboard'));
const SubgraphShowcase = lazy(() => import('@/pages/SubgraphShowcase'));
const CreateAndUpload = lazy(() => import('@/pages/CreateAndUpload'));
const AIAgentsPage = lazy(() => import('@/pages/AIAgentsPage'));
const AIDashboard = lazy(() => import('@/pages/AIDashboard'));
const SomniaAI = lazy(() => import('@/components/ai/SomniaAIInsights').then(module => ({ default: module.default })));
const DemoPage = lazy(() => import('@/pages/DemoPage'));

export const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* Main Navigation Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/netflix-marketplace" element={<NetflixMarketplace />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/wallet-connect" element={<WalletConnector />} />
        <Route path="/create" element={<Create />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Feature Routes */}
        <Route path="/dao" element={<DAO />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/creativity" element={<Creativity />} />
        <Route path="/somnia" element={<Somnia />} />
        <Route path="/subgraph" element={<Subgraph />} />
        <Route path="/social" element={<Social />} />
        
        {/* Tool Routes */}
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wallet-test" element={<WalletTest />} />
        <Route path="/rental" element={<Rental />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mobile" element={<Mobile />} />
        
        {/* Additional Routes */}
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/nft/:id" element={<NFTDetail />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/community" element={<Community />} />
        <Route path="/wallet-and-tools" element={<WalletAndTools />} />
        <Route path="/enhanced-marketplace" element={<EnhancedMarketplace />} />
        <Route path="/creativity-showcase" element={<CreativityShowcase />} />
        <Route path="/subgraph-dashboard" element={<SubgraphDashboard />} />
        <Route path="/subgraph-showcase" element={<SubgraphShowcase />} />
        <Route path="/create-and-upload" element={<CreateAndUpload />} />
        <Route path="/ai-agents" element={<AIAgentsPage />} />
        <Route path="/ai-dashboard" element={<AIDashboard />} />
        <Route path="/somnia-ai" element={<SomniaAI />} />
        <Route path="/demo" element={<DemoPage />} />
        
        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-xl">The page you're looking for doesn't exist.</p>
              <div className="mt-8">
                <a 
                  href="/" 
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  );
};
