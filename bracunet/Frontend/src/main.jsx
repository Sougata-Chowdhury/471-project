import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';import { setAuthToken } from './api/api'

// Set token from localStorage on app initialization
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
