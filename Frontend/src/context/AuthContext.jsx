import React, { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(
    async (name, email, password, confirmPassword, role = 'student') => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiCall('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, confirmPassword, role }),
        });
        setUser(data.user);
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiCall('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setUser(data.user);
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  const getCurrentUser = useCallback(async () => {
    try {
      const data = await apiCall('/api/auth/me');
      setUser(data.user);
      return data.user;
    } catch (err) {
      setUser(null);
      // This is expected if user is not logged in
    }
  }, [apiCall]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        register,
        login,
        logout,
        getCurrentUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
