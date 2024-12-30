import {
  type BlobRecord,
  BlobStorageBase,
  share,
  type SpaceType,
} from '@affine/nbstore';

import { NativeDBConnection } from './db';

export class SqliteBlobStorage extends BlobStorageBase {
  override connection = share(
    new NativeDBConnection(
      this.options.peer,
      this.options.type,
      this.options.id
    )
  );

  constructor(
    private readonly options: {
      peer: string;
      type: SpaceType;
      id: string;
    }
  ) {
    super();
  }

  get db() {
    return this.connection.inner;
  }

  override async get(key: string) {
    return this.db.getBlob(key);
  }

  override async set(blob: BlobRecord) {
    await this.db.setBlob(blob);
  }

  override async delete(key: string, permanently: boolean) {
    await this.db.deleteBlob(key, permanently);
  }

  override async release() {
    await this.db.releaseBlobs();
  }

  override async list() {
    return this.db.listBlobs();
  }
}
