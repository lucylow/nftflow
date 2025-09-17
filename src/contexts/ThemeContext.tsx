import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';

interface ThemeContextType {
  theme: string;
  setPendingTxState: (isPending: boolean) => void;
  getThemeColors: () => {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState('default');
  const [isPendingTx, setIsPendingTx] = useState(false);
  const { chainId, isConnected } = useWeb3();

  // Dynamic theming based on network state
  useEffect(() => {
    if (isPendingTx) {
      setTheme('pending');
    } else if (isConnected && chainId === 50312) {
      setTheme('somnia');
    } else {
      setTheme('default');
    }
  }, [isPendingTx, chainId, isConnected]);

  const value: ThemeContextType = {
    theme,
    setPendingTxState: setIsPendingTx,
    getThemeColors: () => {
      const themes = {
        default: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: 'rgba(255, 255, 255, 0.8)',
        },
        pending: {
          primary: '#f59e0b',
          secondary: '#d97706',
          accent: '#b45309',
          background: 'rgba(254, 243, 199, 0.8)',
        },
        somnia: {
          primary: '#06b6d4',
          secondary: '#0ea5e9',
          accent: '#3b82f6',
          background: 'rgba(239, 246, 255, 0.8)',
        },
      };
      return themes[theme as keyof typeof themes] || themes.default;
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
