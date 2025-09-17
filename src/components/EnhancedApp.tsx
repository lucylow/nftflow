import React, { useState } from 'react';
import { Web3Provider } from '../contexts/Web3Context';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AchievementProvider } from '../contexts/AchievementContext';
import Marketplace from './Marketplace';
import UserProfile from './UserProfile';

const EnhancedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'marketplace' | 'profile'>('marketplace');

  return (
    <Web3Provider>
      <ThemeProvider>
        <AchievementProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    NFTFlow
                  </h1>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentView('marketplace')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentView === 'marketplace'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Marketplace
                    </button>
                    <button
                      onClick={() => setCurrentView('profile')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentView === 'profile'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
              {currentView === 'marketplace' ? <Marketplace /> : <UserProfile />}
            </main>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-md border-t border-white/20 mt-16">
              <div className="container mx-auto px-4 py-8">
                <div className="text-center text-gray-600">
                  <p>Enhanced NFTFlow Frontend - Built with React, TypeScript, and Web3</p>
                  <p className="text-sm mt-2">
                    Features: Dynamic Theming • 3D Animations • Gamification • Real Data Integration
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </AchievementProvider>
      </ThemeProvider>
    </Web3Provider>
  );
};

export default EnhancedApp;
