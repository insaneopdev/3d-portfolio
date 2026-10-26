import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './visual-motion.css';
import VisualMotion from './VisualMotion.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <App />
      <VisualMotion />
    </>
  </React.StrictMode>,
);
