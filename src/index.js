import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Ensure the browser tab shows the application name
if (!document.title || !document.title.includes('NexStock')) {
  document.title = `NexStock${document.title ? ' - ' + document.title : ''}`;
}
root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
