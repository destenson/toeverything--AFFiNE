import {
  getDefaultContext as __emnapiGetDefaultContext,
  instantiateNapiModuleSync as __emnapiInstantiateNapiModuleSync,
  WASI as __WASI,
} from '@napi-rs/wasm-runtime';

import __wasmUrl from './affine-pdf.wasm32-wasi.wasm?url';

const __wasi = new __WASI({
  version: 'preview1',
});

const __emnapiContext = __emnapiGetDefaultContext();

const __sharedMemory = new WebAssembly.Memory({
  initial: 4000,
  maximum: 65536,
  shared: true,
});

const __wasmFile = await fetch(__wasmUrl).then(res => res.arrayBuffer());

const {
  instance: __napiInstance,
  module: __wasiModule,
  napiModule: __napiModule,
} = __emnapiInstantiateNapiModuleSync(__wasmFile, {
  context: __emnapiContext,
  asyncWorkPoolSize: 4,
  wasi: __wasi,
  onCreateWorker() {
    const worker = new Worker(
      new URL('./wasi-worker-browser.mjs', import.meta.url),
      {
        type: 'module',
      }
    );

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
  __napiInstance.exports['__napi_register__PdfPage_struct_0']?.();
  __napiInstance.exports['__napi_register__PdfPage_impl_2']?.();
  __napiInstance.exports['__napi_register__PdfPages_struct_3']?.();
  __napiInstance.exports['__napi_register__PdfPages_impl_6']?.();
  __napiInstance.exports['__napi_register__PdfDocument_struct_7']?.();
  __napiInstance.exports['__napi_register__PdfDocument_impl_10']?.();
  __napiInstance.exports['__napi_register__PdfManager_struct_11']?.();
  __napiInstance.exports['__napi_register__PdfManager_impl_17']?.();
}
export const PdfDocument = __napiModule.exports.PdfDocument;
export const PdfManager = __napiModule.exports.PdfManager;
export const PdfPage = __napiModule.exports.PdfPage;
export const PdfPages = __napiModule.exports.PdfPages;
