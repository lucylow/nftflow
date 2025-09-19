import React from 'react';
import { ThemeProvider } from '@/hooks/use-theme';
import { Web3Provider } from '@/contexts/Web3Context-minimal';
import { NotificationProvider } from '@/contexts/NotificationContext';
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
          <NotificationProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </NotificationProvider>
        </Web3Provider>
      </WalletErrorBoundary>
    </ThemeProvider>
  );
};
