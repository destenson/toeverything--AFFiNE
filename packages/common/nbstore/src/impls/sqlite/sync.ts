import { share } from '../../connection';
import { type DocClock, SyncStorageBase } from '../../storage';
import { NativeDBConnection, type SqliteNativeDBOptions } from './db';

export class SqliteSyncStorage extends SyncStorageBase {
  static readonly identifier = 'SqliteSyncStorage';

  override connection = share(new NativeDBConnection(this.options));

  constructor(private readonly options: SqliteNativeDBOptions) {
    super();
  }

  get db() {
    return this.connection.apis;
  }

  override async getPeerRemoteClocks(peer: string) {
    return this.db.getPeerRemoteClocks(peer);
  }

  override async getPeerRemoteClock(peer: string, docId: string) {
    return this.db.getPeerRemoteClock(peer, docId);
  }

  override async setPeerRemoteClock(peer: string, clock: DocClock) {
    await this.db.setPeerRemoteClock(peer, clock);
  }

  override async getPeerPulledRemoteClocks(peer: string) {
    return this.db.getPeerPulledRemoteClocks(peer);
  }

  override async getPeerPulledRemoteClock(peer: string, docId: string) {
    return this.db.getPeerPulledRemoteClock(peer, docId);
  }

  override async setPeerPulledRemoteClock(peer: string, clock: DocClock) {
    await this.db.setPeerPulledRemoteClock(peer, clock);
  }

  override async getPeerPushedClocks(peer: string) {
    return this.db.getPeerPushedClocks(peer);
  }

  override async getPeerPushedClock(peer: string, docId: string) {
    return this.db.getPeerPushedClock(peer, docId);
  }

  override async setPeerPushedClock(peer: string, clock: DocClock) {
    await this.db.setPeerPushedClock(peer, clock);
  }

  override async clearClocks() {
    await this.db.clearClocks();
  }
}
