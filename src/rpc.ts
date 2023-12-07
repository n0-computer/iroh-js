import { Url } from "node:url";
import {
  Author,
  NodeStatus,
  DocInfo,
  DocShareMode,
  BlobResponse,
  TicketResponse,
  BlobInfo,
} from './types.ts';

export interface RPC {
  nodeStatus: () => Promise<NodeStatus>
  authorList: (offset: number, limit: number) => Promise<Author[]>
  authorNew: (name: string) => Promise<Author>
  docList: (offset: number, limit: number) => Promise<DocInfo[]>
  docNew: (name: string) => Promise<DocInfo>
  docSet: (docId: string, key: string, value: string) => Promise<DocInfo>
  docDel: (docId: string, key: string) => Promise<DocInfo>
  docDrop: (docId: string) => Promise<DocInfo>
  docShare: (docId: string, shareMode: DocShareMode) => Promise<TicketResponse>
  docJoin: (ticket: string) => Promise<DocInfo>
  blobList: (offset: number, limit: number) => Promise<BlobInfo[]>
  blobAdd: (key: string, value: string) => Promise<BlobResponse>
  blobGet: (hash: string) => Promise<string>
}

export interface RpcOptions {
  type: 'http' | 'websocket',
  baseUrl: string,
  username?: string,
  auth?: string
}

export function defaultRpcOptions(): RpcOptions {
  return {
    type: 'http',
    baseUrl: 'http://localhost:8000',
    auth: undefined
  }
}

export function Rpc(opts?: RpcOptions): RPC {
  opts = opts || defaultRpcOptions();
  switch (opts.type) {
    case 'http':
      return new RpcHttp(opts);
    case 'websocket':
      throw new Error('Websocket not implemented');
  }
}

class RpcHttp implements RPC {
  private opts: RpcOptions
  private irohDotNetworkApi: boolean

  constructor(opts: RpcOptions) {
    this.opts = opts;
    this.irohDotNetworkApi = opts.baseUrl.includes('iroh.network') || opts.username !== undefined;
  }

  nodeStatus(): Promise<NodeStatus> {
    return this.call<NodeStatus>(RPCMethod.NODE_STATUS);
  }
  authorList(offset: number, limit: number): Promise<Author[]> {
    return this.call<Author[]>(RPCMethod.AUTHOR_LIST, { offset, limit });
  }
  authorNew(name: string): Promise<Author> {
    return this.call<Author>(RPCMethod.AUTHOR_NEW);
  }
  docList(offset: number, limit: number): Promise<DocInfo[]> {
    return this.call<DocInfo[]>(RPCMethod.DOC_LIST, { offset, limit });
  }
  docNew(name: string): Promise<DocInfo> {
    return this.call<DocInfo>(RPCMethod.DOC_NEW, { name });
  }
  docSet(docId: string, key: string, value: string): Promise<DocInfo> {
    return this.call<DocInfo>(RPCMethod.DOC_SET, { docId, key, value });
  }
  docDel(docId: string, key: string): Promise<DocInfo> {
    return this.call<DocInfo>(RPCMethod.DOC_DEL, { docId, key });
  }
  docDrop(docId: string): Promise<DocInfo> {
    return this.call<DocInfo>(RPCMethod.DOC_DROP, { docId });
  }
  docShare(docId: string, shareMode: DocShareMode): Promise<TicketResponse> {
    return this.call<TicketResponse>(RPCMethod.DOC_SHARE, { docId, shareMode });
  }
  docJoin(ticket: string): Promise<DocInfo> {
    return this.call<DocInfo>(RPCMethod.DOC_JOIN, { ticket });
  }
  blobList(offset: number, limit: number): Promise<BlobInfo[]> {
    return this.call<BlobInfo[]>(RPCMethod.BLOB_LIST, { offset, limit });
  }
  blobAdd(key: string, value: string): Promise<BlobResponse> {
    return this.call<BlobResponse>(RPCMethod.BLOB_ADD, { key, value });
  }
  blobGet(hash: string): Promise<string> {
    return this.call<string>(RPCMethod.BLOB_GET, { hash });
  }

  private async call<R>(method: RPCMethod, params?: any): Promise<R> {
    const url = this.url(method, params);
    const httpMethod = this.method[method];
    let body;

    if (httpMethod === HTTPMethods.POST || httpMethod === HTTPMethods.PUT) {
      body = JSON.stringify(params);
    }

    let headers: Record<string,string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    if (this.opts.auth) {
      headers['Authorization'] = `Bearer ${this.opts.auth}`;
    }
    
    console.debug(`[RPC] ${httpMethod} ${url}`);
    return await fetch(url, {
      method: httpMethod,
      body,
      headers
    }).then((response) => response.json())
  }

  private method = {
    [RPCMethod.ME]: HTTPMethods.GET,
    [RPCMethod.NODE_STATUS]: HTTPMethods.GET,
    [RPCMethod.AUTHOR_LIST]: HTTPMethods.GET,
    [RPCMethod.AUTHOR_NEW]: HTTPMethods.POST,
    [RPCMethod.DOC_LIST]: HTTPMethods.GET,
    [RPCMethod.DOC_NEW]: HTTPMethods.POST,
    [RPCMethod.DOC_GET]: HTTPMethods.GET,
    [RPCMethod.DOC_SET]: HTTPMethods.POST,
    [RPCMethod.DOC_DEL]: HTTPMethods.DELETE,
    [RPCMethod.DOC_DROP]: HTTPMethods.DELETE,
    [RPCMethod.DOC_SHARE]: HTTPMethods.GET,
    [RPCMethod.DOC_JOIN]: HTTPMethods.POST,
    [RPCMethod.DOC_WATCH]: HTTPMethods.GET,
    [RPCMethod.BLOB_LIST]: HTTPMethods.GET,
    [RPCMethod.BLOB_ADD]: HTTPMethods.POST,
    [RPCMethod.BLOB_GET]: HTTPMethods.GET,
  }
  
  private url(method: RPCMethod, params?: any): URL {
    const url = new URL(this.opts.baseUrl);
    if (this.irohDotNetworkApi) {
      switch (method) {
        case RPCMethod.ME:
          url.pathname = '/user/me';
          break;
        case RPCMethod.NODE_STATUS:
          url.pathname = '/node/status';
          break;
        case RPCMethod.AUTHOR_LIST:
          url.pathname = `/authors/${this.opts.username}/list`;
          url.searchParams.append('offset', params.offset);
          url.searchParams.append('limit', params.limit);
          break;
        case RPCMethod.AUTHOR_NEW:
          url.pathname = `/authors/${this.opts.username}/new`;
          break;
        case RPCMethod.DOC_LIST:
          url.pathname = `/docs/${this.opts.username}`;
          url.searchParams.append('offset', params.offset);
          url.searchParams.append('limit', params.limit);
          break;
        case RPCMethod.DOC_NEW:
          url.pathname = `/docs/${this.opts.username}`;
        case RPCMethod.DOC_GET:
          url.pathname = `/docs/${this.opts.username}/${params.docId}`;
          break;
        case RPCMethod.DOC_SET:
          url.pathname = `/docs/${this.opts.username}/${params.docId}/set`;
          break;
        case RPCMethod.DOC_DEL:
          url.pathname = `/docs/${this.opts.username}/${params.docId}/del`;
          break;
        case RPCMethod.DOC_SHARE:
          url.pathname = `/docs/${this.opts.username}/${params.docId}/share`;
          break;
        case RPCMethod.DOC_WATCH:
          url.pathname = `/docs/${this.opts.username}/${params.docId}/watch`;
          break;
        case RPCMethod.BLOB_LIST:
          url.pathname = `/blobs/${this.opts.username}`;
          url.searchParams.append('offset', params.offset);
          url.searchParams.append('limit', params.limit);
          break;
        case RPCMethod.BLOB_ADD:
          url.pathname = `/blobs/${this.opts.username}/${params.docId}/add`;
          break;
        case RPCMethod.BLOB_GET:
          url.pathname = `/blobs/${this.opts.username}/${params.hash}`;
          break;
      }
    } else {
      url.pathname = method;
    }

    return url;
  }
}

enum RPCMethod {
  ME = '/me',
  NODE_STATUS = '/node/status',
  AUTHOR_LIST = '/author/list',
  AUTHOR_NEW = '/author/new',
  DOC_LIST = '/doc/list',
  DOC_NEW = '/doc/new',
  DOC_GET = '/doc/get',
  DOC_SET = '/doc/set',
  DOC_DEL = '/doc/del',
  DOC_DROP = '/doc/drop',
  DOC_SHARE = '/doc/share',
  DOC_JOIN = '/doc/join',
  DOC_WATCH = '/doc/watch',
  BLOB_LIST = '/blob/list',
  BLOB_ADD = '/blob/add',
  BLOB_GET = '/blob/get',
}

enum HTTPMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}