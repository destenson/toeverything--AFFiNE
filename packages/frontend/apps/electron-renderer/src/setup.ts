import '@affine/core/bootstrap/electron';
import '@affine/component/theme';
import './global.css';
import { bindNativeDBApis } from '@affine/nbstore/sqlite';
import { apis } from '@affine/electron-api';

bindNativeDBApis(apis!.nbstore);
