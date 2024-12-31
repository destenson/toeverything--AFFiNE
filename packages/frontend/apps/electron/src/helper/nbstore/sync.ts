import {
  type DocClock,
  type DocClocks,
  share,
  type SpaceType,
  SyncStorageBase,
} from '@affine/nbstore';

import { NativeDBConnection } from './db';

export class SqliteSyncStorage extends SyncStorageBase {
  constructor(
    private readonly options: {
      peer: string;
      type: SpaceType;
      id: string;
    }
  ) {
    super();
  }

  override connection = share(
    new NativeDBConnection(
      this.options.peer,
      this.options.type,
      this.options.id
    )
  );

  get db() {
    return this.connection.inner;
  }

  override async getPeerRemoteClocks(peer: string) {
    const records = await this.db.getPeerRemoteClocks(peer);
    return records.reduce((clocks, { docId, timestamp }) => {
      clocks[docId] = timestamp;
      return clocks;
    }, {} as DocClocks);
  }

  override async getPeerRemoteClock(peer: string, docId: string) {
    return this.db.getPeerRemoteClock(peer, docId);
  }

  override async setPeerRemoteClock(peer: string, clock: DocClock) {
    await this.db.setPeerRemoteClock(peer, clock.docId, clock.timestamp);
  }

  override async getPeerPulledRemoteClock(peer: string, docId: string) {
    return this.db.getPeerPulledRemoteClock(peer, docId);
  }

  override async getPeerPulledRemoteClocks(peer: string) {
    const records = await this.db.getPeerPulledRemoteClocks(peer);
    return records.reduce((clocks, { docId, timestamp }) => {
      clocks[docId] = timestamp;
      return clocks;
    }, {} as DocClocks);
  }

  override async setPeerPulledRemoteClock(peer: string, clock: DocClock) {
    await this.db.setPeerPulledRemoteClock(peer, clock.docId, clock.timestamp);
  }

  override async getPeerPushedClocks(peer: string) {
    const records = await this.db.getPeerPushedClocks(peer);
    return records.reduce((clocks, { docId, timestamp }) => {
      clocks[docId] = timestamp;
      return clocks;
    }, {} as DocClocks);
  }

  override async getPeerPushedClock(peer: string, docId: string) {
    return this.db.getPeerPushedClock(peer, docId);
  }

  override async setPeerPushedClock(peer: string, clock: DocClock) {
    await this.db.setPeerPushedClock(peer, clock.docId, clock.timestamp);
  }

  override async clearClocks() {
    await this.db.clearClocks();
  }
}
