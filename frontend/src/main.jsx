import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import axios from 'axios'

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5173/api/'
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
