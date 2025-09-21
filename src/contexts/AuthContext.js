// src/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';

// ✅ export it as *named* so `import { AuthContext } ...` works
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap session from localStorage
  useEffect(() => {
    let alive = true;

    const boot = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
          const { data } = await apiClient.get('/api/users/me');
          if (alive) setUser(data);
        } else {
          if (alive) setUser(null);
        }
      } catch {
        localStorage.removeItem('access_token');
        delete apiClient.defaults.headers.common.Authorization;
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    boot();
    return () => { alive = false; };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.set('username', username);
      form.set('password', password);
      form.set('grant_type', 'password'); // FastAPI OAuth2 password flow
      form.set('scope', '');
      form.set('client_id', '');
      form.set('client_secret', '');

      const { data } = await apiClient.post('/auth/token', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = data?.access_token;
      if (!token) throw new Error('No token in response');

      localStorage.setItem('access_token', token);
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

      const me = await apiClient.get('/api/users/me');
      setUser(me.data);
      return true;
    } catch (err) {
      localStorage.removeItem('access_token');
      delete apiClient.defaults.headers.common.Authorization;
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    delete apiClient.defaults.headers.common.Authorization;
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ hook used across the app
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    // If called outside provider during first paint, present a safe shape
    return {
      user: null,
      loading: true,
      isAuthenticated: false,
      login: async () => Promise.reject(new Error('AuthProvider not available')),
      logout: () => {},
    };
  }
  return ctx;
}

// Also keep default export for any existing default imports
export default AuthContext;