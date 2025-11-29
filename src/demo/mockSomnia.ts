/**
 * Lightweight mock of Somnia Data Streams SDK.
 * EventEmitter-based for realistic streaming behavior.
 */

type Subscriber = {
  id: string;
  schemaId: string;
  onData: (payload: StreamEvent) => void;
};

export interface StreamEvent {
  schemaId: string;
  dataId: string;
  raw: any;
  txHash: string;
  publishedAt: number;
}

class MockSomnia {
  private subs = new Map<string, Subscriber[]>();
  private store = new Map<string, any>();
  private idCounter = 0;

  computeSchemaId(schema: string): string {
    // Deterministic hash for demo purposes
    let hash = 0;
    for (let i = 0; i < schema.length; i++) {
      hash = ((hash << 5) - hash) + schema.charCodeAt(i);
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  subscribe(opts: { schemaId: string; onData: (d: StreamEvent) => void }) {
    const sub: Subscriber = { 
      id: `sub-${++this.idCounter}`, 
      schemaId: opts.schemaId, 
      onData: opts.onData 
    };
    const arr = this.subs.get(opts.schemaId) ?? [];
    arr.push(sub);
    this.subs.set(opts.schemaId, arr);

    return {
      unsubscribe: () => {
        const list = this.subs.get(opts.schemaId) ?? [];
        this.subs.set(opts.schemaId, list.filter((s) => s.id !== sub.id));
      },
    };
  }

  async set(items: { id: string; schemaId: string; data: any }[]) {
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`.padEnd(66, '0');
    const publishedAt = Date.now();
    
    for (const it of items) {
      this.store.set(it.id, { ...it.data, publishedAt, txHash, dataId: it.id });
      const subs = this.subs.get(it.schemaId) || [];
      for (const s of subs) {
        s.onData({
          schemaId: it.schemaId,
          dataId: it.id,
          raw: it.data,
          txHash,
          publishedAt,
        });
      }
    }
    return txHash;
  }

  async getByKey(schemaId: string, dataKey: string) {
    return this.store.get(dataKey) ?? null;
  }

  emitEvent(schemaId: string, payload: any) {
    const subs = this.subs.get(schemaId) || [];
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`.padEnd(66, '0');
    const publishedAt = Date.now();
    
    for (const s of subs) {
      s.onData({ 
        schemaId, 
        dataId: `data-${++this.idCounter}`, 
        raw: payload, 
        txHash, 
        publishedAt 
      });
    }
  }

  clearStore() {
    this.store.clear();
  }
}

export const mockSomnia = new MockSomnia();
