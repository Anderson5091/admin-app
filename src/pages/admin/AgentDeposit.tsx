import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import {
  ArrowLeft, Wallet, DollarSign, Percent,
  Loader2, CheckCircle, AlertCircle, Search, User, Mail, Phone,
  Clock, ArrowRight,
} from "lucide-react";
import { CURRENCY_TOKEN } from "../../config/constants";

type Step = "search" | "user" | "form";

interface RecentDeposit {
  id: string;
  amount: number;
  netAmount: number;
  commission: number;
  userRef: string;
  reference: string | null;
  user: { fullName: string | null; email: string; phone: string | null } | null;
  createdAt: string;
}

export default function AgentDeposit() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const agentId = profile?.id || "";
  const { loading, result, deposit } = useAgentStore();

  const [step, setStep] = useState<Step>("search");
  const [identifier, setIdentifier] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; fullName: string | null; phone: string | null } | null>(null);

  const [fiatAmount, setFiatAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("0");

  const [recentDeposits, setRecentDeposits] = useState<RecentDeposit[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(true);

  const loadRecentDeposits = useCallback(async () => {
    if (!agentId) return;
    setDepositsLoading(true);
    try {
      const data = await AgentApi.getRecentDeposits(agentId);
      setRecentDeposits(data);
    } catch {
    } finally {
      setDepositsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadRecentDeposits();
  }, [loadRecentDeposits]);

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
    if (!foundUser || !usdtAmount || !fiatAmount) return;
    await deposit(agentId, {
      userId: foundUser.id,
      fiatAmount,
      usdtAmount: Number(usdtAmount),
      commissionPercent: Number(commissionPercent) || 0,
    });
  };

  const canSubmit = foundUser && usdtAmount && fiatAmount && Number(usdtAmount) > 0 && !loading;

  const handleDone = () => {
    setStep("search");
    setFoundUser(null);
    setFiatAmount("");
    setUsdtAmount("");
    setCommissionPercent("0");
    useAgentStore.getState().clearResult();
    loadRecentDeposits();
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
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Deposit</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Take cash from user, credit their wallet from agent treasury</p>
        </div>
      ) : step === "user" ? (
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Deposit</h1>
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
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Deposit</h1>
              <ArrowRight size={20} className="text-primary" />
            </div>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Complete deposit for {foundUser?.fullName || foundUser?.email}</p>
          </div>
        </div>
      )}

      {/* Step 1: Search + Recent */}
      {step === "search" && (
        <>
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Search size={18} className="text-primary" />
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
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
              <Clock size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-text-primary">Recent Deposits</h2>
            </div>

            {depositsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : recentDeposits.length === 0 ? (
              <p className="text-text-subtle text-sm py-4 text-center">No deposits yet</p>
            ) : (
              <>
                {/* Desktop Table */}
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
                      {recentDeposits.map((d) => (
                        <tr key={d.id} className="border-b border-border last:border-0">
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary-dim flex items-center justify-center shrink-0">
                                <User size={10} className="text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-text-primary truncate">{d.user?.fullName || d.user?.email || d.userRef?.slice(0, 8)}</p>
                                {d.user?.fullName && d.user?.email && (
                                  <p className="text-[9px] text-text-subtle truncate">{d.user.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-right text-text-primary font-bold">${d.amount.toLocaleString()}</td>
                          <td className="py-2 pr-3 text-right text-warning">${d.commission.toLocaleString()}</td>
                          <td className="py-2 pr-3 text-right text-text-primary">${d.netAmount.toLocaleString()}</td>
                          <td className="py-2 text-right text-text-subtle">{new Date(d.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-2">
                  {recentDeposits.map((d) => (
                    <div key={d.id} className="bg-card-alt rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-primary">{d.user?.fullName || d.user?.email || d.userRef?.slice(0, 8)}</span>
                        <span className="text-sm font-bold text-text-primary">${d.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span>Commission: <span className="text-warning">${d.commission.toLocaleString()}</span></span>
                        <span>Net: ${d.netAmount.toLocaleString()}</span>
                        <span className="ml-auto">{new Date(d.createdAt).toLocaleDateString()}</span>
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
            <User size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">User Found</h2>
          </div>

          <button
            onClick={() => setStep("form")}
            className="w-full bg-card-alt rounded-lg p-4 border border-border hover:bg-card transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center shrink-0">
                <User size={18} className="text-primary" />
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
              className="flex items-center gap-2 px-6 py-2.5 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Next Step
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Deposit Form */}
      {step === "form" && foundUser && (
        <Card className="p-4 sm:p-6 space-y-5">
          {result?.success ? (
            <>
              <div className="flex flex-col items-center gap-4 py-6">
                <CheckCircle size={48} className="text-primary" />
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">Deposit Successful</p>
                  <p className="text-sm text-text-secondary mt-1">{result.message}</p>
                  {result.reference && <p className="text-[10px] text-text-subtle mt-1 font-mono">Ref: {result.reference}</p>}
                </div>
                <button
                  onClick={handleDone}
                  className="mt-4 px-8 py-2.5 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  OK
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 pb-4 border-b border-border">
                <Wallet size={18} className="text-primary" />
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-text-primary">Deposit</h2>
                  <ArrowRight size={18} className="text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {`${CURRENCY_TOKEN} Amount *`}
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
                  <p className="text-[10px] text-text-subtle mt-1">{`${CURRENCY_TOKEN} to credit to user's wallet`}</p>
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
                  className="w-full sm:w-auto px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
