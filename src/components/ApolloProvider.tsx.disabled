'use client';

import React, { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import client from '../services/subgraphService';

interface ApolloProviderWrapperProps {
  children: ReactNode;
}

export default function ApolloProviderWrapper({ children }: ApolloProviderWrapperProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
