import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useAuth();
  return auth.permissions.includes('view_admin_panel') ? children : <Navigate to="/app/main" replace />;
};