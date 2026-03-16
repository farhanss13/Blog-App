import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import faviconUrl from './assets/Logo Full White.png'

const faviconLink = document.querySelector('link[rel="icon"]')
if (faviconLink) {
  faviconLink.type = 'image/png'
  faviconLink.href = faviconUrl
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster/>
  </BrowserRouter>
  )
