import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { env } from '@xenova/transformers';

// إعدادات صارمة للتشغيل داخل الأندرويد
env.allowRemoteModels = true;
env.useBrowserCache = true;

// هذا الجزء هو المسؤول عن فك التعليق
env.backends.onnx.wasm.proxy = false; 
env.backends.onnx.wasm.numThreads = 1; // تقليل الخيوط لضمان الاستقرار على الهواتف
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
