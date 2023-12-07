
export interface Author {
  id: string;
  name: string;
}

export interface NodeStatus {
}

export interface DocEntry {
  author_id: string;
  key: string;
  timestamp: number;
  hash: string;
}

export interface DocInfo {
  doc_id: string
  name: string
  data?: DocEntry[]
}

export interface BlobResponse {
  hash: string
  size: number
}

export interface TicketResponse {
  doc_id: string
  ticket: string
}

export enum DocShareMode {
  READ = 'read',
  WRITE = 'write',
}

export interface BlobInfo {
  tag?: string
  path: string
  hash: string
  size: number
}