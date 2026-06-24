import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ApiError,
  AuthApi,
  setAuthToken,
  setUnauthorizedHandler,
  Storage,
  type ApiUser,
  type AuthPayload,
  type LoginInput,
  type OtpVerifyInput,
  type RegisterInput,
  type Role,
} from '../api';
import { Env } from '../config/env';

type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated';

/**
 * The mobile app is built for students, teachers and parents only. School
 * admins and super-admins have their full tooling on the web, so they are not
 * allowed to hold a session in the app.
 */
const isMobileRole = (role?: Role | null): boolean =>
  role === 'student' || role === 'teacher' || role === 'parent';

const WEB_ONLY_MESSAGE =
  'This app is for students, teachers and parents. School admins manage Bodhira.ai on the web at bodhira.ai/login.';

interface AuthContextValue {
  status: AuthStatus;
  user: ApiUser | null;
  token: string | null;
  role: Role | null;
  /** True for B2C students (no school) — drives paywall/billing surfaces. */
  isB2C: boolean;

  login(input: LoginInput): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  otpSend(phone: string): Promise<{ phone: string; otp?: string }>;
  otpVerify(input: OtpVerifyInput): Promise<void>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  /** Re-fetch `/auth/me` (e.g. after a 403 that suggests stale role state). */
  refresh(): Promise<void>;
  /** Patch the in-memory user (e.g. after editing the profile). */
  setUser(user: ApiUser): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Commit a fresh auth payload to memory, the client, and persistent storage. */
  const applySession = useCallback(async (payload: AuthPayload) => {
    setAuthToken(payload.token);
    await Storage.setToken(payload.token);
    await Storage.setUser(payload.user);
    if (!mounted.current) return;
    setTokenState(payload.token);
    setUserState(payload.user);
    setStatus('authenticated');
  }, []);

  /** Commit a session only if the role is allowed on mobile; otherwise reject
   *  with a friendly message (and never persist an admin/super-admin session). */
  const commitIfAllowed = useCallback(
    async (payload: AuthPayload) => {
      if (!isMobileRole(payload.user?.role)) {
        throw new ApiError(WEB_ONLY_MESSAGE, { status: 403, kind: 'forbidden', code: 'web_only_role' });
      }
      await applySession(payload);
    },
    [applySession],
  );

  /** Tear down the session everywhere. */
  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await Storage.clear();
    if (!mounted.current) return;
    setTokenState(null);
    setUserState(null);
    setStatus('unauthenticated');
  }, []);

  // A 401 mid-session means the token died server-side: clear locally only.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Cold start: restore the token, then verify it against /auth/me.
  useEffect(() => {
    (async () => {
      const stored = await Storage.getToken();
      if (!stored) {
        if (mounted.current) setStatus('unauthenticated');
        return;
      }
      setAuthToken(stored);
      // Render instantly from the cached user while we revalidate (mobile roles only).
      const cached = await Storage.getUser<ApiUser>();
      if (cached && isMobileRole(cached.role) && mounted.current) {
        setTokenState(stored);
        setUserState(cached);
      }
      try {
        const fresh = await AuthApi.me();
        if (!mounted.current) return;
        // A web-only role (admin/super-admin) must not hold a mobile session.
        if (!isMobileRole(fresh.role)) {
          await clearSession();
          return;
        }
        setTokenState(stored);
        setUserState(fresh);
        await Storage.setUser(fresh);
        setStatus('authenticated');
      } catch {
        // Invalid/expired token (or the 401 handler already cleared it).
        await clearSession();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const payload = await AuthApi.login({ device: Env.device, ...input });
      await commitIfAllowed(payload);
    },
    [commitIfAllowed],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const payload = await AuthApi.register(input);
      await commitIfAllowed(payload);
    },
    [commitIfAllowed],
  );

  const otpSend = useCallback((phone: string) => AuthApi.otpSend(phone), []);

  const otpVerify = useCallback(
    async (input: OtpVerifyInput) => {
      const payload = await AuthApi.otpVerify({ device: Env.device, ...input });
      await commitIfAllowed(payload);
    },
    [commitIfAllowed],
  );

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch {
      // Token may already be dead — clearing locally is enough.
    }
    await clearSession();
  }, [clearSession]);

  const logoutAll = useCallback(async () => {
    try {
      await AuthApi.logoutAll();
    } catch {
      /* ignore */
    }
    await clearSession();
  }, [clearSession]);

  const refresh = useCallback(async () => {
    const fresh = await AuthApi.me();
    if (!mounted.current) return;
    setUserState(fresh);
    await Storage.setUser(fresh);
  }, []);

  const setUser = useCallback((next: ApiUser) => {
    setUserState(next);
    void Storage.setUser(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      role: user?.role ?? null,
      isB2C: !!user && user.school === null && user.role === 'student',
      login,
      register,
      otpSend,
      otpVerify,
      logout,
      logoutAll,
      refresh,
      setUser,
    }),
    [status, user, token, login, register, otpSend, otpVerify, logout, logoutAll, refresh, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>.');
  return ctx;
}
