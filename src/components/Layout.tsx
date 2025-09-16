import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start collapsed on mobile

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <Header />
      
      <div className="flex relative">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <motion.div
              initial={false}
              animate={{ 
                x: sidebarOpen ? 0 : -280,
                width: sidebarOpen ? 280 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed lg:relative z-50 lg:z-30 h-screen"
            >
              <Sidebar />
            </motion.div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          <main className="min-h-screen">
            {children}
          </main>
        </div>

        {/* Sidebar Toggle Button */}
        {showSidebar && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-20 left-4 z-50 lg:hidden bg-background/95 backdrop-blur-sm"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Layout;
