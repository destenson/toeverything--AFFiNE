import type { Connection } from '../connection';

export type StorageType = 'blob' | 'doc' | 'sync' | 'awareness';

export interface Storage {
  readonly storageType: StorageType;
  readonly connection: Connection;
}

export abstract class StorageBase implements Storage {
  abstract readonly storageType: StorageType;
  abstract readonly connection: Connection;
  constructor() {}
}
