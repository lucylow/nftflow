/**
 * Somnia Data Streams Adapter
 * 
 * This adapter provides a unified interface for both mock and real Somnia SDK.
 * Toggle between implementations via environment variable.
 * 
 * Usage:
 * - Mock mode (default): Uses local EventEmitter-based simulation
 * - Real mode: Connects to actual Somnia Data Streams SDK
 * 
 * To switch to real Somnia SDK:
 * 1. Set VITE_USE_MOCK_SOMNIA=0 in your .env
 * 2. Install @somnia/sdk (when available)
 * 3. Configure VITE_SOMNIA_RPC_URL and server private key
 */

import { mockSomnia, StreamEvent } from './mockSomnia';

export interface SomniaAdapter {
  computeSchemaId(schema: string): string;
  subscribe(opts: { schemaId: string; onData: (d: StreamEvent) => void }): { unsubscribe(): void };
  set(items: { id: string; schemaId: string; data: any }[]): Promise<string>;
  getByKey(schemaId: string, dataKey: string): Promise<any>;
  emitEvent(schemaId: string, payload: any): void;
  clearStore(): void;
}

/**
 * Mock Somnia Adapter
 * Uses local EventEmitter for demo/development
 */
export const mockSomniaAdapter: SomniaAdapter = {
  computeSchemaId: (schema: string) => mockSomnia.computeSchemaId(schema),
  subscribe: (opts) => mockSomnia.subscribe(opts),
  set: (items) => mockSomnia.set(items),
  getByKey: (schemaId, dataKey) => mockSomnia.getByKey(schemaId, dataKey),
  emitEvent: (schemaId, payload) => mockSomnia.emitEvent(schemaId, payload),
  clearStore: () => mockSomnia.clearStore(),
};

/**
 * Real Somnia Adapter (placeholder)
 * Replace with actual SDK calls when connecting to Somnia testnet/mainnet
 * 
 * Example implementation:
 * ```ts
 * import { SomniaSDK } from '@somnia/sdk';
 * 
 * const sdk = new SomniaSDK({ rpcUrl: process.env.VITE_SOMNIA_RPC_URL });
 * 
 * export const realSomniaAdapter: SomniaAdapter = {
 *   computeSchemaId: (schema) => sdk.streams.computeSchemaId(schema),
 *   subscribe: (opts) => sdk.streams.subscribe(opts),
 *   set: (items) => sdk.streams.set(items),
 *   getByKey: (schemaId, dataKey) => sdk.streams.getByKey(schemaId, dataKey),
 *   emitEvent: () => { throw new Error('Direct emit not supported in real mode'); },
 *   clearStore: () => { throw new Error('Clear not supported in real mode'); },
 * };
 * ```
 */
export const realSomniaAdapter: SomniaAdapter = {
  computeSchemaId: () => { throw new Error('Real Somnia SDK not configured'); },
  subscribe: () => { throw new Error('Real Somnia SDK not configured'); },
  set: () => { throw new Error('Real Somnia SDK not configured'); },
  getByKey: () => { throw new Error('Real Somnia SDK not configured'); },
  emitEvent: () => { throw new Error('Real Somnia SDK not configured'); },
  clearStore: () => { throw new Error('Real Somnia SDK not configured'); },
};

/**
 * Get the active adapter based on environment configuration
 */
export function getSomniaAdapter(): SomniaAdapter {
  const useMock = import.meta.env.VITE_USE_MOCK_SOMNIA !== '0';
  return useMock ? mockSomniaAdapter : realSomniaAdapter;
}

// Export default adapter
export const somniaAdapter = getSomniaAdapter();
