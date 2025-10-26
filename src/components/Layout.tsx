import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Don't show sidebar on certain pages
  const hideSidebarOn = ['/', '/onboarding'];
  const shouldHideSidebar = hideSidebarOn.includes(location.pathname);
  const showSidebarInternal = showSidebar && !shouldHideSidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative">
      <Header />
      
      <div className="flex relative">
        {/* Sidebar */}
        {showSidebarInternal && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block"
          >
            <Sidebar />
          </motion.div>
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 min-h-screen transition-all duration-300 ${
            showSidebarInternal ? 'lg:ml-0' : ''
          }`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            key={location.pathname}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
