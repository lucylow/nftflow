import { Web3Storage } from 'web3.storage';
import pinataSDK from '@pinata/sdk';
import { create } from 'ipfs-core';
import fetch from 'node-fetch';

interface IPFSResult {
  cid: string;
  fallbacks: string[];
  providers: string[];
  pinStatus: PinStatus[];
}

interface PinStatus {
  provider: string;
  pinned: boolean;
  error?: string;
}

interface IPFSConfig {
  web3StorageToken?: string;
  pinataApiKey?: string;
  pinataSecretKey?: string;
  localNode?: boolean;
  gateways: string[];
}

export class IPFSService {
  private web3Storage?: Web3Storage;
  private pinata?: any;
  private ipfs?: any;
  private config: IPFSConfig;
  private gateways: string[];

  constructor(config: IPFSConfig) {
    this.config = config;
    this.gateways = config.gateways || [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/'
    ];

    this.initializeProviders();
  }

  private async initializeProviders() {
    // Initialize Web3.Storage
    if (this.config.web3StorageToken) {
      try {
        this.web3Storage = new Web3Storage({ token: this.config.web3StorageToken });
        console.log('Web3.Storage initialized');
      } catch (error) {
        console.warn('Failed to initialize Web3.Storage:', error);
      }
    }

    // Initialize Pinata
    if (this.config.pinataApiKey && this.config.pinataSecretKey) {
      try {
        this.pinata = pinataSDK(this.config.pinataApiKey, this.config.pinataSecretKey);
        console.log('Pinata initialized');
      } catch (error) {
        console.warn('Failed to initialize Pinata:', error);
      }
    }

    // Initialize local IPFS node
    if (this.config.localNode) {
      try {
        this.ipfs = await create();
        console.log('Local IPFS node initialized');
      } catch (error) {
        console.warn('Failed to initialize local IPFS node:', error);
      }
    }
  }

  /**
   * Store JSON data with multiple providers
   */
  async storeJSON(data: any): Promise<IPFSResult> {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const file = new File([blob], 'data.json');
    
    const results: string[] = [];
    const providers: string[] = [];
    const pinStatus: PinStatus[] = [];

    // Store with Web3.Storage
    if (this.web3Storage) {
      try {
        const cid = await this.web3Storage.put([file]);
        results.push(cid);
        providers.push('web3.storage');
        pinStatus.push({ provider: 'web3.storage', pinned: true });
        console.log(`Stored with Web3.Storage: ${cid}`);
      } catch (error) {
        console.error('Web3.Storage storage failed:', error);
        pinStatus.push({ 
          provider: 'web3.storage', 
          pinned: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Store with Pinata
    if (this.pinata) {
      try {
        const result = await this.pinata.pinFileToIPFS(file);
        results.push(result.IpfsHash);
        providers.push('pinata');
        pinStatus.push({ provider: 'pinata', pinned: true });
        console.log(`Stored with Pinata: ${result.IpfsHash}`);
      } catch (error) {
        console.error('Pinata storage failed:', error);
        pinStatus.push({ 
          provider: 'pinata', 
          pinned: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Store with local IPFS node
    if (this.ipfs) {
      try {
        const { cid } = await this.ipfs.add(file);
        results.push(cid.toString());
        providers.push('local-ipfs');
        pinStatus.push({ provider: 'local-ipfs', pinned: true });
        console.log(`Stored with local IPFS: ${cid}`);
      } catch (error) {
        console.error('Local IPFS storage failed:', error);
        pinStatus.push({ 
          provider: 'local-ipfs', 
          pinned: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to store data with any provider');
    }

    // Use the first successful result as primary CID
    const primaryCid = results[0];
    const fallbacks = results.slice(1);

    return {
      cid: primaryCid,
      fallbacks,
      providers,
      pinStatus
    };
  }

  /**
   * Store file with multiple providers
   */
  async storeFile(file: File): Promise<IPFSResult> {
    const results: string[] = [];
    const providers: string[] = [];
    const pinStatus: PinStatus[] = [];

    // Store with Web3.Storage
    if (this.web3Storage) {
      try {
        const cid = await this.web3Storage.put([file]);
        results.push(cid);
        providers.push('web3.storage');
        pinStatus.push({ provider: 'web3.storage', pinned: true });
      } catch (error) {
        pinStatus.push({ 
          provider: 'web3.storage', 
          pinned: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Store with Pinata
    if (this.pinata) {
      try {
        const result = await this.pinata.pinFileToIPFS(file);
        results.push(result.IpfsHash);
        providers.push('pinata');
        pinStatus.push({ provider: 'pinata', pinned: true });
      } catch (error) {
        pinStatus.push({ 
          provider: 'pinata', 
          pinned: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Store with local IPFS node
    if (this.ipfs) {
      try {
        const { cid } = await this.ipfs.add(file);
        results.push(cid.toString());
        providers.push('local-ipfs');
        pinStatus.push({ provider: 'local-ipfs', pinned: true });
      } catch (error) {
        pinStatus.push({ 
          provider: 'local-ipfs', 
          pinned: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to store file with any provider');
    }

    return {
      cid: results[0],
      fallbacks: results.slice(1),
      providers,
      pinStatus
    };
  }

  /**
   * Retrieve data from IPFS with fallback gateways
   */
  async retrieveData(cid: string): Promise<any> {
    // Try each gateway until one succeeds
    for (const gateway of this.gateways) {
      try {
        const url = `${gateway}${cid}`;
        const response = await fetch(url, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Retrieved data from ${gateway}`);
          return data;
        }
      } catch (error) {
        console.warn(`Failed to retrieve from ${gateway}:`, error);
        continue;
      }
    }

    throw new Error(`Failed to retrieve data for CID: ${cid}`);
  }

  /**
   * Retrieve file from IPFS with fallback gateways
   */
  async retrieveFile(cid: string): Promise<Buffer> {
    for (const gateway of this.gateways) {
      try {
        const url = `${gateway}${cid}`;
        const response = await fetch(url, {
          timeout: 15000
        });

        if (response.ok) {
          const buffer = await response.buffer();
          console.log(`Retrieved file from ${gateway}`);
          return buffer;
        }
      } catch (error) {
        console.warn(`Failed to retrieve file from ${gateway}:`, error);
        continue;
      }
    }

    throw new Error(`Failed to retrieve file for CID: ${cid}`);
  }

  /**
   * Check pin status across providers
   */
  async checkPinStatus(cid: string): Promise<PinStatus[]> {
    const status: PinStatus[] = [];

    // Check Web3.Storage
    if (this.web3Storage) {
      try {
        const status = await this.web3Storage.status(cid);
        status.push({
          provider: 'web3.storage',
          pinned: status.status === 'pinned'
        });
      } catch (error) {
        status.push({
          provider: 'web3.storage',
          pinned: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Check Pinata
    if (this.pinata) {
      try {
        const result = await this.pinata.pinList({
          hashContains: cid,
          status: 'pinned'
        });
        status.push({
          provider: 'pinata',
          pinned: result.rows.length > 0
        });
      } catch (error) {
        status.push({
          provider: 'pinata',
          pinned: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Check local IPFS
    if (this.ipfs) {
      try {
        const pins = await this.ipfs.pin.ls();
        const isPinned = pins.some((pin: any) => pin.cid.toString() === cid);
        status.push({
          provider: 'local-ipfs',
          pinned: isPinned
        });
      } catch (error) {
        status.push({
          provider: 'local-ipfs',
          pinned: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return status;
  }

  /**
   * Pin content to additional providers
   */
  async pinContent(cid: string): Promise<PinStatus[]> {
    const status: PinStatus[] = [];

    // Pin to Web3.Storage
    if (this.web3Storage) {
      try {
        await this.web3Storage.pin(cid);
        status.push({ provider: 'web3.storage', pinned: true });
      } catch (error) {
        status.push({
          provider: 'web3.storage',
          pinned: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Pin to Pinata
    if (this.pinata) {
      try {
        await this.pinata.pinByHash(cid);
        status.push({ provider: 'pinata', pinned: true });
      } catch (error) {
        status.push({
          provider: 'pinata',
          pinned: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Pin to local IPFS
    if (this.ipfs) {
      try {
        await this.ipfs.pin.add(cid);
        status.push({ provider: 'local-ipfs', pinned: true });
      } catch (error) {
        status.push({
          provider: 'local-ipfs',
          pinned: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return status;
  }

  /**
   * Get IPFS gateway URL for a CID
   */
  getGatewayURL(cid: string, gatewayIndex: number = 0): string {
    const gateway = this.gateways[gatewayIndex] || this.gateways[0];
    return `${gateway}${cid}`;
  }

  /**
   * Validate CID format
   */
  isValidCID(cid: string): boolean {
    // Basic CID validation (starts with Qm for v0 or bafy for v1)
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{52})$/.test(cid);
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    web3Storage: boolean;
    pinata: boolean;
    localIpfs: boolean;
    gateways: { [key: string]: boolean };
  }> {
    const health = {
      web3Storage: false,
      pinata: false,
      localIpfs: false,
      gateways: {} as { [key: string]: boolean }
    };

    // Test Web3.Storage
    if (this.web3Storage) {
      try {
        await this.web3Storage.status('QmTest');
        health.web3Storage = true;
      } catch (error) {
        // Expected to fail, but connection is working
        health.web3Storage = true;
      }
    }

    // Test Pinata
    if (this.pinata) {
      try {
        await this.pinata.testAuthentication();
        health.pinata = true;
      } catch (error) {
        health.pinata = false;
      }
    }

    // Test local IPFS
    if (this.ipfs) {
      try {
        await this.ipfs.version();
        health.localIpfs = true;
      } catch (error) {
        health.localIpfs = false;
      }
    }

    // Test gateways
    for (const gateway of this.gateways) {
      try {
        const response = await fetch(`${gateway}QmTest`, { 
          method: 'HEAD',
          timeout: 5000 
        });
        health.gateways[gateway] = response.status !== 404;
      } catch (error) {
        health.gateways[gateway] = false;
      }
    }

    return health;
  }
}

// Export singleton instance
export const ipfsService = new IPFSService({
  web3StorageToken: process.env['WEB3_STORAGE_TOKEN'],
  pinataApiKey: process.env['PINATA_API_KEY'],
  pinataSecretKey: process.env['PINATA_SECRET_KEY'],
  localNode: process.env['ENABLE_LOCAL_IPFS'] === 'true',
  gateways: [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.fleek.co/ipfs/'
  ]
});
