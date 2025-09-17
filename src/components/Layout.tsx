import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <Header />
      
      {/* Main Content - Full Width */}
      <div className="min-h-screen">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
