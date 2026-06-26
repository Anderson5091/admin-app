import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Wallet, TrendingUp, RefreshCw, Clock, HandCoins, Loader2, Send, XCircle, Camera, Lock } from "lucide-react";
import type { AgentDetail } from "../../features/admin/admin.types";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const { agentKpi, fetchAgentKpi } = useAdminStore();
  const [agentDetail, setAgentDetail] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpiPeriod, setKpiPeriod] = useState("DAILY");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<{ transferId: string; base64: string; mimeType: string; preview: string } | null>(null);
  const pendingTransferIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadDashboard = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const [detail] = await Promise.all([
        AgentApi.getMyDashboard(),
      ]);
      setAgentDetail(detail);
    } catch (err) {
      console.error("Failed to load agent dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const lockedPayouts = (agentDetail?.pendingTransfers || []).filter(
    (t) => t.status === "PROCESSING" && t.processingAgentId === profile?.id
  );

  const cancelPayout = async (transferId: string) => {
    if (!profile?.id) return;
    setBusyId(transferId);
    try {
      await AgentApi.cancelPayout(profile.id, transferId);
      setPhotoData(null);
      loadDashboard();
    } catch {
      // handled by api
    } finally {
      setBusyId(null);
    }
  };

  const handleCameraClick = (transferId: string) => {
    pendingTransferIdRef.current = transferId;
    setPhotoData(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      const tid = pendingTransferIdRef.current || (lockedPayouts.length > 0 ? lockedPayouts[0].id : null);
      if (tid) {
        setPhotoData({ transferId: tid, base64, mimeType: file.type || "image/jpeg", preview: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const submitPhoto = async () => {
    if (!photoData || !profile?.id) return;
    setBusyId(photoData.transferId);
    try {
      await AgentApi.confirmPayout(profile.id, photoData.transferId, photoData.base64, photoData.mimeType);
      setPhotoData(null);
      loadDashboard();
    } catch {
      // handled by api
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      loadDashboard();
      fetchAgentKpi(profile.id, kpiPeriod);
    }
  }, [profile?.id, kpiPeriod, fetchAgentKpi]);

  const isAgent = profile?.role === "AGENT_PARTNER" || profile?.role === "AGENT_INTERNAL";
  if (!isAgent) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const agentName = agentDetail?.fullName || profile?.email || "Agent";

  const kpiCards = [
    { label: "Wallet", value: agentDetail?.walletBalance ?? "—", icon: Wallet, color: "text-primary bg-primary-dim", suffix: "USDT" },
    { label: "Commission", value: agentDetail?.commissionLedgerBalance ?? "—", icon: Wallet, color: "text-warning bg-warning-dim", suffix: "USDT", isCommission: true },
    { label: "Today Volume", value: agentDetail?.todayVolume ? `$${agentDetail.todayVolume.toLocaleString()}` : "$0", icon: TrendingUp, color: "text-secondary bg-secondary-dim", suffix: agentDetail?.todayTxCount ? `${agentDetail.todayTxCount} txs` : "" },
    { label: "Today Commission", value: agentDetail?.todayCommission ? `$${agentDetail.todayCommission.toLocaleString()}` : "$0", icon: HandCoins, color: "text-violet-400 bg-violet-900/30", suffix: "USDT" },
  ];

  const goToCommission = () => navigate("/agent/commission");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Agent Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back, {agentName}</p>
        </div>
        <button
          onClick={() => { if (profile?.id) { loadDashboard(); fetchAgentKpi(profile.id, kpiPeriod); } }}
          className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${kpi.color} shrink-0`}>
                <kpi.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-2xl font-bold text-text-primary truncate">{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</p>
                  {kpi.isCommission && (
                    <button
                      onClick={goToCommission}
                      className="shrink-0 text-xs font-semibold text-warning bg-warning-dim px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{kpi.label}</p>
                {kpi.suffix && <p className="text-[9px] text-text-subtle">{kpi.suffix}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">KPI Performance</h2>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-text-secondary">Period:</span>
            {["DAILY", "WEEKLY", "MONTHLY"].map((p) => (
              <button
                key={p}
                onClick={() => setKpiPeriod(p)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  kpiPeriod === p ? "bg-primary-dim text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {agentKpi.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-subtle uppercase border-b border-border">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-right py-2 pr-4">Volume</th>
                    <th className="text-right py-2 pr-4">Commission</th>
                    <th className="text-right py-2 pr-4">TX</th>
                    <th className="text-right py-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {agentKpi.slice(0, 10).map((kpi) => (
                    <tr key={kpi.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-text-primary">{new Date(kpi.periodStart).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 text-right text-text-primary">${kpi.totalVolume.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-warning">${kpi.totalCommission.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-text-secondary">{kpi.totalTxCount}</td>
                      <td className="py-2 text-right">
                        <span className={`font-semibold ${kpi.rating && kpi.rating >= 70 ? "text-primary" : kpi.rating && kpi.rating >= 50 ? "text-warning" : "text-danger"}`}>
                          {kpi.rating ?? "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-subtle text-sm py-8 text-center">No KPI data yet</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Wallets</h2>
          </div>
          {agentDetail?.wallets && agentDetail.wallets.length > 0 ? (
            <div className="space-y-3">
              {agentDetail.wallets.map((w) => (
                <div key={w.id} className="bg-card-alt rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="purple">{w.walletType}</Badge>
                    <span className="text-[10px] text-text-subtle">{w.network}</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{w.balance.toLocaleString()} USDT</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-subtle text-sm py-8 text-center">No wallets assigned</p>
          )}
        </Card>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {photoData && (
        <Card>
          <div className="flex items-center gap-4">
            <img src={photoData.preview} alt="Proof" className="w-20 h-20 object-cover rounded-lg border border-border" />
            <div className="flex-1">
              <p className="text-xs text-text-secondary">Proof photo captured</p>
              <p className="text-[10px] text-text-subtle font-mono">{photoData.transferId}</p>
            </div>
            <button
              onClick={submitPhoto}
              disabled={busyId === photoData.transferId}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-success px-3 py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {busyId === photoData.transferId ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {busyId === photoData.transferId ? "Submitting..." : "Submit Proof"}
            </button>
            <button
              onClick={() => setPhotoData(null)}
              disabled={busyId === photoData.transferId}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-card px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
            >
              <XCircle size={14} />
              Discard
            </button>
          </div>
        </Card>
      )}

      {lockedPayouts.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">Pending Payouts</h2>
            <Badge variant="warning">{lockedPayouts.length} locked</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-2 pr-4">Reference</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Method</th>
                  <th className="text-left py-2 pr-4">Currency</th>
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {lockedPayouts.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-text-subtle font-mono text-[10px]">{t.referenceId || "—"}</td>
                    <td className="py-2 pr-4 text-text-primary font-bold">${t.amount.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="info">{t.payoutMethod || "—"}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-text-secondary">{t.currency}</td>
                    <td className="py-2 pr-4 text-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center gap-1.5 ml-auto justify-end">
                        <button
                          onClick={() => handleCameraClick(t.id)}
                          disabled={busyId === t.id}
                          className="flex items-center gap-1 text-xs font-semibold text-success bg-success-dim px-2 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {busyId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                          Proof
                        </button>
                        <button
                          onClick={() => cancelPayout(t.id)}
                          disabled={busyId === t.id}
                          className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger-dim px-2 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {agentDetail?.transactions && agentDetail.transactions.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-right py-2 pr-4">Amount</th>
                  <th className="text-right py-2 pr-4">Commission</th>
                  <th className="text-right py-2 pr-4">Net</th>
                  <th className="text-right py-2 pr-4">User</th>
                  <th className="text-right py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {agentDetail.transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4">
                      <Badge variant={tx.type === "COMMISSION" ? "warning" : tx.type === "ADD_BALANCE" ? "success" : tx.type === "WITHDRAW" ? "danger" : "info"}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right text-text-primary">${tx.amount.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right text-warning">${tx.commission.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right text-text-primary">${tx.netAmount.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right text-text-secondary">{tx.userRef?.slice(0, 8) || "—"}</td>
                    <td className="py-2 text-right text-text-subtle">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}