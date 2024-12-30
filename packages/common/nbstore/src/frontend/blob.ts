import type { BlobRecord, BlobStorage } from '../storage';
import type { BlobSync } from '../sync/blob';

export class BlobFrontend {
  constructor(
    public readonly storage: BlobStorage,
    private readonly sync?: BlobSync
  ) {}

  get(blobId: string) {
    return this.sync
      ? this.sync.downloadBlob(blobId)
      : this.storage.get(blobId);
  }

  set(blob: BlobRecord) {
    return this.sync ? this.sync.uploadBlob(blob) : this.storage.set(blob);
  }

  fullSync() {
    return this.sync ? this.sync.fullSync() : Promise.resolve();
  }

  addPriority(_id: string, _priority: number) {
    // not support yet
  }
}
