import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import faviconUrl from './assets/Logo SHort White.png'

const faviconLink = document.querySelector('link[rel="icon"]')
if (faviconLink) {
  faviconLink.type = 'image/png'
  faviconLink.sizes = '32x32'
  faviconLink.href = faviconUrl
}

let appleLink = document.querySelector('link[rel="apple-touch-icon"]')
if (!appleLink) {
  appleLink = document.createElement('link')
  appleLink.rel = 'apple-touch-icon'
  document.head.appendChild(appleLink)
}
appleLink.href = faviconUrl
appleLink.sizes = '180x180'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster/>
  </BrowserRouter>
  )
