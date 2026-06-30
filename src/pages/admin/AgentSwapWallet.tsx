import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  ArrowLeft, ArrowRight, ArrowLeftRight, Wallet,
  Loader2, CheckCircle, AlertCircle, Clock,
  RefreshCw,
} from "lucide-react";
import type { AgentDetail } from "../../features/admin/admin.types";

export default function AgentSwapWallet() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const { loading, result, swapOffchain, clearResult } = useAgentStore();
  const [dashboard, setDashboard] = useState<AgentDetail | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [direction, setDirection] = useState<"TO_MAIN" | "TO_OFFCHAIN">("TO_MAIN");
  const [amount, setAmount] = useState("");

  const loadDashboard = async () => {
    if (!profile?.id) return;
    setDashLoading(true);
    try {
      const d = await AgentApi.getMyDashboard();
      setDashboard(d);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setDashLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [profile?.id]);

  useEffect(() => {
    if (result && result.success) {
      loadDashboard();
      setAmount("");
      const t = setTimeout(clearResult, 5000);
      return () => clearTimeout(t);
    }
  }, [result, clearResult]);

  const isPartner = profile?.role === "AGENT_PARTNER";
  if (!isPartner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-3 rounded-lg bg-warning-dim border border-warning/30 mb-4">
          <Wallet size={32} className="text-warning" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
        <p className="text-text-secondary text-sm mb-4 max-w-sm">
          Only partner agents can swap between offchain and main wallets.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] hover:opacity-90 text-white text-sm font-semibold transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const offchainBal = dashboard?.offchainLedgerBalance ?? 0;
  const mainBal = dashboard?.walletBalance ?? 0;
  const sourceLabel = direction === "TO_MAIN" ? "Offchain Wallet" : "Main Wallet";
  const destLabel = direction === "TO_MAIN" ? "Main Wallet" : "Offchain Wallet";
  const sourceBal = direction === "TO_MAIN" ? offchainBal : mainBal;
  const destBal = direction === "TO_MAIN" ? mainBal : offchainBal;
  const maxAmount = sourceBal;
  const canSubmit = !loading && Number(amount) > 0 && Number(amount) <= maxAmount;

  const swapTxs = dashboard?.transactions?.filter((t) => t.type === "OFFCHAIN_SWAP") ?? [];

  const handleSwap = () => {
    if (!profile?.id || !canSubmit) return;
    swapOffchain(profile.id, direction, Number(amount));
  };

  const handleSwapAll = () => {
    if (!profile?.id) return;
    setAmount(String(maxAmount));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Swap Wallet</h1>
            <p className="text-text-secondary text-sm mt-0.5">Transfer between offchain and main wallet</p>
          </div>
        </div>
        <button
          onClick={loadDashboard}
          disabled={dashLoading}
          className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
        >
          <RefreshCw size={14} className={dashLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {dashLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Direction Toggle */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => {
                setDirection(direction === "TO_MAIN" ? "TO_OFFCHAIN" : "TO_MAIN");
                setAmount("");
              }}
              className="flex items-center gap-3 px-5 py-2.5 bg-card-alt border border-border rounded-xl hover:bg-card transition-colors"
            >
              <span className={`text-sm font-medium ${direction === "TO_MAIN" ? "text-primary" : "text-text-secondary"}`}>
                Offchain
              </span>
              <ArrowLeftRight size={20} className="text-text-subtle" />
              <span className={`text-sm font-medium ${direction === "TO_OFFCHAIN" ? "text-primary" : "text-text-secondary"}`}>
                Main
              </span>
            </button>
          </div>

          {/* Wallet Cards */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className={`rounded-xl p-4 text-left border ${direction === "TO_MAIN" ? "bg-warning-dim border-warning/20" : "bg-primary-dim border-primary/20"}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-card-alt">
                  <Wallet size={16} className={direction === "TO_MAIN" ? "text-warning" : "text-primary"} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{sourceBal.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary">{sourceLabel}</p>
                  <p className="text-[9px] text-text-subtle">USDT — {direction === "TO_MAIN" ? "offchain ledger" : "on-chain"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight size={20} className="text-text-subtle" />
            </div>
            <div className={`rounded-xl p-4 text-left border ${direction === "TO_OFFCHAIN" ? "bg-warning-dim border-warning/20" : "bg-primary-dim border-primary/20"}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-card-alt">
                  <Wallet size={16} className={direction === "TO_OFFCHAIN" ? "text-warning" : "text-primary"} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{destBal.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary">{destLabel}</p>
                  <p className="text-[9px] text-text-subtle">USDT — {direction === "TO_OFFCHAIN" ? "offchain ledger" : "on-chain"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <ArrowLeftRight size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-text-primary">
                {direction === "TO_MAIN" ? "Offchain → Main" : "Main → Offchain"}
              </h2>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                Amount (USDT)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                  disabled={loading}
                  min="0"
                  max={maxAmount}
                />
                <button
                  onClick={handleSwapAll}
                  disabled={loading || maxAmount <= 0}
                  className="px-3 py-2.5 text-xs font-semibold bg-card-alt border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-card transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
              <p className="text-[10px] text-text-subtle mt-1">
                Available: {maxAmount.toLocaleString()} USDT
              </p>
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
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleSwap}
                disabled={!canSubmit}
                className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Processing..." : `Swap ${Number(amount) > 0 ? Number(amount).toLocaleString() : ""} USDT`}
              </button>
            </div>
          </Card>

          {/* Wallets List */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-primary" />
              <h2 className="text-lg font-bold text-text-primary">Wallets</h2>
            </div>
            {dashboard?.wallets && dashboard.wallets.length > 0 ? (
              <div className="space-y-3">
                {dashboard.wallets.map((w) => (
                  <div key={w.id} className="bg-card-alt rounded-lg p-4 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-dim">
                        <Wallet size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{w.walletType}</p>
                        <p className="text-[10px] text-text-subtle">{w.network}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{w.balance.toLocaleString()} USDT</p>
                  </div>
                ))}
                {/* Offchain ledger display */}
                <div className="bg-card-alt rounded-lg p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning-dim">
                      <Wallet size={16} className="text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Offchain Ledger</p>
                      <p className="text-[10px] text-text-subtle">ledger balance</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-warning">{offchainBal.toLocaleString()} USDT</p>
                </div>
              </div>
            ) : (
              <p className="text-text-subtle text-sm py-4 text-center">No wallets found</p>
            )}
          </Card>

          {/* Swap History */}
          {swapTxs.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-primary" />
                <h2 className="text-lg font-bold text-text-primary">Swap History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-subtle uppercase border-b border-border">
                      <th className="text-left py-2 pr-4">Direction</th>
                      <th className="text-right py-2 pr-4">Amount</th>
                      <th className="text-right py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swapTxs.slice(0, 20).map((tx) => {
                      const dir = tx.metadata?.direction;
                      return (
                        <tr key={tx.id} className="border-b border-border last:border-0">
                          <td className="py-2 pr-4">
                            <Badge variant={dir === "TO_MAIN" ? "success" : "info"}>
                              {dir === "TO_MAIN" ? "Offchain → Main" : "Main → Offchain"}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-right text-text-primary font-bold">
                            ${tx.amount.toLocaleString()}
                          </td>
                          <td className="py-2 text-right text-text-subtle">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
