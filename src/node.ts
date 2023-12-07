import { Rpc, RPC, RpcOptions, defaultRpcOptions } from "./rpc.ts";
import { BlobsApi } from "./blobs.ts";
import { DocsApi } from "./docs.ts";
import { AuthorsApi } from "./authors.ts";
import { NodeStatus } from "./types.ts";

export interface NodeOptions extends RpcOptions {
  newAuthor?: boolean
}

function defaultNodeOptions(): NodeOptions {
  return {
    ...defaultRpcOptions(),
    newAuthor: false
  }
}

export class Node {
  private rpc: RPC
  docs: DocsApi
  blobs: BlobsApi
  authors: AuthorsApi

  constructor(opts?: NodeOptions) {
    opts = opts || defaultNodeOptions()
    this.rpc = Rpc(opts)

    this.docs = new DocsApi(this.rpc);
    this.blobs = new BlobsApi(this.rpc);
    this.authors = new AuthorsApi(this.rpc);
  }

  status(): Promise<NodeStatus> {
    return this.rpc.nodeStatus();
  }
}