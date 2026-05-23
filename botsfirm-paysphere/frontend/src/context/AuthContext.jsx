// AuthContext.jsx
// Global authentication state for Botsfirm PaySphere.
//
// Design notes:
//   - JWT is held in module-local memory (`tokenRef`). Never localStorage.
//   - Axios instance attaches the token via an interceptor.
//   - On mount we call /api/auth/me to hydrate the user. If the token is
//     missing or expired, the call 401s and the user stays logged out.
//   - On 401 from any future request, we auto-logout.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';

const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.REACT_APP_API_URL ||
  'http://localhost:3002';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);

  const setToken = useCallback((next) => {
    tokenRef.current = next;
    setTokenState(next);
  }, []);

  // Attach Authorization on every request (read fresh ref each time).
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      if (tokenRef.current) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${tokenRef.current}`;
      }
      return config;
    });

    const resInterceptor = api.interceptors.response.use(
      (r) => r,
      (error) => {
        const status = error?.response?.status;
        const code = error?.response?.data?.code;
        if (status === 401 && tokenRef.current) {
          // Token rejected — clear state.
          tokenRef.current = null;
          setTokenState(null);
          setUser(null);
        }
        if (code === 'TOKEN_EXPIRED' || code === 'SESSION_EXPIRED') {
          tokenRef.current = null;
          setTokenState(null);
          setUser(null);
        }
        return Promise.reject(error);
      },
    );
    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Hydrate on first mount. Token is in memory only so the only way to be
  // logged in across reloads is to log in again — by design.
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials);
      tokenRef.current = data.token;
      setTokenState(data.token);
      setUser(data.user);
      return data;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      if (tokenRef.current) {
        await api.post('/auth/logout');
      }
    } catch {
      // ignore — we're logging out client-side regardless
    }
    tokenRef.current = null;
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!tokenRef.current) return null;
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data;
    } catch {
      return null;
    }
  }, []);

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (Array.isArray(role)) return role.includes(user.role);
      return user.role === role;
    },
    [user],
  );

  const hasTenant = useCallback(
    (tenantId) => {
      if (!user) return false;
      return user.tenant_id === tenantId;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      refreshUser,
      hasRole,
      hasTenant,
      api,
    }),
    [user, token, loading, login, logout, refreshUser, hasRole, hasTenant],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}

export { api };
export default AuthContext;
