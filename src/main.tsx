import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { env } from '@xenova/transformers';

// إعدادات البيئة لتعمل داخل الأندرويد
env.allowRemoteModels = true; 
env.useBrowserCache = true;
// هذا السطر يمنع المكتبة من البحث عن مسارات غير موجودة في الأندرويد
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
