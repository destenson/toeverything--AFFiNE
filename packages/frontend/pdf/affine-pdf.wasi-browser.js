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
  __napiInstance.exports['__napi_register__Document_struct_0']?.();
  __napiInstance.exports['__napi_register__Document_impl_6']?.();
  __napiInstance.exports['__napi_register__Page_struct_7']?.();
  __napiInstance.exports['__napi_register__Page_impl_17']?.();
  __napiInstance.exports['__napi_register__Pages_struct_18']?.();
  __napiInstance.exports['__napi_register__Pages_impl_21']?.();
  __napiInstance.exports['__napi_register__Rotation_22']?.();
  __napiInstance.exports['__napi_register__Orientation_23']?.();
  __napiInstance.exports['__napi_register__PageSize_struct_24']?.();
  __napiInstance.exports['__napi_register__PageSize_impl_26']?.();
  __napiInstance.exports['__napi_register__ImageData_struct_27']?.();
  __napiInstance.exports['__napi_register__Viewer_struct_28']?.();
  __napiInstance.exports['__napi_register__Viewer_impl_34']?.();
  __napiInstance.exports['__napi_register__Rect_struct_35']?.();
  __napiInstance.exports['__napi_register__Rect_impl_42']?.();
}
export const Document = __napiModule.exports.Document;
export const ImageData = __napiModule.exports.ImageData;
export const Page = __napiModule.exports.Page;
export const Pages = __napiModule.exports.Pages;
export const PageSize = __napiModule.exports.PageSize;
export const Rect = __napiModule.exports.Rect;
export const Viewer = __napiModule.exports.Viewer;
export const Orientation = __napiModule.exports.Orientation;
export const Rotation = __napiModule.exports.Rotation;
