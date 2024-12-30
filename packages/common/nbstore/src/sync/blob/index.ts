import { difference } from 'lodash-es';
import type { Observable } from 'rxjs';

import type { BlobRecord, BlobStorage } from '../../storage';
import { MANUALLY_STOP, throwIfAborted } from '../../utils/throw-if-aborted';
import EventEmitter2 from 'eventemitter2';

export interface BlobSyncState {
  isStorageOverCapacity: boolean;
}

export interface BlobSync {
  readonly state$: Observable<BlobSyncState>;
  downloadBlob(
    blobId: string,
    signal?: AbortSignal
  ): Promise<BlobRecord | null>;
  uploadBlob(blob: BlobRecord, signal?: AbortSignal): Promise<void>;
  fullSync(signal?: AbortSignal): Promise<void>;
  setMaxBlobSize(size: number): void;
  onReachedMaxBlobSize(cb: () => void): () => void;
}

export class BlobSyncImpl implements BlobSync {
  private abort: AbortController | null = null;
  private maxBlobSize: number = 1024 * 1024 * 100; // 100MB
  readonly event = new EventEmitter2();

  constructor(
    readonly local: BlobStorage,
    readonly remotes: BlobStorage[]
  ) {}

  async downloadBlob(blobId: string, signal?: AbortSignal) {
    const localBlob = await this.local.get(blobId, signal);
    if (localBlob) {
      return localBlob;
    }

    for (const storage of this.remotes) {
      const data = await storage.get(blobId, signal);
      if (data) {
        await this.local.set(data, signal);
        return data;
      }
    }
    return null;
  }

  async uploadBlob(blob: BlobRecord, signal?: AbortSignal) {
    await this.local.set(blob);
    await Promise.allSettled(
      this.remotes.map(remote => remote.set(blob, signal))
    );
  }

  async fullSync(signal?: AbortSignal) {
    throwIfAborted(signal);

    for (const remote of this.remotes) {
      let localList: string[] = [];
      let remoteList: string[] = [];

      try {
        localList = (await this.local.list(signal)).map(b => b.key);
        throwIfAborted(signal);
        remoteList = (await remote.list(signal)).map(b => b.key);
        throwIfAborted(signal);
      } catch (err) {
        if (err === MANUALLY_STOP) {
          throw err;
        }
        console.error(`error when sync`, err);
        continue;
      }

      const needUpload = difference(localList, remoteList);
      for (const key of needUpload) {
        try {
          const data = await this.local.get(key, signal);
          throwIfAborted(signal);
          if (data) {
            await remote.set(data, signal);
            throwIfAborted(signal);
          }
        } catch (err) {
          if (err === MANUALLY_STOP) {
            throw err;
          }
          console.error(
            `error when sync ${key} from [${this.local.peer}] to [${remote.peer}]`,
            err
          );
        }
      }

      const needDownload = difference(remoteList, localList);

      for (const key of needDownload) {
        try {
          const data = await remote.get(key, signal);
          throwIfAborted(signal);
          if (data) {
            await this.local.set(data, signal);
            throwIfAborted(signal);
          }
        } catch (err) {
          if (err === MANUALLY_STOP) {
            throw err;
          }
          console.error(
            `error when sync ${key} from [${remote.peer}] to [${this.local.peer}]`,
            err
          );
        }
      }
    }
  }

  start() {
    if (this.abort) {
      this.abort.abort();
    }

    const abort = new AbortController();
    this.abort = abort;

    this.fullSync(abort.signal).catch(error => {
      if (error === MANUALLY_STOP) {
        return;
      }
      console.error('sync blob error', error);
    });
  }

  stop() {
    this.abort?.abort();
    this.abort = null;
  }

  addPriority(_id: string, _priority: number): () => void {
    // TODO: implement
    return () => {};
  }

  setMaxBlobSize(size: number): void {
    this.maxBlobSize = size;
  }

  onReachedMaxBlobSize(cb: () => void): () => void {
    return () => {};
  }
}
