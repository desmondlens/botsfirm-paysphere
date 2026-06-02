import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const savedToken = sessionStorage.getItem('paysphere_token');
    const savedUser = sessionStorage.getItem('paysphere_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.removeItem('paysphere_token');
        sessionStorage.removeItem('paysphere_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);

    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      sessionStorage.setItem('paysphere_token', data.token);
      sessionStorage.setItem('paysphere_user', JSON.stringify(data.user));
    }

    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue logout even if API call fails
    }
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('paysphere_token');
    sessionStorage.removeItem('paysphere_user');
  };

  const isAuthenticated = !!token && !!user;

  const hasRole = (role) => user?.role === role;

  const hasTenant = (tenantId) => user?.tenant_id === tenantId;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      hasRole,
      hasTenant,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;