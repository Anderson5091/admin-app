import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  ArrowLeft, ArrowLeftRight, Wallet,
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
  const mainWallet = dashboard?.wallets?.find((w) => w.walletType === "MAIN");
  const balanceTooLow = offchainBal < 10;
  const swapTxs = dashboard?.transactions?.filter((t) => t.type === "OFFCHAIN_SWAP") ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Swap Wallet</h1>
            <p className="text-text-secondary text-sm mt-0.5">Move pending offchain funds to your treasury wallet</p>
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
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="bg-warning-dim border border-warning/20 rounded-xl p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning-dim">
                  <Wallet size={16} className="text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{offchainBal.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary">Pending OffChain</p>
                  <p className="text-[9px] text-text-subtle">USDT — offchain ledger</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ArrowLeftRight size={20} className="text-text-subtle" />
            </div>
            <div className="bg-primary-dim border border-primary/20 rounded-xl p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-dim">
                  <Wallet size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{mainBal.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary">Main Wallet</p>
                  <p className="text-[9px] text-text-subtle">{mainWallet?.network || "BASE"} — on-chain</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <ArrowLeftRight size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-text-primary">Swap Pending OffChain</h2>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-card-alt">
              <span className="text-sm text-text-secondary">Available to swap</span>
              <span className="text-lg font-bold text-primary">{offchainBal.toLocaleString()} USDT</span>
            </div>

            {balanceTooLow && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm bg-warning/10 text-warning">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>Minimum swap is 10 USDT. Add more pending funds before swapping.</p>
              </div>
            )}

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
                onClick={() => profile?.id && swapOffchain(profile.id, "TO_MAIN", offchainBal)}
                disabled={loading || balanceTooLow}
                className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Processing..." : `Swap All (${offchainBal} USDT)`}
              </button>
            </div>
          </Card>

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
                      <th className="text-left py-2 pr-4">Type</th>
                      <th className="text-right py-2 pr-4">Amount</th>
                      <th className="text-right py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swapTxs.slice(0, 20).map((tx) => (
                      <tr key={tx.id} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4">
                          <Badge variant="info">Swapped</Badge>
                        </td>
                        <td className="py-2 pr-4 text-right text-text-primary font-bold">
                          -${tx.amount.toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-text-subtle">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
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
