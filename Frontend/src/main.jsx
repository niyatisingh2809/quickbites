import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './Context/StoreContext.jsx'
import { LanguageProvider } from './Context/LanguageContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LanguageProvider>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </LanguageProvider>
  </BrowserRouter>,
);

// Register Progressive Web App Service Worker for offline shell and installability
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ [PWA] QuickBites ServiceWorker active:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ [PWA] ServiceWorker notice:', err.message);
      });
  });
}
