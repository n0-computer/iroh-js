import { RPC } from './rpc.ts';
import { BlobResponse } from './types.ts';

// The Blob section of the iroh API
// https://iroh.computer/docs/api/#blob-commands
export class BlobsApi {
  private rpc: RPC

  constructor(rpc: RPC) {
    this.rpc = rpc;
  }

  async add(key: string, value: string): Promise<BlobResponse> {
    return this.rpc.blobAdd(key, value);
  }

  async get(hash: string): Promise<string> {
    return this.rpc.blobGet(hash);
  }
}