import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // TailWind CSS yahan honi chahiye
import { BrowserRouter } from 'react-router-dom'

// 👇 IMPORT KARO
import { getWebContainer } from './lib/webcontainer'; 

// 🔥 MAGIC LINE: App start hote hi Boot shuru kar do!
// Hum await nahi kar rahe, bas background mein chhod rahe hain.
// Jab tak user "Start" button dabayega, WebContainer ready milega.
getWebContainer().catch((err) => console.error("Background Boot Error:", err));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)