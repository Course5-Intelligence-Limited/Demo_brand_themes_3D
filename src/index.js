// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // optional, for global styles
import BrandThemeGraph3D from './BrandThemeGraph3D';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrandThemeGraph3D />
  </React.StrictMode>
);
