import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { brand } from './brandConfig.js';
import './i18n.js';

document.title = brand.fullName;

const style = document.createElement('style');
style.textContent = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; background: #F5F8F7; -webkit-font-smoothing: antialiased; }
  input, textarea, select, button { font-family: inherit; }
  ::placeholder { color: #9CA3AF; }
  @media print {
    [data-noprint="1"] { display: none !important; }
    [data-printarea="1"] { padding: 0 !important; }
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
