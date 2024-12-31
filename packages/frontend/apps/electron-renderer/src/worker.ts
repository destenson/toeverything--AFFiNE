import { getElectronAPIs } from '@affine/electron-api/web-worker';
import {
  WorkerConsumer,
  type WorkerOps,
} from '@affine/nbstore/worker/consumer';
import { type MessageCommunicapable, OpConsumer } from '@toeverything/infra/op';
import { bindNativeDBApis } from '@affine/nbstore/sqlite';

const electronAPIs = getElectronAPIs();

bindNativeDBApis(electronAPIs.nbstore);

const consumer = new OpConsumer<WorkerOps>(globalThis as MessageCommunicapable);

new WorkerConsumer(consumer);
