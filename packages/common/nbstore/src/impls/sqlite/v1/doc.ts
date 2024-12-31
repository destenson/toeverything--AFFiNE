import { apis } from '@affine/electron-api';

import { DummyConnection } from '../../../connection';
import {
  type DocRecord,
  DocStorageBase,
  type DocUpdate,
} from '../../../storage';
import type { SpaceType } from '../../../utils/universal-id';

/**
 * @deprecated readonly
 */
export class SqliteV1DocStorage extends DocStorageBase<{
  type: SpaceType;
  id: string;
}> {
  override connection = new DummyConnection();

  get db() {
    if (!apis) {
      throw new Error('Not in electron context.');
    }

    return apis.db;
  }

  override async pushDocUpdate(update: DocUpdate) {
    // no more writes

    return { docId: update.docId, timestamp: new Date() };
  }

  override async getDoc(docId: string) {
    const bin = await this.db.getDocAsUpdates(
      this.options.type,
      this.options.id,
      docId
    );

    return {
      docId,
      bin,
      timestamp: new Date(),
    };
  }

  override async deleteDoc(docId: string) {
    await this.db.deleteDoc(this.options.type, this.options.id, docId);
  }

  protected override async getDocSnapshot() {
    return null;
  }

  override async getDocTimestamps() {
    return {};
  }

  override async getDocTimestamp() {
    return null;
  }

  protected override async setDocSnapshot(): Promise<boolean> {
    return false;
  }

  protected override async getDocUpdates(): Promise<DocRecord[]> {
    return [];
  }

  protected override async markUpdatesMerged(): Promise<number> {
    return 0;
  }
}
