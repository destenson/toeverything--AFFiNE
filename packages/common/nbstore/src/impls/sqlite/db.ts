import { AutoReconnectConnection } from '../../connection';
import type {
  BlobRecord,
  DocClock,
  DocClocks,
  DocRecord,
  DocUpdate,
  ListedBlobRecord,
} from '../../storage';
import { type SpaceType, universalId } from '../../utils/universal-id';

export interface SqliteNativeDBOptions {
  readonly peer: string;
  readonly type: SpaceType;
  readonly id: string;
}

type NativeDBApis = {
  connect: (id: string) => Promise<void>;

  close: (id: string) => Promise<void>;

  pushDocUpdate: (id: string, update: DocUpdate) => Promise<DocClock>;

  getDoc: (id: string, docId: string) => Promise<DocRecord | null>;

  deleteDoc: (id: string, docId: string) => Promise<void>;

  getDocTimestamps: (id: string, after?: Date) => Promise<DocClocks>;

  getDocTimestamp: (id: string, docId: string) => Promise<DocClock>;

  setBlob: (id: string, blob: BlobRecord) => Promise<void>;

  getBlob: (id: string, key: string) => Promise<BlobRecord | null>;

  deleteBlob: (id: string, key: string, permanently: boolean) => Promise<void>;

  listBlobs: (id: string) => Promise<ListedBlobRecord[]>;

  releaseBlobs: (id: string) => Promise<void>;

  getPeerRemoteClocks: (id: string, peer: string) => Promise<DocClocks>;

  getPeerRemoteClock: (
    id: string,
    peer: string,
    docId: string
  ) => Promise<DocClock | null>;

  setPeerRemoteClock: (
    id: string,
    peer: string,
    clock: DocClock
  ) => Promise<void>;

  getPeerPulledRemoteClocks: (id: string, peer: string) => Promise<DocClocks>;

  getPeerPulledRemoteClock: (
    id: string,
    peer: string,
    docId: string
  ) => Promise<DocClock | null>;

  setPeerPulledRemoteClock: (
    id: string,
    peer: string,
    clock: DocClock
  ) => Promise<DocClock | null>;

  getPeerPushedClocks: (id: string, peer: string) => Promise<DocClocks>;

  getPeerPushedClock: (
    id: string,
    peer: string,
    docId: string
  ) => Promise<DocClock | null>;

  setPeerPushedClock: (
    id: string,
    peer: string,
    clock: DocClock
  ) => Promise<void>;

  clearClocks: (id: string) => Promise<void>;
};

type NativeDBApisWrapper = NativeDBApis extends infer APIs
  ? {
      [K in keyof APIs]: APIs[K] extends (...args: any[]) => any
        ? Parameters<APIs[K]> extends [string, ...infer Rest]
          ? (...args: Rest) => ReturnType<APIs[K]>
          : never
        : never;
    }
  : never;

let apis: NativeDBApis | null = null;

export function bindApis(apis: NativeDBApis) {
  return new Proxy(apis, {
    get: (target, key: keyof NativeDBApis) => {
      return target[key];
    },
  });
}

export class NativeDBConnection extends AutoReconnectConnection<void> {
  readonly apis: NativeDBApisWrapper;

  readonly peer = this.options.peer;
  readonly type = this.options.type;
  readonly id = this.options.id;

  constructor(private readonly options: SqliteNativeDBOptions) {
    super();

    if (!apis) {
      throw new Error('Not in native context.');
    }

    this.apis = this.warpApis(apis);
  }

  override get shareId(): string {
    return `sqlite:${this.peer}:${this.type}:${this.id}`;
  }

  warpApis(originalApis: NativeDBApis): NativeDBApisWrapper {
    const id = universalId({
      peer: this.peer,
      type: this.type,
      id: this.id,
    });
    return new Proxy(originalApis, {
      get: (target, key: keyof NativeDBApisWrapper) => {
        const v = target[key];
        if (typeof v !== 'function') {
          return v;
        }

        return async (...args: any[]) => {
          return v.call(
            originalApis,
            id,
            // @ts-expect-error I don't know why it complains ts(2556)
            ...args
          );
        };
      },
    }) as unknown as NativeDBApisWrapper;
  }

  override async doConnect() {
    await this.apis.connect();
  }

  override doDisconnect() {
    this.apis.close().catch(err => {
      console.error('NativeDBConnection close failed', err);
    });
  }
}
