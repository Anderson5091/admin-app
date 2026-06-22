import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/admin/auth.store";

const demoAccounts = [
  { email: "admin@quicksend.com", password: "admin123", role: "SUPER_ADMIN" },
  { email: "compliance@quicksend.com", password: "compliance123", role: "COMPLIANCE" },
  { email: "ops@quicksend.com", password: "ops123", role: "OPS" },
  { email: "treasury@quicksend.com", password: "treasury123", role: "TREASURY" },
  { email: "partner@quicksend.com", password: "partner123", role: "AGENT_PARTNER" },
  { email: "internal@quicksend.com", password: "internal123", role: "AGENT_INTERNAL" },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "text-purple-400 bg-purple-900/30 border-purple-700/30",
  COMPLIANCE: "text-blue-400 bg-blue-900/30 border-blue-700/30",
  OPS: "text-warning bg-warning-dim border-warning/30",
  TREASURY: "text-primary bg-primary-dim border-primary-border",
  AGENT_PARTNER: "text-violet-400 bg-violet-900/30 border-violet-700/30",
  AGENT_INTERNAL: "text-emerald-400 bg-emerald-900/30 border-emerald-700/30",
};

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await login(email, password);
    if (success) navigate("/");
  };

  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-app-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white font-bold text-2xl mb-3">
            Q
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">QuickSend Admin</h1>
          <p className="mt-2 text-text-secondary text-sm">Control Tower</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-danger-dim border border-danger/30 text-danger text-sm rounded-lg px-4 py-2.5 font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@quicksend.com"
              className="w-full px-4 py-2.5 rounded-lg bg-app-page border border-border text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-app-page border border-border text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="pt-2 border-t border-border">
            <p className="text-[10px] text-text-subtle uppercase tracking-wider mb-2 text-center">Demo Accounts</p>
            <div className="space-y-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${roleColors[acc.role]} hover:opacity-80`}
                >
                  <span className="font-semibold">{acc.role}</span>
                  <span className="ml-2 opacity-70">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
