import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  // Configure axios interceptor for auth
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Configure axios response interceptor for handling 401s
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && token) {
          // Token is invalid, logout user
          logout();
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/admin/auth/me');
        setUser(response.data);
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Step 1: Login with username/password
      const response = await axios.post('/api/admin/auth/login', credentials);
      
      if (response.data.requires_mfa_setup) {
        return {
          step: 'mfa_setup',
          username: response.data.username,
          message: response.data.message
        };
      }
      
      if (response.data.requires_mfa) {
        return {
          step: 'mfa_verify',
          username: response.data.username,
          message: response.data.message
        };
      }
      
      // This shouldn't happen with current backend logic
      throw new Error('Unexpected login response');
      
    } catch (error) {
      const message = error.response?.data?.detail || 'Error en el login';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const setupMFA = async (username) => {
    try {
      const response = await axios.post('/api/admin/auth/setup-mfa', { username });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error configurando MFA';
      throw new Error(message);
    }
  };

  const verifyMFASetup = async (username, secret, mfa_code) => {
    try {
      const response = await axios.post('/api/admin/auth/verify-mfa-setup', {
        username,
        secret,
        mfa_code
      });
      
      // Save token and get user info
      const authToken = response.data.access_token;
      localStorage.setItem('admin_token', authToken);
      setToken(authToken);
      
      const userResponse = await axios.get('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(userResponse.data);
      
      toast.success('MFA configurado correctamente');
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error verificando MFA';
      throw new Error(message);
    }
  };

  const verifyMFA = async (username, mfa_code) => {
    try {
      const response = await axios.post('/api/admin/auth/verify-mfa', {
        username,
        mfa_code
      });
      
      // Save token and get user info
      const authToken = response.data.access_token;
      localStorage.setItem('admin_token', authToken);
      setToken(authToken);
      
      const userResponse = await axios.get('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(userResponse.data);
      
      toast.success('Sesión iniciada correctamente');
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error verificando MFA';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    toast.success('Sesión cerrada');
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/admin/auth/refresh');
      const newToken = response.data.access_token;
      localStorage.setItem('admin_token', newToken);
      setToken(newToken);
      return newToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setupMFA,
    verifyMFASetup,
    verifyMFA,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};