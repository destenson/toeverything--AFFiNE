/* eslint-disable */
/* prettier-ignore */

/* auto-generated by NAPI-RS */

const __nodeFs = require('node:fs')
const __nodePath = require('node:path');
const { WASI: __nodeWASI } = require('node:wasi');
const { Worker } = require('node:worker_threads');

const {
  instantiateNapiModuleSync: __emnapiInstantiateNapiModuleSync,
  getDefaultContext: __emnapiGetDefaultContext,
  createOnMessage: __wasmCreateOnMessageForFsProxy,
} = require('@napi-rs/wasm-runtime');

const __rootDir = __nodePath.parse(process.cwd()).root;

const __wasi = new __nodeWASI({
  version: 'preview1',
  env: process.env,
  preopens: {
    [__rootDir]: __rootDir,
  },
});

const __emnapiContext = __emnapiGetDefaultContext();

const __sharedMemory = new WebAssembly.Memory({
  initial: 4000,
  maximum: 65536,
  shared: true,
});

let __wasmFilePath = __nodePath.join(__dirname, 'affine-pdf.wasm32-wasi.wasm');
const __wasmDebugFilePath = __nodePath.join(
  __dirname,
  'affine-pdf.wasm32-wasi.debug.wasm'
);

if (__nodeFs.existsSync(__wasmDebugFilePath)) {
  __wasmFilePath = __wasmDebugFilePath;
} else if (!__nodeFs.existsSync(__wasmFilePath)) {
  try {
    __wasmFilePath = __nodePath.resolve('@affine/pdf-wasm32-wasi');
  } catch {
    throw new Error(
      'Cannot find affine-pdf.wasm32-wasi.wasm file, and @affine/pdf-wasm32-wasi package is not installed.'
    );
  }
}

const {
  instance: __napiInstance,
  module: __wasiModule,
  napiModule: __napiModule,
} = __emnapiInstantiateNapiModuleSync(__nodeFs.readFileSync(__wasmFilePath), {
  context: __emnapiContext,
  asyncWorkPoolSize: (function () {
    const threadsSizeFromEnv = Number(
      process.env.NAPI_RS_ASYNC_WORK_POOL_SIZE ?? process.env.UV_THREADPOOL_SIZE
    );
    // NaN > 0 is false
    if (threadsSizeFromEnv > 0) {
      return threadsSizeFromEnv;
    } else {
      return 4;
    }
  })(),
  wasi: __wasi,
  onCreateWorker() {
    const worker = new Worker(__nodePath.join(__dirname, 'wasi-worker.mjs'), {
      env: process.env,
      execArgv: ['--experimental-wasi-unstable-preview1'],
    });
    worker.onmessage = ({ data }) => {
      __wasmCreateOnMessageForFsProxy(__nodeFs)(data);
    };
    return worker;
  },
  overwriteImports(importObject) {
    importObject.env = {
      ...importObject.env,
      ...importObject.napi,
      ...importObject.emnapi,
      memory: __sharedMemory,
    };
    return importObject;
  },
  beforeInit({ instance }) {
    __napi_rs_initialize_modules(instance);
  },
});

function __napi_rs_initialize_modules(__napiInstance) {
  __napiInstance.exports['__napi_register__Document_struct_0']?.();
  __napiInstance.exports['__napi_register__Document_impl_2']?.();
  __napiInstance.exports['__napi_register__Page_struct_3']?.();
  __napiInstance.exports['__napi_register__Page_impl_13']?.();
  __napiInstance.exports['__napi_register__Pages_struct_14']?.();
  __napiInstance.exports['__napi_register__Pages_impl_17']?.();
  __napiInstance.exports['__napi_register__Rotation_18']?.();
  __napiInstance.exports['__napi_register__Orientation_19']?.();
  __napiInstance.exports['__napi_register__PageSize_struct_20']?.();
  __napiInstance.exports['__napi_register__PageSize_impl_22']?.();
  __napiInstance.exports['__napi_register__ImageData_struct_23']?.();
  __napiInstance.exports['__napi_register__Viewer_struct_24']?.();
  __napiInstance.exports['__napi_register__Viewer_impl_30']?.();
  __napiInstance.exports['__napi_register__Rect_struct_31']?.();
  __napiInstance.exports['__napi_register__Rect_impl_38']?.();
}
module.exports.Document = __napiModule.exports.Document;
module.exports.ImageData = __napiModule.exports.ImageData;
module.exports.Page = __napiModule.exports.Page;
module.exports.Pages = __napiModule.exports.Pages;
module.exports.PageSize = __napiModule.exports.PageSize;
module.exports.Rect = __napiModule.exports.Rect;
module.exports.Viewer = __napiModule.exports.Viewer;
module.exports.Orientation = __napiModule.exports.Orientation;
module.exports.Rotation = __napiModule.exports.Rotation;
