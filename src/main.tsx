import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Handle and ignore benign Vite HMR websocket errors frequently encountered in this environment
(function() {
  const suppress = (event: any) => {
    const reason = event.reason;
    const message = (reason ? (reason.message || reason) : (event.message || '')).toString();
    
    if (message && (
      message.includes('WebSocket') || 
      message.includes('vite') ||
      message.includes('HMR') ||
      message.includes('closed without opened')
    )) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  window.addEventListener('unhandledrejection', suppress);
  window.addEventListener('error', suppress, true);
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
