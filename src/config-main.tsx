import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigConsole } from './pages/ConfigConsole'
import './index.css'

ReactDOM.createRoot(document.getElementById('config-root')!).render(
  <React.StrictMode>
    <ConfigConsole />
  </React.StrictMode>,
)

