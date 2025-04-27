import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
    userId: number;
    permissions: string[];
    token: string;
  }
  
  const AuthContext = createContext<AuthState | null>(null);
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState | null>(null);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setAuth({
            userId: decoded.user_id,
            permissions: decoded.permissions,
            token,
          });
        } catch (e) {
          console.error('Invalid token:', e);
        }
      }
    }, []);
  
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
  };
  
  export const useAuth = (): AuthState => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
  };