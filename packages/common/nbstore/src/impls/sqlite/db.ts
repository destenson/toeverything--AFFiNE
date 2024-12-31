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
  readonly flavour: string;
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

  getDocTimestamp: (id: string, docId: string) => Promise<DocClock | null>;

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
  ) => Promise<void>;

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

export function bindNativeDBApis(a: NativeDBApis) {
  apis = a;
}

export class NativeDBConnection extends AutoReconnectConnection<void> {
  readonly apis: NativeDBApisWrapper;

  readonly flavour = this.options.flavour;
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
    return `sqlite:${this.flavour}:${this.type}:${this.id}`;
  }

  warpApis(originalApis: NativeDBApis): NativeDBApisWrapper {
    const id = universalId({
      peer: this.flavour,
      type: this.type,
      id: this.id,
    });
    const wrapped = {} as any;
    for (const key of Object.keys(originalApis)) {
      const v = originalApis[key as keyof NativeDBApis];
      if (typeof v !== 'function') {
        wrapped[key] = v;
      } else {
        wrapped[key] = async (...args: any[]) => {
          return (originalApis[key as keyof NativeDBApis] as any).call(
            originalApis,
            id,
            ...args
          );
        };
      }
    }
    return wrapped as NativeDBApisWrapper;
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
