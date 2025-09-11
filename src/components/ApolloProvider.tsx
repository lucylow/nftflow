'use client';

import React, { ReactNode } from 'react';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client';
import client from '../services/subgraphService';

interface ApolloProviderWrapperProps {
  children: ReactNode;
}

export default function ApolloProviderWrapper({ children }: ApolloProviderWrapperProps) {
  return (
    <ApolloClientProvider client={client}>
      {children}
    </ApolloClientProvider>
  );
}
