/**
 * Global type declarations for external packages
 */

declare module 'pg' {
  export class Client {
    constructor(config: { connectionString: string });
    connect(): Promise<void>;
    end(): Promise<void>;
    query(text: string, params?: any[]): Promise<any>;
    _connected: boolean;
  }
}

declare module 'ioredis' {
  export default class Redis {
    constructor(url: string, options?: any);
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    setex(key: string, ttl: number, value: string): Promise<void>;
    del(key: string): Promise<void>;
    del(...keys: string[]): Promise<void>;
    rpush(key: string, value: string): Promise<void>;
    lpop(key: string): Promise<string | null>;
    llen(key: string): Promise<number>;
    zadd(key: string, score: number, member: string): Promise<void>;
    zcard(key: string): Promise<number>;
    zremrangebyscore(key: string, min: number, max: number): Promise<void>;
    zrange(key: string, start: number, stop: number, options?: string): Promise<string[]>;
    expire(key: string, seconds: number): Promise<void>;
    ttl(key: string): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    smembers(key: string): Promise<string[]>;
    sadd(key: string, member: string): Promise<void>;
    incr(key: string): Promise<number>;
    ping(): Promise<string>;
    quit(): Promise<void>;
    on(event: string, callback: (data?: any) => void): void;
  }
}

declare module 'viem' {
  export function createPublicClient(config: any): any;
  export function webSocket(url: string): any;
  export function http(url: string): any;
  export function parseAbiItem(signature: string): any;
  export function formatUnits(value: bigint, decimals: number): string;
  export function recoverTypedDataAddress(config: any): Promise<string>;
}

declare module 'nft.storage' {
  export class NFTStorage {
    constructor(config: { token: string });
    storeBlob(blob: Blob): Promise<string>;
    status(cid: string): Promise<any>;
    pin(cid: string): Promise<void>;
  }
}

declare module 'web3.storage' {
  export class Web3Storage {
    constructor(config: { token: string });
    put(files: File[]): Promise<string>;
  }
}

declare module 'arweave' {
  export default class Arweave {
    static init(config: any): Arweave;
    createTransaction(data: any): Promise<any>;
    transactions: {
      sign(transaction: any): Promise<void>;
      post(transaction: any): Promise<any>;
    };
    network: {
      getInfo(): Promise<any>;
    };
  }
}

declare module 'ipfs-core' {
  export function create(): Promise<any>;
}

declare module 'node-fetch' {
  export default function fetch(url: string, options?: any): Promise<any>;
}

declare module 'express' {
  export default function express(): any;
}

declare module 'cors' {
  export default function cors(options?: any): any;
}

declare module 'helmet' {
  export default function helmet(): any;
}

declare module 'compression' {
  export default function compression(): any;
}

declare module 'express-rate-limit' {
  export default function rateLimit(options: any): any;
}

declare module 'rate-limit-redis' {
  export function createRedisStore(redis: any): any;
}
