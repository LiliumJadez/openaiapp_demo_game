import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initImageCache } from './services/imageCache'

// 初始化图片缓存
initImageCache().then(() => {
  console.log('图片缓存系统已初始化');
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

