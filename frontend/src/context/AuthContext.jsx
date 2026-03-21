import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { get, post, setTokens, clearTokens, getToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data, error } = await get('/auth/me');
    if (error) {
      clearTokens();
      setUser(null);
    } else {
      setUser(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data, error } = await post('/auth/login', { email, password });
    if (error) return { error };

    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    return { error: null };
  };

  const register = async (username, email, password) => {
    const { data, error } = await post('/auth/register', { username, email, password });
    if (error) return { error };

    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    return { error: null };
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin, isModerator }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
