import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { setUnauthorizedHandler, tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (!tokenStore.get()) return;
    authService
      .getMe()
      .then(setUser)
      .catch(() => {}) // a 401 clears the token in the Axios interceptor; network errors keep it
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (payload) => setUser(await authService.login(payload)), []);
  const register = useCallback(async (payload) => setUser(await authService.register(payload)), []);
  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    setUser(null);
  }, []);
  const updateProfile = useCallback(async (payload) => {
    const updated = await authService.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
