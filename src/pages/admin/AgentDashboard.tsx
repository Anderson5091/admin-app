import { useEffect, useRef, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Wallet, TrendingUp, RefreshCw, Clock, HandCoins, Loader2, Send, XCircle, Camera, Lock, ArrowDownFromLine, ArrowUpFromLine, ArrowLeftRight, Copy, Check, IdCard, AlertCircle } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import type { AgentDetail } from "../../features/admin/admin.types";

export default function AgentDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const { agentKpi, fetchAgentKpi } = useAdminStore();
  const [agentDetail, setAgentDetail] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpiPeriod, setKpiPeriod] = useState("DAILY");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<{ transferId: string; base64: string; mimeType: string; preview: string } | null>(null);
  const pendingTransferIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositFrom, setDepositFrom] = useState("bank");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [swapAmount, setSwapAmount] = useState("");
  const [swapDirection, setSwapDirection] = useState<"TO_LEDGER" | "TO_WALLET">("TO_LEDGER");
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [walletAddressCopied, setWalletAddressCopied] = useState(false);
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
    (t) => t.status === "SENT_TO_PARTNER" && t.processingAgentId === profile?.id
  );

  const cancelPayout = async (transferId: string) => {
    if (!profile?.id) return;
    setBusyId(transferId);
    try {
      await AgentApi.cancelPayout(profile.id, transferId);
      setPhotoData(null);
      loadDashboard();
    } catch {
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
    { label: "Balance", value: agentDetail?.ledgerBalance ?? "—", icon: Wallet, color: "text-warning bg-warning-dim", suffix: "USDT" },
    { label: "Wallet Balance", value: agentDetail?.walletBalance ?? "—", icon: Wallet, color: "text-primary bg-primary-dim", suffix: "USDT", isSub: true },
    { label: "Today Volume", value: agentDetail?.todayVolume ? `$${agentDetail.todayVolume.toLocaleString()}` : "$0", icon: TrendingUp, color: "text-secondary bg-secondary-dim", suffix: agentDetail?.todayTxCount ? `${agentDetail.todayTxCount} txs` : "" },
    { label: "Today Commission", value: agentDetail?.todayCommission ? `$${agentDetail.todayCommission.toLocaleString()}` : "$0", icon: HandCoins, color: "text-violet-400 bg-violet-900/30", suffix: "USDT" },
  ];

  const isPartner = profile?.role === "AGENT_PARTNER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Agent Dashboard</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Welcome back, {agentName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-text-subtle bg-card-alt px-2.5 py-1.5 rounded-lg">
            <IdCard size={12} />
            UUID: {profile?.id || "—"}
          </span>
          <button
            onClick={() => { if (profile?.id) { loadDashboard(); fetchAgentKpi(profile.id, kpiPeriod); } }}
            className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className={`p-3 sm:p-4 ${kpi.isSub ? "opacity-70" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${kpi.color} shrink-0`}>
                <kpi.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-bold text-text-primary truncate ${kpi.isSub ? "text-base sm:text-lg" : "text-lg sm:text-2xl"}`}>{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</p>
                </div>
                <p className="text-[10px] sm:text-xs text-text-secondary">{kpi.label}</p>
                {kpi.suffix && <p className="text-[9px] text-text-subtle">{kpi.suffix}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Wallets</h2>
          </div>
          {agentDetail?.wallets && agentDetail.wallets.length > 0 ? (
            <div className="space-y-3">
              {agentDetail.wallets.map((w) => (
                <div key={w.id} className="bg-card-alt rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple">{w.walletType}</Badge>
                      <span className="text-xs text-text-subtle">{w.network}</span>
                    </div>
                    <button
                      onClick={() => { if (w.address) { navigator.clipboard.writeText(w.address); setWalletAddressCopied(true); setTimeout(() => setWalletAddressCopied(false), 1500); } }}
                      className="flex items-center gap-1 text-[10px] text-text-subtle hover:text-primary transition-colors"
                    >
                      {walletAddressCopied ? <Check size={12} /> : <Copy size={12} />}
                      {w.address ? (walletAddressCopied ? "Copied" : w.address.slice(0, 10) + "..." + w.address.slice(-6)) : "N/A"}
                    </button>
                  </div>
                  <p className="text-lg font-bold text-text-primary mb-2">{w.balance.toLocaleString()} USDT</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="success" size="sm" onClick={() => setShowDepositModal(true)}>
                      <ArrowDownFromLine size={12} className="mr-1" /> Deposit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setShowWithdrawModal(true)}>
                      <ArrowUpFromLine size={12} className="mr-1" /> Withdraw
                    </Button>
                    {(isPartner || profile?.role === "AGENT_INTERNAL") && (
                      <Button variant="ghost" className="!text-warning !bg-warning-dim !border-warning/30 border" size="sm" onClick={() => setShowSwapModal(true)}>
                        <ArrowLeftRight size={12} className="mr-1" /> Swap
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-subtle text-sm py-8 text-center">No wallets assigned</p>
          )}
        </Card>

        {/* Deposit Modal */}
        <Modal open={showDepositModal} onClose={() => setShowDepositModal(false)} title="Deposit into Wallet">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Amount (USDT)</label>
              <input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Deposit from</label>
              <select
                value={depositFrom}
                onChange={(e) => setDepositFrom(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                <optgroup label="Off Ramp">
                  <option value="bank">Bank Account</option>
                </optgroup>
                <optgroup label="External Address">
                  <option value="BASE">BASE (USDT)</option>
                  <option value="ETHEREUM">Ethereum (USDT)</option>
                  <option value="POLYGON">Polygon (USDT)</option>
                  <option value="SOLANA">Solana (USDT)</option>
                </optgroup>
              </select>
            </div>
            {depositFrom !== "bank" && (
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Deposit Address</label>
                <div className="bg-card-alt border border-border rounded-lg p-3 text-center">
                  <p className="text-sm font-mono text-text-primary break-all">
                    {agentDetail?.wallets.find(w => w.network === depositFrom)?.address || "No address available"}
                  </p>
                  <button
                    onClick={() => {
                      const addr = agentDetail?.wallets.find(w => w.network === depositFrom)?.address;
                      if (addr) { navigator.clipboard.writeText(addr); setWalletAddressCopied(true); setTimeout(() => setWalletAddressCopied(false), 1500); }
                    }}
                    className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-colors mt-1"
                  >
                    <Copy size={12} /> Copy Address
                  </button>
                  <p className="text-[10px] text-text-subtle mt-1">Only send {depositFrom === "SOLANA" ? "USDT (SOL)" : "USDT"} to this address</p>
                </div>
              </div>
            )}
            {depositFrom === "bank" && (
                <p className="text-xs text-text-subtle">To deposit from your bank account, please use the Crossmint off-ramp integration to deposit fiat into this wallet.</p>
            )}
          </div>
        </Modal>

        {/* Withdraw Modal — sends from agent's Crossmint wallet to hot treasury */}
        <Modal open={showWithdrawModal} onClose={() => { setShowWithdrawModal(false); setWithdrawError(null); }} title="Withdraw from Wallet">
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">
              Send USDT from your Crossmint wallet to the platform hot treasury.
            </p>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Amount (USDT)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawError(null); }}
                  className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary pr-16"
                />
                {agentDetail?.wallets?.[0]?.balance ? (
                  <button
                    onClick={() => setWithdrawAmount(String(agentDetail.wallets[0].balance))}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary/80 font-semibold px-2 py-1 rounded"
                  >
                    Max
                  </button>
                ) : null}
              </div>
            </div>
            {withdrawError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm bg-danger/10 text-danger">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{withdrawError}</p>
              </div>
            )}
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
              onClick={async () => {
                if (!profile?.id) return;
                const amt = Number(withdrawAmount);
                if (amt <= 0) return;
                setWithdrawing(true);
                setWithdrawError(null);
                try {
                  await AgentApi.walletWithdraw(profile.id, amt);
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                  loadDashboard();
                } catch (err: any) {
                  setWithdrawError(err?.response?.data?.error || err?.message || "Withdrawal failed");
                } finally {
                  setWithdrawing(false);
                }
              }}
            >
              {withdrawing ? <Loader2 size={14} className="animate-spin mr-1" /> : <ArrowUpFromLine size={14} className="mr-1" />}
              {withdrawing ? "Processing..." : `Withdraw${withdrawAmount ? ` ${withdrawAmount}` : ""} USDT to Treasury`}
            </Button>
          </div>
        </Modal>

        {/* Swap Modal */}
        <Modal open={showSwapModal} onClose={() => { setShowSwapModal(false); setSwapDirection("TO_LEDGER"); setSwapError(null); setSwapSuccess(false); }} title="Swap Funds">
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">
              {swapDirection === "TO_LEDGER"
                ? "Swap funds from your wallet to your ledger balance."
                : "Swap funds from your ledger balance to your wallet."}
            </p>
            <div className="flex items-center justify-between bg-card-alt rounded-lg p-3">
              <div>
                <p className="text-xs text-text-secondary">{swapDirection === "TO_LEDGER" ? "Wallet Balance" : "Ledger Balance"}</p>
                <p className="text-lg font-bold text-text-primary">
                  {swapDirection === "TO_LEDGER"
                    ? ((agentDetail?.wallets && agentDetail.wallets[0]?.balance) || 0)
                    : (agentDetail?.ledgerBalance || 0)} USDT
                </p>
              </div>
              <button
                onClick={() => setSwapDirection((d) => d === "TO_LEDGER" ? "TO_WALLET" : "TO_LEDGER")}
                className="p-2 rounded-lg hover:bg-card-border transition-colors"
                title="Toggle swap direction"
              >
                <ArrowLeftRight size={20} className="text-primary" />
              </button>
              <div className="text-right opacity-60">
                <p className="text-xs text-text-secondary">{swapDirection === "TO_LEDGER" ? "Ledger Balance" : "Wallet Balance"}</p>
                <p className="text-lg font-bold text-text-primary">
                  {swapDirection === "TO_LEDGER"
                    ? (agentDetail?.ledgerBalance || 0)
                    : ((agentDetail?.wallets && agentDetail.wallets[0]?.balance) || 0)} USDT
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Amount (USDT)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary pr-16"
                />
                <button
                  onClick={() => {
                    const sourceBal = swapDirection === "TO_LEDGER"
                      ? (agentDetail?.wallets && agentDetail.wallets[0]?.balance) || 0
                      : agentDetail?.ledgerBalance || 0;
                    setSwapAmount(String(sourceBal));
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary/80 font-semibold px-2 py-1 rounded"
                >
                  Swap All
                </button>
              </div>
            </div>
            {swapError && (
              <div className="bg-danger-dim border border-danger/30 text-danger text-sm rounded-lg px-4 py-2.5 font-medium text-center">
                {swapError}
              </div>
            )}
            {swapSuccess && (
              <div className="bg-primary-dim border border-primary/30 text-primary text-sm rounded-lg px-4 py-2.5 font-medium text-center">
                Swap completed successfully!
              </div>
            )}
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              disabled={swapping || !swapAmount || Number(swapAmount) <= 0}
              onClick={async () => {
                if (!profile?.id) return;
                const amt = Number(swapAmount);
                if (amt <= 0) return;
                setSwapping(true);
                setSwapError(null);
                setSwapSuccess(false);
                try {
                  await AgentApi.swapFunds(profile.id, amt, swapDirection);
                  setSwapSuccess(true);
                  setTimeout(() => {
                    setShowSwapModal(false);
                    setSwapAmount("");
                    setSwapDirection("TO_LEDGER");
                    setSwapSuccess(false);
                    loadDashboard();
                  }, 1500);
                } catch (err: any) {
                  setSwapError(err?.response?.data?.error || err?.message || "Swap failed");
                } finally {
                  setSwapping(false);
                }
              }}
            >
              {swapping
                ? "Swapping..."
                : swapDirection === "TO_LEDGER"
                  ? `Swap${swapAmount ? ` ${swapAmount}` : ""} to Ledger`
                  : `Swap${swapAmount ? ` ${swapAmount}` : ""} to Wallet`}
            </Button>
          </div>
        </Modal>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">KPI Performance</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
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
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img src={photoData.preview} alt="Proof" className="w-20 h-20 object-cover rounded-lg border border-border" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-text-secondary">Proof photo captured</p>
              <p className="text-[10px] text-text-subtle font-mono">{photoData.transferId}</p>
            </div>
            <div className="flex gap-2">
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
          <>
            <div className="hidden sm:block overflow-x-auto">
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

            <div className="sm:hidden space-y-2">
              {lockedPayouts.map((t) => (
                <div key={t.id} className="bg-card-alt rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-text-subtle">{t.referenceId || "—"}</span>
                    <span className="text-sm font-bold text-text-primary">${t.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                    <Badge variant="info">{t.payoutMethod || "—"}</Badge>
                    <span className="text-text-secondary">{t.currency}</span>
                    <span className="text-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCameraClick(t.id)}
                      disabled={busyId === t.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-success bg-success-dim px-2 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {busyId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                      Proof
                    </button>
                    <button
                      onClick={() => cancelPayout(t.id)}
                      disabled={busyId === t.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-danger bg-danger-dim px-2 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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
                      <Badge variant={tx.type === "COMMISSION" ? "warning" : tx.type === "ADD_BALANCE" ? "success" : tx.type === "WITHDRAW" || tx.type === "PAYOUT" ? "danger" : "info"}>
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
