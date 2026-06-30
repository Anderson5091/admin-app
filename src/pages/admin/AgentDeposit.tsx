import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import {
  ArrowLeft, Wallet, DollarSign, Percent,
  Loader2, CheckCircle, AlertCircle, Search, User, Mail, Phone,
  ArrowRight,
} from "lucide-react";

export default function AgentDeposit() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const agentId = profile?.id || "";
  const { loading, result, deposit } = useAgentStore();

  const [identifier, setIdentifier] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; fullName: string | null; phone: string | null } | null>(null);

  const [fiatAmount, setFiatAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("0");

  const [showForm, setShowForm] = useState(false);

  const handleLookup = useCallback(async () => {
    if (!identifier.trim()) return;
    setLookupLoading(true);
    setLookupError("");
    setFoundUser(null);
    try {
      const user = await AgentApi.lookupUser(identifier.trim());
      if (!user) {
        setLookupError("User not found");
        return;
      }
      setFoundUser(user);
      setShowForm(false);
    } catch (err: any) {
      setLookupError(err?.response?.data?.error || err?.message || "User not found");
    } finally {
      setLookupLoading(false);
    }
  }, [identifier]);

  const handleSubmit = async () => {
    if (!foundUser || !usdtAmount || !fiatAmount) return;
    await deposit(agentId, {
      userId: foundUser.id,
      fiatAmount,
      usdtAmount: Number(usdtAmount),
      commissionPercent: Number(commissionPercent) || 0,
    });
  };

  const canSubmit = foundUser && usdtAmount && fiatAmount && Number(usdtAmount) > 0 && !loading;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Cash Deposit</h1>
          <p className="text-text-secondary text-sm mt-0.5">Take cash from user, credit their wallet from agent treasury</p>
        </div>
      </div>

      {/* Search User Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Search size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Find User</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="Search by User ID, Email, or Phone Number"
              className="w-full bg-card-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
              disabled={lookupLoading}
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={lookupLoading || !identifier.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {lookupLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {lookupLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {lookupError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm bg-danger/10 text-danger">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{lookupError}</p>
          </div>
        )}

        {foundUser && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-card-alt rounded-lg p-4 border border-border space-y-2 hover:bg-card transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold">User Found</p>
              <ArrowRight size={16} className="text-primary" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{foundUser.fullName || "—"}</p>
                <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-0.5">
                  <span className="flex items-center gap-1"><Mail size={11} /> {foundUser.email}</span>
                  {foundUser.phone && <span className="flex items-center gap-1"><Phone size={11} /> {foundUser.phone}</span>}
                </div>
              </div>
              <span className="text-[10px] font-mono text-text-subtle">{foundUser.id}</span>
            </div>
          </button>
        )}
      </Card>

      {/* Deposit Card */}
      {foundUser && showForm && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Wallet size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Deposit for {foundUser.fullName || foundUser.email}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                <DollarSign size={14} className="inline mr-1" />
                Fiat Amount Received *
              </label>
              <input
                type="number"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                disabled={loading}
                min="0"
              />
              <p className="text-[10px] text-text-subtle mt-1">Cash amount taken from user (local currency)</p>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                <DollarSign size={14} className="inline mr-1" />
                USDT Amount *
              </label>
              <input
                type="number"
                value={usdtAmount}
                onChange={(e) => setUsdtAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                disabled={loading}
                min="0"
              />
              <p className="text-[10px] text-text-subtle mt-1">USDT to credit to user's wallet</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              <Percent size={14} className="inline mr-1" />
              Commission %
            </label>
            <input
              type="number"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(e.target.value)}
              placeholder="0"
              className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary max-w-[200px]"
              disabled={loading}
              min="0"
              max="100"
            />
          </div>

          {result && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${
              result.success ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
            }`}>
              {result.success ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              <div>
                <p>{result.message}</p>
                {result.reference && <p className="text-[10px] mt-1 opacity-70">Ref: {result.reference}</p>}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Processing..." : "Confirm Deposit"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
