import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) { setError("Invalid or missing reset token"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      await api.post("/admin/reset-password", { token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to reset password");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-app-page flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-dim text-primary font-bold text-2xl mb-3">✓</div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Password Reset</h1>
          <p className="text-text-secondary text-sm mb-4">Your password has been updated successfully. You can now log in with your new password.</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white font-bold text-2xl mb-3">Q</div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Reset Password</h1>
          <p className="mt-2 text-text-secondary text-sm">Choose a new password for your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-danger-dim border border-danger/30 text-danger text-sm rounded-lg px-4 py-2.5 font-medium">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-app-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-app-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
