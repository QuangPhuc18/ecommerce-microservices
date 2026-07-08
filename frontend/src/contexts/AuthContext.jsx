import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to decode JWT
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Initialize from token on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const decoded = parseJwt(token);
          if (decoded && decoded.exp * 1000 > Date.now()) {
            setUser({ 
              isLoggedIn: true, 
              email: decoded.sub, 
              role: decoded.role, 
              userId: decoded.userId 
            });
          } else {
            // Token expired
            localStorage.removeItem('jwt_token');
          }
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem('jwt_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    const decoded = parseJwt(token);
    setUser({ 
      isLoggedIn: true, 
      email: decoded?.sub, 
      role: decoded?.role, 
      userId: decoded?.userId 
    });
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
