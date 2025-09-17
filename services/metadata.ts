import { NFTStorage, File } from 'nft.storage';
import { Web3Storage } from 'web3.storage';
import Arweave from 'arweave';
import { create } from 'ipfs-core';
import fetch from 'node-fetch';

export class MetadataService {
  private nftStorage: NFTStorage;
  private web3Storage: Web3Storage;
  private arweave: Arweave;
  private ipfs: any;
  private initialized = false;

  constructor() {
    // Initialize NFT.Storage
    if (process.env['NFT_STORAGE_TOKEN']) {
      try {
        this.nftStorage = new NFTStorage({ token: process.env['NFT_STORAGE_TOKEN'] });
      } catch (error) {
        console.warn('Failed to initialize NFT.Storage:', error);
      }
    }

    // Initialize Web3.Storage
    if (process.env['WEB3_STORAGE_TOKEN']) {
      try {
        this.web3Storage = new Web3Storage({ token: process.env['WEB3_STORAGE_TOKEN'] });
      } catch (error) {
        console.warn('Failed to initialize Web3.Storage:', error);
      }
    }
    
    // Initialize Arweave
    try {
      this.arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
      });
    } catch (error) {
      console.warn('Failed to initialize Arweave:', error);
    }
    
    this.initIPFS();
  }

  async initIPFS() {
    try {
      this.ipfs = await create();
      this.initialized = true;
      console.log('IPFS node initialized');
    } catch (error) {
      console.error('Failed to initialize IPFS:', error);
      this.initialized = false;
    }
  }

  async storeMetadata(
    metadata: any, 
    providers: string[] = ['nftstorage', 'web3storage', 'arweave']
  ): Promise<{ cid: string; arweaveId?: string; uris: string[] }> {
    const results: { [key: string]: string } = {};
    const uris: string[] = [];
    
    // Store on IPFS via multiple providers
    if (providers.includes('nftstorage') && this.nftStorage) {
      try {
        const blob = new Blob([JSON.stringify(metadata, null, 2)], { 
          type: 'application/json' 
        });
        const cid = await this.nftStorage.storeBlob(blob);
        results.nftstorage = cid;
        uris.push(`ipfs://${cid}`);
        console.log(`Stored on NFT.Storage: ${cid}`);
      } catch (error) {
        console.error('Failed to store on NFT.Storage:', error);
      }
    }
    
    if (providers.includes('web3storage') && this.web3Storage) {
      try {
        const file = new File([JSON.stringify(metadata, null, 2)], 'metadata.json', { 
          type: 'application/json' 
        });
        const cid = await this.web3Storage.put([file]);
        results.web3storage = cid;
        uris.push(`ipfs://${cid}`);
        console.log(`Stored on Web3.Storage: ${cid}`);
      } catch (error) {
        console.error('Failed to store on Web3.Storage:', error);
      }
    }
    
    // Store on Arweave for permanent storage
    if (providers.includes('arweave')) {
      try {
        const transaction = await this.arweave.createTransaction({
          data: JSON.stringify(metadata, null, 2)
        });
        
        transaction.addTag('Content-Type', 'application/json');
        transaction.addTag('App-Name', 'NFTFlow');
        transaction.addTag('App-Version', '1.0.0');
        transaction.addTag('Timestamp', Date.now().toString());
        
        // Sign transaction (in production, you'd use a proper wallet)
        await this.arweave.transactions.sign(transaction);
        const response = await this.arweave.transactions.post(transaction);
        
        if (response.status === 200) {
          results.arweave = transaction.id;
          uris.push(`ar://${transaction.id}`);
          console.log(`Stored on Arweave: ${transaction.id}`);
        }
      } catch (error) {
        console.error('Failed to store on Arweave:', error);
      }
    }
    
    // Also store locally on our IPFS node
    if (this.initialized) {
      try {
        const { cid } = await this.ipfs.add(JSON.stringify(metadata, null, 2));
        results.localIpfs = cid.toString();
        uris.push(`ipfs://${cid}`);
        console.log(`Stored on local IPFS: ${cid}`);
      } catch (error) {
        console.error('Failed to store on local IPFS:', error);
      }
    }
    
    const primaryCid = results.nftstorage || results.web3storage || results.localIpfs;
    
    return {
      cid: primaryCid || '',
      arweaveId: results.arweave || undefined,
      uris
    };
  }

  async retrieveMetadata(cid: string): Promise<any> {
    // Try multiple gateways for redundancy
    const gateways = [
      `https://${cid}.ipfs.dweb.link`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://${cid}.ipfs.nftstorage.link`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.fleek.co/ipfs/${cid}`
    ];
    
    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway, { 
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NFTFlow-MetadataService/1.0.0'
          }
        });
        
        if (response.ok) {
          const metadata = await response.json();
          console.log(`Retrieved metadata from ${gateway}`);
          return metadata;
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${gateway}:`, error.message);
      }
    }
    
    // Fallback to our own IPFS node
    if (this.initialized) {
      try {
        const chunks = [];
        for await (const chunk of this.ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        const metadata = JSON.parse(Buffer.concat(chunks).toString());
        console.log(`Retrieved metadata from local IPFS: ${cid}`);
        return metadata;
      } catch (error) {
        console.error(`Failed to retrieve from local IPFS: ${cid}`, error);
      }
    }
    
    throw new Error(`Failed to retrieve metadata for CID ${cid}`);
  }

  async retrieveFromArweave(arweaveId: string): Promise<any> {
    try {
      const gateway = `https://arweave.net/${arweaveId}`;
      const response = await fetch(gateway, { 
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NFTFlow-MetadataService/1.0.0'
        }
      });
      
      if (response.ok) {
        const metadata = await response.json();
        console.log(`Retrieved metadata from Arweave: ${arweaveId}`);
        return metadata;
      }
      } catch (error) {
        console.error(`Failed to retrieve from Arweave: ${arweaveId}`, error instanceof Error ? error : new Error(String(error)));
      }
    
    throw new Error(`Failed to retrieve metadata from Arweave ${arweaveId}`);
  }

  async checkPinningStatus(cid: string): Promise<{ [provider: string]: boolean }> {
    const status: { [provider: string]: boolean } = {};
    
    // Check NFT.Storage status
    if (this.nftStorage) {
      try {
        const nftStatus = await this.nftStorage.status(cid);
        status.nftstorage = nftStatus.pin.status === 'pinned';
      } catch (error) {
        status.nftstorage = false;
      }
    }
    
    // Check Web3.Storage status
    if (this.web3Storage) {
      try {
        // Web3.Storage doesn't have a direct status check API
        // We can try to retrieve the data to check if it's available
        const testResponse = await fetch(`https://${cid}.ipfs.w3s.link`, { 
          method: 'HEAD',
          timeout: 5000 
        });
        status.web3storage = testResponse.ok;
      } catch (error) {
        status.web3storage = false;
      }
    }
    
    // Check local IPFS
    if (this.initialized) {
      try {
        await this.ipfs.cat(cid, { length: 1 });
        status.localIpfs = true;
      } catch (error) {
        status.localIpfs = false;
      }
    }
    
    return status;
  }

  async pinToIPFS(cid: string, providers: string[] = ['nftstorage', 'web3storage']): Promise<void> {
    for (const provider of providers) {
      try {
        if (provider === 'nftstorage' && this.nftStorage) {
          await this.nftStorage.pin(cid);
          console.log(`Pinned ${cid} to NFT.Storage`);
        } else if (provider === 'web3storage' && this.web3Storage) {
          // Web3.Storage automatically pins when you upload
          console.log(`Already pinned ${cid} to Web3.Storage`);
        }
      } catch (error) {
        console.error(`Failed to pin ${cid} to ${provider}:`, error);
      }
    }
  }

  async storeImage(imageBuffer: Buffer, filename: string): Promise<{ cid: string; uris: string[] }> {
    const uris: string[] = [];
    let primaryCid = '';
    
    // Store on NFT.Storage
    if (this.nftStorage) {
      try {
        const file = new File([imageBuffer], filename, { 
          type: this.getMimeType(filename) 
        });
        const cid = await this.nftStorage.storeBlob(file);
        uris.push(`ipfs://${cid}`);
        primaryCid = cid;
        console.log(`Stored image on NFT.Storage: ${cid}`);
      } catch (error) {
        console.error('Failed to store image on NFT.Storage:', error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    // Store on Web3.Storage
    if (this.web3Storage) {
      try {
        const file = new File([imageBuffer], filename, { 
          type: this.getMimeType(filename) 
        });
        const cid = await this.web3Storage.put([file]);
        uris.push(`ipfs://${cid}`);
        if (!primaryCid) primaryCid = cid;
        console.log(`Stored image on Web3.Storage: ${cid}`);
      } catch (error) {
        console.error('Failed to store image on Web3.Storage:', error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    // Store on local IPFS
    if (this.initialized) {
      try {
        const { cid } = await this.ipfs.add(imageBuffer);
        uris.push(`ipfs://${cid}`);
        if (!primaryCid) primaryCid = cid.toString();
        console.log(`Stored image on local IPFS: ${cid}`);
      } catch (error) {
        console.error('Failed to store image on local IPFS:', error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    return { cid: primaryCid, uris };
  }

  async retrieveImage(cid: string): Promise<Buffer> {
    // Try multiple gateways
    const gateways = [
      `https://${cid}.ipfs.dweb.link`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://${cid}.ipfs.nftstorage.link`,
      `https://gateway.pinata.cloud/ipfs/${cid}`
    ];
    
    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway, { timeout: 10000 });
        if (response.ok) {
          const buffer = await response.buffer();
          console.log(`Retrieved image from ${gateway}`);
          return buffer;
        }
      } catch (error) {
        console.warn(`Failed to fetch image from ${gateway}:`, error.message);
      }
    }
    
    // Fallback to local IPFS
    if (this.initialized) {
      try {
        const chunks = [];
        for await (const chunk of this.ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        console.log(`Retrieved image from local IPFS: ${cid}`);
        return buffer;
      } catch (error) {
        console.error(`Failed to retrieve image from local IPFS: ${cid}`, error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    throw new Error(`Failed to retrieve image for CID ${cid}`);
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'json': 'application/json'
    };
    
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  async validateMetadata(metadata: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Check required fields
    if (!metadata.name) {
      errors.push('Missing required field: name');
    }
    
    if (!metadata.description) {
      errors.push('Missing required field: description');
    }
    
    if (!metadata.image) {
      errors.push('Missing required field: image');
    }
    
    // Validate image URL
    if (metadata.image) {
      try {
        new URL(metadata.image);
      } catch {
        errors.push('Invalid image URL format');
      }
    }
    
    // Validate animation URL if present
    if (metadata.animation_url) {
      try {
        new URL(metadata.animation_url);
      } catch {
        errors.push('Invalid animation_url format');
      }
    }
    
    // Validate attributes if present
    if (metadata.attributes && Array.isArray(metadata.attributes)) {
      for (const attr of metadata.attributes) {
        if (!attr.trait_type || attr.value === undefined) {
          errors.push('Invalid attribute: missing trait_type or value');
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  async getStorageStats(): Promise<{
    nftStorage: any;
    web3Storage: any;
    arweave: any;
    localIpfs: any;
  }> {
    const stats: any = {};
    
    // Get NFT.Storage stats
    if (this.nftStorage) {
      try {
        // NFT.Storage doesn't have a direct stats API
        stats.nftStorage = { available: true };
      } catch (error) {
        stats.nftStorage = { available: false, error: error.message };
      }
    }
    
    // Get Web3.Storage stats
    if (this.web3Storage) {
      try {
        // Web3.Storage doesn't have a direct stats API
        stats.web3Storage = { available: true };
      } catch (error) {
        stats.web3Storage = { available: false, error: error.message };
      }
    }
    
    // Get Arweave stats
    try {
      const info = await this.arweave.network.getInfo();
      stats.arweave = { available: true, height: info.height };
    } catch (error) {
      stats.arweave = { available: false, error: error.message };
    }
    
    // Get local IPFS stats
    if (this.initialized) {
      try {
        const id = await this.ipfs.id();
        stats.localIpfs = { available: true, peerId: id.id };
      } catch (error) {
        stats.localIpfs = { available: false, error: error.message };
      }
    }
    
    return stats;
  }

  async close(): Promise<void> {
    if (this.ipfs) {
      await this.ipfs.stop();
    }
  }
}

// Export singleton instance
export const metadataService = new MetadataService();
