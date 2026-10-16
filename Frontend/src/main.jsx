import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
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
)
