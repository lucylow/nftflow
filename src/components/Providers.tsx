import React from 'react';
import { ThemeProvider } from '@/hooks/use-theme';
import { Web3Provider } from '@/contexts/Web3Context';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AIAgentProvider } from '@/contexts/AIAgentContext';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import WalletErrorBoundary from '@/components/WalletErrorBoundary';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nftflow-ui-theme">
      <WalletErrorBoundary>
        <Web3Provider>
          <AIAgentProvider>
            <NotificationProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </NotificationProvider>
          </AIAgentProvider>
        </Web3Provider>
      </WalletErrorBoundary>
    </ThemeProvider>
  );
};
