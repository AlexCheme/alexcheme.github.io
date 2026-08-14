import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent cross-origin frame security exceptions inside preview iframe environments
window.onerror = function (msg, url, lineNo, columnNo, error) {
  const errorStr = String(msg) + ' ' + String(error?.message || '') + ' ' + String(error?.name || '') + ' ' + String(error || '');
  if (
    errorStr.includes('origin') ||
    errorStr.includes('Location') ||
    errorStr.includes('Blocked a frame') ||
    errorStr.includes('cross-origin') ||
    errorStr.includes('SecurityError') ||
    errorStr.includes('Script error')
  ) {
    return true; // Suppress error in preview iframe
  }
  return false;
};

window.addEventListener(
  'error',
  (event) => {
    const msg =
      (event.message || '') +
      ' ' +
      (event.error?.message || '') +
      ' ' +
      (event.error?.name || '') +
      ' ' +
      String(event.error || '');
    if (
      msg.includes('origin') ||
      msg.includes('Location') ||
      msg.includes('Blocked a frame') ||
      msg.includes('cross-origin') ||
      msg.includes('SecurityError')
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    }
  },
  true
);

window.addEventListener(
  'unhandledrejection',
  (event) => {
    const reason =
      String(event.reason || '') +
      ' ' +
      String(event.reason?.message || '') +
      ' ' +
      String(event.reason?.name || '');
    if (
      reason.includes('origin') ||
      reason.includes('Location') ||
      reason.includes('Blocked a frame') ||
      reason.includes('cross-origin') ||
      reason.includes('SecurityError')
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    }
  },
  true
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
