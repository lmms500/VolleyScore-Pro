import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Registro do Service Worker: Apenas em produção
if ('serviceWorker' in navigator) {
  // A verificação 'import.meta.env.PROD' deve estar disponível após a criação do vite-env.d.ts
  if (import.meta.env.PROD) { 
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  } else {
    console.log('Service Worker registration skipped in development mode.');
  }
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);