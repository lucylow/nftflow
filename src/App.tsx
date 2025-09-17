import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import { ThemeProvider } from "./hooks/use-theme";
import Layout from "@/components/Layout";
import Index from "@/pages/SimpleIndex";
import Analytics from "@/pages/Analytics";
import EnhancedMarketplace from "@/pages/EnhancedMarketplace";
import Marketplace from "@/pages/Marketplace";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import NFTDetail from "@/pages/NFTDetail";
import Create from "@/pages/Create";
import DAO from "@/pages/DAO";
import Governance from "@/pages/Governance";
import CreativityShowcase from "@/pages/CreativityShowcase";
import Upload from "@/pages/Upload";
import SubgraphDashboard from "@/pages/SubgraphDashboard";
import Social from "@/pages/Social";
import Mobile from "@/pages/Mobile";
import SimpleWallet from "@/components/SimpleWallet";
import SimpleRentalFlow from "@/components/SimpleRentalFlow";
import WalletTest from "@/pages/WalletTest";
import Somnia from "@/pages/Somnia";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering with full configuration');
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="nftflow-ui-theme">
        <QueryClientProvider client={queryClient}>
          <WalletErrorBoundary>
            <Web3Provider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Layout>
                      <Routes>
                        {console.log('Routing: rendering Index route')}
                        <Route path="/" element={<Index />} />
                        {console.log('Routing: rendering Marketplace route')}
                        <Route path="/marketplace" element={<Marketplace />} />
                        {console.log('Routing: rendering Dashboard route')}
                        <Route path="/dashboard" element={<Dashboard />} />
                        {console.log('Routing: rendering Analytics route')}
                        <Route path="/analytics" element={<Analytics />} />
                        {console.log('Routing: rendering EnhancedMarketplace route')}
                        <Route path="/enhanced-marketplace" element={<EnhancedMarketplace />} />
                        {console.log('Routing: rendering Profile route')}
                        <Route path="/profile" element={<Profile />} />
                        {console.log('Routing: rendering NFTDetail route')}
                        <Route path="/nft/:id" element={<NFTDetail />} />
                        {console.log('Routing: rendering Create route')}
                        <Route path="/create" element={<Create />} />
                        {console.log('Routing: rendering Upload route')}
                        <Route path="/upload" element={<Upload />} />
                        {console.log('Routing: rendering DAO route')}
                        <Route path="/dao" element={<DAO />} />
                        {console.log('Routing: rendering Governance route')}
                        <Route path="/governance" element={<Governance />} />
                        {console.log('Routing: rendering CreativityShowcase route')}
                        <Route path="/creativity" element={<CreativityShowcase />} />
                        {console.log('Routing: rendering SubgraphDashboard route')}
                        <Route path="/subgraph" element={<SubgraphDashboard />} />
                        {console.log('Routing: rendering Social route')}
                        <Route path="/social" element={<Social />} />
                        {console.log('Routing: rendering Mobile route')}
                        <Route path="/mobile" element={<Mobile />} />
                        {console.log('Routing: rendering SimpleWallet route')}
                        <Route path="/wallet" element={<SimpleWallet />} />
                        {console.log('Routing: rendering WalletTest route')}
                        <Route path="/wallet-test" element={<WalletTest />} />
                        {console.log('Routing: rendering Somnia route')}
                        <Route path="/somnia" element={<Somnia />} />
                        {console.log('Routing: rendering SimpleRentalFlow route')}
                        <Route path="/rental" element={<SimpleRentalFlow />} />
                        <Route path="/test" element={<div className="text-black">Test Route Works</div>} />
                        <Route
                          path="*"
                          element={
                            <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                              <div className="text-center">
                                <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                                <p className="text-gray-300 mb-8">The page you're looking for doesn't exist.</p>
                                <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">Go Home</Link>
                              </div>
                            </div>
                          }
                        />
                      </Routes>
                    </Layout>
                  </BrowserRouter>
                </TooltipProvider>
              </NotificationProvider>
            </Web3Provider>
          </WalletErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;