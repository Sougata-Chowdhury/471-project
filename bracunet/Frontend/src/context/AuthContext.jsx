
import React, { createContext, useState, useCallback, useEffect } from "react";
import { setAuthToken } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
      const token = localStorage.getItem("token");
      
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
      
      // Add token to headers if available
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
        headers,
        ...options,
      });

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        // Don't set global error for auth endpoints - they handle their own errors
        const error = new Error(data?.message || response.statusText || "API Error");
        if (!endpoint.includes('/auth/')) {
          setError(error.message);
        }
        throw error;
      }

      return data;
    } catch (err) {
      // Only set error if it's not an auth endpoint
      if (!endpoint.includes('/auth/')) {
        setError(err.message || "Network error");
      }
      throw err;
    }
  }, []);

  const register = useCallback(
    async (name, email, password, confirmPassword, role = "student") => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiCall("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password, confirmPassword, role }),
        });
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token); // Save token
        setAuthToken(data.token); // Set token in axios instance
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
        const data = await apiCall("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token); // Save token
        setAuthToken(data.token); // Set token in axios instance
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
    setError(null); // Clear any existing errors
    try {
      await apiCall("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // Continue with logout even if API call fails
    } finally {
      // Clear all authentication data
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      setAuthToken(null);
      
      // Prevent back navigation to protected pages
      window.history.replaceState(null, '', '/login');
      
      setIsLoading(false);
    }
  }, [apiCall]);

  const getCurrentUser = useCallback(async () => {
    try {
      const data = await apiCall("/api/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return data.user;
    } catch {
      setUser(null);
      // This is expected if user is not logged in
    }
  }, [apiCall]);

  const clearError = useCallback(() => setError(null), []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiCall("/api/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  }, [apiCall]);

  // Auto-refresh user data on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      refreshUser();
    }
  }, []); // Only run once on mount

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        error,
        register,
        login,
        logout,
        getCurrentUser,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
