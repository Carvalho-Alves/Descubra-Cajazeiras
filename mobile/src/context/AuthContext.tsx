import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setApiToken } from '../services/apiClient';
import {
  AuthUser,
  getUserById,
  loginRequest,
  registerRequest,
  updateUserRequest,
} from '../services/authService';

const STORAGE_KEY = '@descubra/auth';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (input: {
    nome: string;
    email: string;
    senha: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    nome?: string;
    email?: string;
    senha?: string;
    fotoUri?: string | null;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persist(user: AuthUser, token: string) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}

async function clearPersist() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
          setUser(parsed.user);
          setToken(parsed.token);
          setApiToken(parsed.token);
        }
      } catch {
        await clearPersist();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applySession = useCallback(async (nextUser: AuthUser, nextToken: string) => {
    const safeUser = { ...nextUser };
    delete (safeUser as { senha?: string }).senha;
    setUser(safeUser);
    setToken(nextToken);
    setApiToken(nextToken);
    await persist(safeUser, nextToken);
  }, []);

  const login = useCallback(
    async (email: string, senha: string) => {
      const res = await loginRequest(email.trim().toLowerCase(), senha);
      await applySession(res.user, res.token);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: { nome: string; email: string; senha: string }) => {
      const res = await registerRequest({
        nome: input.nome.trim(),
        email: input.email.trim().toLowerCase(),
        senha: input.senha,
      });
      await applySession(res.user, res.token);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    setApiToken(null);
    await clearPersist();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user?._id || !token) return;
    const fresh = await getUserById(user._id, token);
    const safeUser = { ...fresh };
    delete (safeUser as { senha?: string }).senha;
    setUser(safeUser);
    await persist(safeUser, token);
  }, [user?._id, token]);

  const updateProfile = useCallback(
    async (data: {
      nome?: string;
      email?: string;
      senha?: string;
      fotoUri?: string | null;
    }) => {
      if (!user?._id) throw new Error('Usuário não autenticado.');
      const updated = await updateUserRequest(user._id, data, token);
      const safeUser = { ...updated };
      delete (safeUser as { senha?: string }).senha;
      setUser(safeUser);
      if (token) await persist(safeUser, token);
    },
    [user?._id, token],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }),
    [
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
