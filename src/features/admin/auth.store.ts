import { create } from "zustand";
import { api } from "../../api/client";
import { getToken, setToken, clearToken, setRefreshToken, clearRefreshToken } from "../../utils/token";
import type { AdminProfile, AdminRole } from "./admin.types";

function mapAgentTypeToRole(type: string): AdminRole {
  return type === "PARTNER" ? "AGENT_PARTNER" : "AGENT_INTERNAL";
}

interface AuthState {
  profile: AdminProfile | null;
  loading: boolean;
  error: string;
  isAuthenticated: boolean;
  sessionExpired: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setSessionExpired: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: false,
  error: "",
  isAuthenticated: !!getToken(),
  sessionExpired: false,

  login: async (email: string, password: string) => {
    set({ loading: true, error: "", sessionExpired: false });
    try {
      const { data } = await api.post("/admin/auth/login", { email, password });
      setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      set({ profile: data.user, isAuthenticated: true, loading: false });
      return true;
    } catch {
      try {
        const { data } = await api.post("/agent/auth/login", { email, password });
        setToken(data.token);
        clearRefreshToken();
        set({
          profile: {
            id: data.user.id,
            email: data.user.email,
            role: mapAgentTypeToRole(data.user.type),
            status: "ACTIVE",
            createdAt: "",
          },
          isAuthenticated: true,
          loading: false,
        });
        return true;
      } catch (err: any) {
        const message = err?.response?.data?.error || err?.message || "Login failed";
        set({ loading: false, error: message });
        return false;
      }
    }
  },

  logout: () => {
    clearToken();
    clearRefreshToken();
    set({ profile: null, isAuthenticated: false, sessionExpired: false });
  },

  setSessionExpired: (value: boolean) => {
    set({ sessionExpired: value });
  },

  fetchProfile: async () => {
    const token = getToken();
    if (!token) return;
    try {
      const { data } = await api.get("/admin/auth/me");
      set({ profile: data, isAuthenticated: true });
      return;
    } catch {
      /* try agent */
    }
    try {
      const { data } = await api.get("/agent/auth/me");
      set({
        profile: {
          id: data.id,
          email: data.email,
          role: mapAgentTypeToRole(data.type),
          status: data.status || "ACTIVE",
          createdAt: data.createdAt || "",
        },
        isAuthenticated: true,
      });
    } catch {
      clearToken();
      clearRefreshToken();
      set({ profile: null, isAuthenticated: false });
    }
  },
}));
