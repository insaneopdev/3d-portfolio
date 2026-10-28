import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './visual-motion.css';
import './brand-overrides.css';
import VisualMotion from './VisualMotion.jsx';
import LoadingScrollProgress from './LoadingScrollProgress.jsx';
import LivingMotion from './LivingMotion.jsx';

createRoot(document.getElementById('root')).render(
 <React.StrictMode>
 <>
 <App />
 <VisualMotion />
 <LoadingScrollProgress />
 <LivingMotion />
 </>
 </React.StrictMode>,
);
