import { RPC } from './rpc.ts';
import { Author } from './types.ts';

// The Authors section of the iroh API
// https://iroh.computer/docs/api/#author-commands
export class AuthorsApi {
  private rpc: RPC

  constructor(rpc: RPC) {
    this.rpc = rpc;
  }

  async default(): Promise<Author> {
    return this.rpc.authorList(0, 1).then((authors) => authors[0]);
  }

  async list(offset: number, limit: number): Promise<Author[]> {
    return this.rpc.authorList(offset, limit);
  }

  async new(name: string): Promise<Author> {
    return this.rpc.authorNew(name);
  }
}