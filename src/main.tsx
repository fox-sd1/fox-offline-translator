hereimport React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { env } from '@xenova/transformers';

// إعدادات المحرك الموحدة لتعمل على الأندرويد أوفلاين
env.allowRemoteModels = true;
env.useBrowserCache = true;

// إعدادات الـ WASM الضرورية لتشغيل الذكاء الاصطناعي داخل التطبيق
env.backends.onnx.wasm.proxy = false;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
