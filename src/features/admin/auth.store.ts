import { create } from "zustand";
import { api } from "../../api/client";
import { getToken, setToken, clearToken } from "../../utils/token";
import type { AdminRole, AdminProfile } from "./admin.types";

const USE_ADMIN_MOCK = false;

const mockAdmins: Record<string, { password: string; profile: AdminProfile }> = {
  "admin@quicksend.com": {
    password: "admin123",
    profile: { id: "admin_1", email: "admin@quicksend.com", role: "SUPER_ADMIN", status: "ACTIVE", createdAt: new Date().toISOString() },
  },
  "compliance@quicksend.com": {
    password: "compliance123",
    profile: { id: "admin_2", email: "compliance@quicksend.com", role: "COMPLIANCE", status: "ACTIVE", createdAt: new Date().toISOString() },
  },
  "ops@quicksend.com": {
    password: "ops123",
    profile: { id: "admin_3", email: "ops@quicksend.com", role: "OPS", status: "ACTIVE", createdAt: new Date().toISOString() },
  },
  "treasury@quicksend.com": {
    password: "treasury123",
    profile: { id: "admin_4", email: "treasury@quicksend.com", role: "TREASURY", status: "ACTIVE", createdAt: new Date().toISOString() },
  },
};

interface AuthState {
  profile: AdminProfile | null;
  loading: boolean;
  error: string;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: false,
  error: "",
  isAuthenticated: !!getToken(),

  login: async (email: string, password: string) => {
    set({ loading: true, error: "" });
    try {
      if (USE_ADMIN_MOCK) {
        const mock = mockAdmins[email];
        if (!mock || mock.password !== password) {
          set({ loading: false, error: "Invalid credentials" });
          return false;
        }
        setToken("admin-mock-token-" + mock.profile.role.toLowerCase());
        set({ profile: mock.profile, isAuthenticated: true, loading: false });
        return true;
      }

      const { data } = await api.post("/admin/auth/login", { email, password });
      setToken(data.token);
      set({ profile: data.user, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Login failed";
      set({ loading: false, error: message });
      return false;
    }
  },

  logout: () => {
    clearToken();
    set({ profile: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    const token = getToken();
    if (!token) return;
    try {
      if (USE_ADMIN_MOCK) {
        const roleMatch = token.match(/admin-mock-token-(.+)/);
        const role = (roleMatch?.[1]?.toUpperCase() || "SUPER_ADMIN") as AdminRole;
        set({ profile: { id: "admin_1", email: "admin@quicksend.com", role, status: "ACTIVE", createdAt: new Date().toISOString() } });
        return;
      }
      const { data } = await api.get("/admin/auth/me");
      set({ profile: data, isAuthenticated: true });
    } catch {
      clearToken();
      set({ profile: null, isAuthenticated: false });
    }
  },
}));
