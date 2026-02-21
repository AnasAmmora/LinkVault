import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import type { AuthResponse, MeResponse } from "../api/types";

type AuthState = {
  token: string | null;
  me: MeResponse | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("lv_token"));
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadMe() {
    if (!localStorage.getItem("lv_token")) {
      setMe(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setMe(data);
    } catch {
      localStorage.removeItem("lv_token");
      setToken(null);
      setMe(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onAuthSuccess(res: AuthResponse) {
    localStorage.setItem("lv_token", res.token);
    setToken(res.token);
    // me رح تنجلب من loadMe
  }

  const value = useMemo<AuthState>(() => ({
    token,
    me,
    isLoading,
    login: async (data) => onAuthSuccess(await authApi.login(data)),
    register: async (data) => onAuthSuccess(await authApi.register(data)),
    logout: () => {
      localStorage.removeItem("lv_token");
      setToken(null);
      setMe(null);
    },
  }), [token, me, isLoading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
