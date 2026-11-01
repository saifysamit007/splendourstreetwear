import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Handle and ignore benign Vite HMR websocket errors frequently encountered in this environment
(function() {
  const suppress = (event: any) => {
    const reason = event.reason;
    const message = ((reason ? (reason.message || reason) : '') || event.message || '').toString();
    
    if (message && (
      message.includes('WebSocket') || 
      message.includes('vite') ||
      message.includes('HMR') ||
      message.includes('closed without opened')
    )) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      return true;
    }
  };

  window.addEventListener('unhandledrejection', suppress, true);
  window.addEventListener('error', suppress, true);
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
