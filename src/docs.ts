import { RPC } from "./rpc.ts";
import { DocInfo, DocShareMode, TicketResponse } from "./types.ts";

export class DocsApi {
  private rpc: RPC

  constructor(rpc: RPC) {
    this.rpc = rpc;
  }

  async new(name: string): Promise<DocInfo> {
    return this.rpc.docNew(name);
  }

  open(docId: string): Document {
    return new Document(this.rpc, docId);
  }

  list(offset: number, limit: number): Promise<DocInfo[]> {
    return this.rpc.docList(offset, limit);
  }

  async join(ticket: string): Promise<Document> {
    const docInfo = await this.rpc.docJoin(ticket);
    return new Document(this.rpc, docInfo.doc_id);
  }
}

export class Document {
  id: string
  rpc: RPC

  constructor(rpc: RPC, docId: string) {
    this.rpc = rpc;
    this.id = docId;
  }

  // getMany(key: string): Promise<string> {
  //   // return this.rpc.call<{ id: string, key: string }, string>(RPCMethod.DOC_GET, { id: this.id, key });
  //   // return this.rpc.docGet(this.id, key);
  // }

  // async* watch (doc) {
    // const sub = await Deno[Deno.internal].core.ops.op_doc_subscribe(doc);
    // while (true) {
    //   const event = await Deno[Deno.internal].core.ops.op_next_doc_event(sub);
    //   yield event;
    // }
  // }

  async set(key: string, value: string) {
    return this.rpc.docSet(this.id, key, value);
  }

  async share(shareMode: DocShareMode): Promise<TicketResponse> {
    return this.rpc.docShare(this.id, shareMode);
  }
}