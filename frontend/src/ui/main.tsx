// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { CallProvider } from './contexts/CallContext.tsx';

createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
	  <AuthProvider>
		  <HashRouter>
			<CallProvider>
				<App />
			</CallProvider>
		  </HashRouter>
	  </AuthProvider>
	</React.StrictMode>
  );
