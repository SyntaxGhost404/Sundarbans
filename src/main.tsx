import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fonts'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/screens.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Offline support. Skipped in development and inside frames, where a
// service worker would only get in the way.
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.top === window.self) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err) => {
      console.warn('Offline mode is unavailable:', err)
    })
  })
}
