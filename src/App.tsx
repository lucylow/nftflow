import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Providers } from '@/components/Providers';
import { AppRoutes } from '@/components/AppRoutes';

const App: React.FC = () => {
  console.log('🚀 NFTFlow App starting...');
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Providers>
          <Suspense fallback={<LoadingSpinner />}>
            <AppRoutes />
          </Suspense>
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;