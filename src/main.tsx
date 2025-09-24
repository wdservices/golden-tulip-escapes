import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress Fingerprint Pro loader unhandled rejection errors caused by blocked requests
window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || '');
  if (msg.includes('API key not found') || msg.includes('fpjs') || msg.includes('Fingerprint')) {
    event.preventDefault();
    // Silently ignore to avoid console noise; the underlying requests are blocked by CSP
    return;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
