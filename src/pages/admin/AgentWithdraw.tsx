import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import {
  ArrowLeft, Send, DollarSign, Percent,
  Loader2, CheckCircle, AlertCircle, Search, User, Mail, Phone,
  Clock, ArrowRight,
} from "lucide-react";

type Step = "search" | "user" | "form";

interface RecentWithdrawal {
  id: string;
  amount: number;
  netAmount: number;
  commission: number;
  userRef: string;
  reference: string | null;
  metadata: any;
  user: { fullName: string | null; email: string; phone: string | null } | null;
  createdAt: string;
}

export default function AgentWithdraw() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const agentId = profile?.id || "";
  const { loading, result, withdraw } = useAgentStore();

  const [step, setStep] = useState<Step>("search");
  const [identifier, setIdentifier] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; fullName: string | null; phone: string | null } | null>(null);

  const [amount, setAmount] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("0");
  const [destinationType, setDestinationType] = useState<"OFFCHAIN" | "MAIN">("OFFCHAIN");

  const isPartner = profile?.role === "AGENT_PARTNER";

  const [recentWithdrawals, setRecentWithdrawals] = useState<RecentWithdrawal[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);

  const loadRecentWithdrawals = useCallback(async () => {
    if (!agentId) return;
    setWithdrawalsLoading(true);
    try {
      const data = await AgentApi.getRecentWithdrawals(agentId);
      setRecentWithdrawals(data);
    } catch {
    } finally {
      setWithdrawalsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadRecentWithdrawals();
  }, [loadRecentWithdrawals]);

  useEffect(() => {
    return () => { useAgentStore.getState().clearResult(); };
  }, []);

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
      setStep("user");
    } catch (err: any) {
      setLookupError(err?.response?.data?.error || err?.message || "User not found");
    } finally {
      setLookupLoading(false);
    }
  }, [identifier]);

  const handleSubmit = async () => {
    if (!foundUser || !amount) return;
    await withdraw(agentId, {
      userId: foundUser.id,
      amount: Number(amount),
      commissionPercent: Number(commissionPercent) || 0,
      destinationType,
    });
  };

  const canSubmit = foundUser && amount && Number(amount) > 0 && !loading;

  const handleDone = () => {
    setStep("search");
    setFoundUser(null);
    setAmount("");
    setCommissionPercent("0");
    useAgentStore.getState().clearResult();
    loadRecentWithdrawals();
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("user");
    } else if (step === "user") {
      setStep("search");
      setFoundUser(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      {step === "search" ? (
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Withdraw</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Give cash to user, debit their wallet, credit agent commission</p>
        </div>
      ) : step === "user" ? (
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Withdraw</h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Select user to continue</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Withdraw</h1>
              <ArrowRight size={20} className="text-warning" />
            </div>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Complete withdrawal for {foundUser?.fullName || foundUser?.email}</p>
          </div>
        </div>
      )}

      {/* Step 1: Search + Recent */}
      {step === "search" && (
        <>
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Search size={18} className="text-warning" />
              <h2 className="text-lg font-bold text-text-primary">Find User</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="flex-1 relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="Search by User ID, Email, or Phone"
                  className="w-full bg-card-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                  disabled={lookupLoading}
                />
              </div>
              <button
                onClick={handleLookup}
                disabled={lookupLoading || !identifier.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm bg-warning text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
          </Card>

          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Clock size={18} className="text-warning" />
              <h2 className="text-lg font-bold text-text-primary">Recent Withdrawals</h2>
            </div>

            {withdrawalsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin w-5 h-5 border-2 border-warning border-t-transparent rounded-full" />
              </div>
            ) : recentWithdrawals.length === 0 ? (
              <p className="text-text-subtle text-sm py-4 text-center">No withdrawals yet</p>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-text-subtle uppercase border-b border-border">
                        <th className="text-left py-2 pr-3">User</th>
                        <th className="text-right py-2 pr-3">Amount</th>
                        <th className="text-right py-2 pr-3">Commission</th>
                        <th className="text-right py-2 pr-3">Net</th>
                        <th className="text-right py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentWithdrawals.map((w) => (
                        <tr key={w.id} className="border-b border-border last:border-0">
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-warning-dim flex items-center justify-center shrink-0">
                                <User size={10} className="text-warning" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-text-primary truncate">{w.user?.fullName || w.user?.email || w.userRef?.slice(0, 8)}</p>
                                {w.user?.fullName && w.user?.email && (
                                  <p className="text-[9px] text-text-subtle truncate">{w.user.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-right text-text-primary font-bold">${w.amount.toLocaleString()}</td>
                          <td className="py-2 pr-3 text-right text-warning">${w.commission.toLocaleString()}</td>
                          <td className="py-2 pr-3 text-right text-text-primary">${w.netAmount.toLocaleString()}</td>
                          <td className="py-2 text-right text-text-subtle">{new Date(w.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden space-y-2">
                  {recentWithdrawals.map((w) => (
                    <div key={w.id} className="bg-card-alt rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-primary">{w.user?.fullName || w.user?.email || w.userRef?.slice(0, 8)}</span>
                        <span className="text-sm font-bold text-text-primary">${w.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span>Commission: <span className="text-warning">${w.commission.toLocaleString()}</span></span>
                        <span>Net: ${w.netAmount.toLocaleString()}</span>
                        <span className="ml-auto">{new Date(w.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </>
      )}

      {/* Step 2: User Found */}
      {step === "user" && foundUser && (
        <Card className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <User size={18} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">User Found</h2>
          </div>

          <button
            onClick={() => setStep("form")}
            className="w-full bg-card-alt rounded-lg p-4 border border-border hover:bg-card transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning-dim flex items-center justify-center shrink-0">
                <User size={18} className="text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{foundUser.fullName || "—"}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-text-secondary mt-0.5">
                  <span className="flex items-center gap-1"><Mail size={11} /> {foundUser.email}</span>
                  {foundUser.phone && <span className="flex items-center gap-1"><Phone size={11} /> {foundUser.phone}</span>}
                </div>
              </div>
              <span className="text-[10px] font-mono text-text-subtle hidden sm:block">{foundUser.id}</span>
            </div>
          </button>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-2 px-6 py-2.5 text-sm bg-warning text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Next Step
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Withdraw Form */}
      {step === "form" && foundUser && (
        <Card className="p-4 sm:p-6 space-y-5">
          {result?.success ? (
            <>
              <div className="flex flex-col items-center gap-4 py-6">
                <CheckCircle size={48} className="text-warning" />
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">Withdrawal Successful</p>
                  <p className="text-sm text-text-secondary mt-1">{result.message}</p>
                  {result.reference && <p className="text-[10px] text-text-subtle mt-1 font-mono">Ref: {result.reference}</p>}
                </div>
                <button
                  onClick={handleDone}
                  className="mt-4 px-8 py-2.5 text-sm bg-warning text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  OK
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 pb-4 border-b border-border">
                <Send size={18} className="text-warning" />
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-text-primary">Withdraw</h2>
                  <ArrowRight size={18} className="text-warning" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">
                  <DollarSign size={14} className="inline mr-1" />
                  USDT Amount *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                  disabled={loading}
                  min="0"
                />
                <p className="text-[10px] text-text-subtle mt-1">Amount to withdraw from user's wallet</p>
              </div>

              {isPartner && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-lg bg-card-alt border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-secondary">Destination:</span>
                    <span className={`text-sm font-medium ${destinationType === "OFFCHAIN" ? "text-warning" : "text-primary"}`}>
                      {destinationType === "OFFCHAIN" ? "Pending OffChain" : "Main Wallet"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={destinationType === "MAIN"}
                      onChange={(e) => setDestinationType(e.target.checked ? "MAIN" : "OFFCHAIN")}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-card rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              )}

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
                  className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary max-w-full sm:max-w-[200px]"
                  disabled={loading}
                  min="0"
                  max="100"
                />
              </div>

              {result && !result.success && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm bg-danger/10 text-danger">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p>{result.message}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full sm:w-auto px-6 py-2 text-sm bg-warning text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
