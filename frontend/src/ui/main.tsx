// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';


createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
	  <AuthProvider>
		<BrowserRouter>
		  <App />
		</BrowserRouter>
	  </AuthProvider>
	</React.StrictMode>
  );
