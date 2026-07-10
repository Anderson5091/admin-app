import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import { Wallet, ArrowUpDown, AlertTriangle, RefreshCw, Thermometer, Database, Shield, Copy, Landmark, ArrowRightFromLine, ArrowLeftToLine, Plus, Trash2, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

const walletTypeColors: Record<string, string> = {
  HOT: "text-danger bg-danger-dim border-danger/30",
  WARM: "text-warning bg-warning-dim border-warning/30",
  COLD: "text-secondary bg-secondary-dim border-secondary/30",
};

const walletTypeBg: Record<string, string> = {
  HOT: "bg-danger-dim border-l-danger",
  WARM: "bg-warning-dim border-l-warning",
  COLD: "bg-secondary-dim border-l-secondary",
};

const walletTypeBtn: Record<string, { active: string; inactive: string }> = {
  HOT: { active: "bg-danger text-white border-danger", inactive: "bg-card-alt text-text-secondary border-border hover:border-danger/50 hover:text-danger" },
  WARM: { active: "bg-warning text-white border-warning", inactive: "bg-card-alt text-text-secondary border-border hover:border-warning/50 hover:text-warning" },
  COLD: { active: "bg-secondary text-white border-secondary", inactive: "bg-card-alt text-text-secondary border-border hover:border-secondary/50 hover:text-secondary" },
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-warning-dim text-warning border-warning/30",
  AWAITING_PAYMENT: "bg-warning-dim text-warning border-warning/30",
  PROCESSING: "bg-primary-dim text-primary border-primary/30",
  COMPLETED: "bg-success-dim text-success border-success/30",
  FAILED: "bg-danger-dim text-danger border-danger/30",
};

export default function Treasury() {
  const {
    treasuryOverview, treasuryLoading, treasuryError, rebalanceMessage,
    fetchTreasuryOverview, triggerRebalance,
    treasuryOnrampInfo, treasuryBankAccounts,
    treasuryOfframpOrders, treasuryOnrampTransfers,
    treasuryRampLoading, treasuryRampMessage,
    treasuryCardDepositResult, cardDepositLoading,
    clearTreasuryError,
    initTreasuryWallets,
    fetchTreasuryOnrampInfo, fetchTreasuryBankAccounts,
    fetchTreasuryOfframpOrders, fetchTreasuryOnrampTransfers,
    createTreasuryOfframpOrder, executeTreasuryOfframpOrder,
    createTreasuryOnrampTransfer,
    createTreasuryCardDeposit,
    createTreasuryBankAccount, removeTreasuryBankAccount,
    clearTreasuryRampMessage,
  } = useAdminStore();

  const [offrampChain, setOfframpChain] = useState("");
  const [offrampAmount, setOfframpAmount] = useState("");
  const [onrampChain, setOnrampChain] = useState("");
  const [onrampAmount, setOnrampAmount] = useState("");
  const [onrampMemo, setOnrampMemo] = useState("");
  const [cardChain, setCardChain] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [cardEmail, setCardEmail] = useState("");
  const [cardDestType, setCardDestType] = useState("HOT");
  const [onrampDestType, setOnrampDestType] = useState("HOT");
  const [offrampSourceType, setOfframpSourceType] = useState("HOT");
  const [bankName, setBankName] = useState("");
  const [pmId, setPmId] = useState("");
  const [acctSuffix, setAcctSuffix] = useState("");

  useEffect(() => {
    fetchTreasuryOverview();
    fetchTreasuryOnrampInfo();
    fetchTreasuryBankAccounts();
    fetchTreasuryOfframpOrders();
    fetchTreasuryOnrampTransfers();
  }, []);

  if (treasuryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!treasuryOverview && !treasuryLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
        <AlertTriangle size={32} className="mb-2" />
        <p className="text-sm">Failed to load treasury data</p>
        {treasuryError && (
          <p className="text-xs text-danger mt-1 max-w-md text-center break-all">{treasuryError}</p>
        )}
        <div className="flex gap-2 mt-3">
          <button onClick={() => { clearTreasuryError(); fetchTreasuryOverview(); }} className="text-xs text-primary hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => n < 1_000_000 ? `$${n.toLocaleString()}` : `$${(n / 1_000_000).toFixed(2)}M`;

  const to = treasuryOverview ?? {};
  const tWallets = to.wallets ?? [];
  const tNetworks = to.networks ?? [];
  const tMovements = to.recentMovements ?? [];
  const tSnapshots = to.snapshots ?? [];
  const tLiquidity = to.totalLiquidity ?? 0;
  const tHot = to.hotTotal ?? 0;
  const tWarm = to.warmTotal ?? 0;
  const tCold = to.coldTotal ?? 0;

  const byType = (type: string) => tWallets.filter((w: { walletType: string }) => w.walletType === type);

  const handleCreateOfframp = async () => {
    if (!offrampChain || !offrampAmount) return;
    await createTreasuryOfframpOrder({ chain: offrampChain, amount: parseFloat(offrampAmount), sourceWalletType: offrampSourceType });
    setOfframpAmount("");
    fetchTreasuryOfframpOrders();
  };

  const handleCreateOnrampTransfer = async () => {
    if (!onrampChain || !onrampAmount) return;
    await createTreasuryOnrampTransfer({
      chain: onrampChain,
      fiatAmount: parseFloat(onrampAmount),
      memoCode: onrampMemo || undefined,
      destinationWalletType: onrampDestType,
    });
    setOnrampAmount("");
    setOnrampMemo("");
    fetchTreasuryOnrampTransfers();
  };

  const handleCreateCardDeposit = async () => {
    if (!cardChain || !cardAmount) return;
    await createTreasuryCardDeposit({ chain: cardChain, amount: parseFloat(cardAmount), receiptEmail: cardEmail || undefined, destinationWalletType: cardDestType });
  };

  const handleAddBankAccount = async () => {
    if (!bankName || !pmId) return;
    await createTreasuryBankAccount({ bankName, paymentMethodId: pmId, accountSuffix: acctSuffix || undefined });
    setBankName("");
    setPmId("");
    setAcctSuffix("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Treasury & Liquidity</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Institutional liquidity management & reserve monitoring</p>
        </div>
        <button
          onClick={() => {
            fetchTreasuryOverview();
            fetchTreasuryOnrampInfo();
            fetchTreasuryBankAccounts();
            fetchTreasuryOfframpOrders();
            fetchTreasuryOnrampTransfers();
          }}
          className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt shrink-0"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Liquidity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-secondary-dim text-secondary">
              <Database size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-text-primary truncate">{fmt(tLiquidity)}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary truncate">Total Liquidity</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-danger">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-danger-dim text-danger">
              <Thermometer size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-text-primary truncate">{fmt(tHot)}</p>
              <p className="text-[10px] sm:text-xs text-danger font-medium truncate">Hot Wallet</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-warning">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-warning-dim text-warning">
              <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-text-primary truncate">{fmt(tWarm)}</p>
              <p className="text-[10px] sm:text-xs text-warning font-medium truncate">Warm Wallet</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-secondary">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-secondary-dim text-secondary">
              <Shield size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-text-primary truncate">{fmt(tCold)}</p>
              <p className="text-[10px] sm:text-xs text-secondary font-medium truncate">Cold Storage</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Network Allocation */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Network Allocation</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tNetworks.map((network: string) => {
            const netWallets = tWallets.filter((w: { network: string }) => w.network === network);
            const netTotal = netWallets.reduce((s: number, w: { balance: number }) => s + (w.balance ?? 0), 0) || 1;
            return (
              <div key={network} className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm font-bold text-text-primary mb-3">{network}</p>
                <p className="text-2xl font-bold text-primary mb-3">{fmt(netTotal)}</p>
                <div className="space-y-2">
                  {(["HOT", "WARM", "COLD"] as const).map((type) => {
                    const wallet = netWallets.find((w: { walletType: string }) => w.walletType === type);
                    if (!wallet) return null;
                    const pct = ((wallet.balance / netTotal) * 100).toFixed(0);
                    return (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${type === "HOT" ? "text-danger" : type === "WARM" ? "text-warning" : "text-secondary"}`}>
                          {type}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden hidden sm:block">
                            <div className={`h-full rounded-full ${type === "HOT" ? "bg-danger" : type === "WARM" ? "bg-warning" : "bg-secondary"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-text-secondary w-auto text-right">{fmt(wallet.balance)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Wallet Inventory */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Wallet Inventory</h2>
        </div>
        {tWallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <Wallet size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium mb-1">No treasury wallets found</p>
            <p className="text-xs mb-4">Initialize treasury wallets to start managing liquidity</p>
            <button
              onClick={initTreasuryWallets}
              disabled={treasuryLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {treasuryLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Database size={16} />
              )}
              {treasuryLoading ? "Initializing..." : "Init Treasury Wallet"}
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(["HOT", "WARM", "COLD"] as const).map((type) => (
            <div key={type} className={`border-l-4 rounded-lg p-4 ${walletTypeBg[type]}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${walletTypeColors[type]}`}>
                  {type}
                </span>
                <span className="text-xs text-text-subtle">
                  {byType(type).length} wallet{byType(type).length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {byType(type).map((w: { id: string; network: string; address: string; balance: number; thresholdMin: number | null }) => (
                  <div key={w.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-text-secondary font-mono shrink-0">{w.network}</span>
                      {w.address ? (
                        <button
                          onClick={() => navigator.clipboard.writeText(w.address)}
                          className="text-[9px] font-mono text-text-subtle hover:text-text-primary truncate max-w-[80px] sm:max-w-[120px] flex items-center gap-0.5"
                          title={w.address}
                        >
                          {w.address.slice(0, 6)}...{w.address.slice(-4)}
                          <Copy size={8} className="shrink-0" />
                        </button>
                      ) : (
                        <span className="text-[9px] text-text-subtle">no address</span>
                      )}
                      {w.thresholdMin && w.balance < w.thresholdMin && (
                        <AlertTriangle size={10} className="text-danger shrink-0" />
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-text-primary font-mono">${(w.balance ?? 0).toLocaleString()}</p>
                      {w.thresholdMin != null && (
                        <p className="text-[9px] text-text-subtle">min: ${w.thresholdMin.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </Card>

      {/* Rebalance Controls + Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Trigger Rebalance</h2>
          </div>
          <div className="space-y-3">
            {rebalanceMessage && (
              <div className="bg-primary-dim border border-primary-border text-primary text-sm rounded-lg px-4 py-2.5">
                {rebalanceMessage}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tNetworks.map((network: string) => (
                <button
                  key={network}
                  onClick={() => triggerRebalance(network)}
                  className="px-3 py-2 rounded-lg bg-primary-dim border border-primary-border text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
                >
                  {network}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpDown size={16} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">Recent Movements</h2>
          </div>
          <div className="space-y-2">
            {tMovements.length === 0 ? (
              <p className="text-text-subtle text-sm py-8 text-center">No recent movements</p>
            ) : (
              tMovements.map((m: { id: string; fromWallet: string; toWallet: string; amount: number; reason: string | null; network: string; status: string; createdAt: string }) => (
                <div key={m.id} className="flex items-start gap-3 pb-2 border-b border-border last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${m.status === "COMPLETED" ? "bg-primary" : "bg-warning"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase text-text-secondary">{m.fromWallet}</span>
                      <ArrowUpDown size={10} className="text-text-subtle shrink-0" />
                      <span className="text-[10px] font-semibold uppercase text-text-secondary">{m.toWallet}</span>
                      <span className={`text-[10px] font-semibold ${m.status === "COMPLETED" ? "text-primary" : "text-warning"}`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary font-medium">${(m.amount ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-text-subtle">{m.reason || m.network}</p>
                  </div>
                  <span className="text-[10px] text-text-subtle shrink-0">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Liquidity Trend */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-violet-400" />
          <h2 className="text-lg font-bold text-text-primary">Liquidity Trend (7 days)</h2>
        </div>
        <div className="space-y-2">
          {tSnapshots.map((s: { id: string; createdAt: string; hotBalance: number; warmBalance: number; coldBalance: number; totalBalance: number }) => (
            <div key={s.id} className="flex items-center gap-2 sm:gap-4 py-1.5 border-b border-border last:border-0">
              <span className="text-xs text-text-subtle w-20 sm:w-24 shrink-0">{new Date(s.createdAt).toLocaleDateString()}</span>
              <div className="flex-1 h-4 rounded-full bg-card-alt overflow-hidden flex">
                <div className="bg-danger h-full transition-all" style={{ width: `${((s.hotBalance ?? 0) / ((s.totalBalance ?? 0) || 1)) * 100}%` }} title={`Hot: ${s.hotBalance}`} />
                <div className="bg-warning h-full transition-all" style={{ width: `${((s.warmBalance ?? 0) / ((s.totalBalance ?? 0) || 1)) * 100}%` }} title={`Warm: ${s.warmBalance}`} />
                <div className="bg-secondary h-full transition-all" style={{ width: `${((s.coldBalance ?? 0) / ((s.totalBalance ?? 0) || 1)) * 100}%` }} title={`Cold: ${s.coldBalance}`} />
              </div>
              <span className="text-xs text-text-primary font-mono w-20 sm:w-24 text-right shrink-0">{fmt(s.totalBalance)}</span>
            </div>
          ))}
          <div className="flex items-center gap-4 pt-2 text-[10px] text-text-subtle">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-danger" /> Hot</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-warning" /> Warm</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-secondary" /> Cold</div>
          </div>
        </div>
      </Card>

      {/* ============== ONRAMP / OFFRAMP SECTIONS ============== */}
      <div className="border-t border-border pt-6 mt-2">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Landmark size={18} className="text-primary" />
          Bank Deposit & Withdrawal
        </h2>

        {treasuryRampMessage && (
          <div className="mb-4 flex items-center gap-2 bg-primary-dim border border-primary-border text-primary text-sm rounded-lg px-4 py-2.5">
            <span className="flex-1">{treasuryRampMessage}</span>
            <button onClick={clearTreasuryRampMessage} className="text-primary/60 hover:text-primary">
              <XCircle size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit from Bank (Onramp) */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftToLine size={16} className="text-success" />
            <h2 className="text-lg font-bold text-text-primary">Deposit from Bank</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-card-alt border border-border rounded-lg p-3 text-xs text-text-secondary leading-relaxed">
              {treasuryOnrampInfo?.instructions || "No bank account configured. Contact Crossmint to register a bank account for treasury funding."}
            </div>

            {treasuryOnrampInfo?.bankAccounts && treasuryOnrampInfo.bankAccounts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-primary mb-2">Registered Bank Accounts</p>
                {treasuryOnrampInfo.bankAccounts.map((acct, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-secondary bg-card-alt rounded px-3 py-2 mb-1">
                    <Landmark size={12} className="text-primary shrink-0" />
                    <span>{acct.bankName || "Crossmint"}</span>
                    {acct.accountSuffix && <span className="font-mono">••{acct.accountSuffix}</span>}
                    <span className="text-text-subtle">{acct.currency}</span>
                    {acct.isDefault && <span className="text-[10px] text-primary font-semibold">Default</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-primary mb-2">Record Incoming Transfer</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={onrampChain}
                  onChange={(e) => setOnrampChain(e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="">Select network</option>
                  {tNetworks.map((n: string) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Amount (USD)"
                  value={onrampAmount}
                  onChange={(e) => setOnrampAmount(e.target.value)}
                  className="bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <input
                type="text"
                placeholder="Memo code (optional)"
                value={onrampMemo}
                onChange={(e) => setOnrampMemo(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary mb-2"
              />
              <div className="mb-2">
                <p className="text-[10px] text-text-subtle mb-1">Destination Wallet</p>
                <div className="flex gap-1">
                  {(["HOT", "WARM", "COLD"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOnrampDestType(t)}
                      className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                        onrampDestType === t ? walletTypeBtn[t].active : walletTypeBtn[t].inactive
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateOnrampTransfer}
                disabled={!onrampChain || !onrampAmount || treasuryRampLoading}
                className="w-full px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {treasuryRampLoading ? "Recording..." : "Record Transfer"}
              </button>
            </div>

            {treasuryOnrampTransfers.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-text-primary mb-2">Recent Incoming Transfers</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {treasuryOnrampTransfers.slice(0, 10).map((t: { id: string; fiatAmount: number; fiatCurrency: string; chain: string; status: string; memoCode: string | null; createdAt: string }) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs bg-card-alt rounded px-3 py-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === "COMPLETED" ? "bg-success" : t.status === "FAILED" ? "bg-danger" : "bg-warning"}`} />
                      <span className="text-text-primary font-medium">${t.fiatAmount.toLocaleString()}</span>
                      <span className="text-text-subtle">{t.fiatCurrency}</span>
                      <span className="text-text-subtle">→ {t.chain}</span>
                      {t.memoCode && <span className="font-mono text-[9px] text-text-subtle">memo: {t.memoCode}</span>}
                      <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full border ${statusBadge[t.status] || ""}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right column: Card Deposit + Withdraw to Bank */}
        <div className="space-y-6">
          {/* Deposit with Card */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeftToLine size={16} className="text-success" />
              <h2 className="text-lg font-bold text-text-primary">Deposit with Card</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={cardChain}
                  onChange={(e) => setCardChain(e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="">Select network</option>
                  {tNetworks.map((n: string) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Amount (USD)"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className="bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <input
                type="email"
                placeholder="Receipt email (optional)"
                value={cardEmail}
                onChange={(e) => setCardEmail(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <div>
                <p className="text-[10px] text-text-subtle mb-1">Destination Wallet</p>
                <div className="flex gap-1">
                  {(["HOT", "WARM", "COLD"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCardDestType(t)}
                      className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                        cardDestType === t ? walletTypeBtn[t].active : walletTypeBtn[t].inactive
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateCardDeposit}
                disabled={!cardChain || !cardAmount || cardDepositLoading}
                className="w-full px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {cardDepositLoading ? "Creating Order..." : "Pay with Card"}
              </button>
              {treasuryCardDepositResult && (
                <div className="border border-primary-border bg-primary-dim rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-text-primary">Card Deposit Created</p>
                  <p className="text-[11px] text-text-secondary font-mono break-all">Order ID: {treasuryCardDepositResult.orderId}</p>
                  <p className="text-[11px] text-text-secondary font-mono break-all">Client Secret: {treasuryCardDepositResult.clientSecret}</p>
                  <p className="text-[11px] text-text-secondary">Amount: ${treasuryCardDepositResult.amount} → {treasuryCardDepositResult.walletAddress?.slice(0, 6)}...{treasuryCardDepositResult.walletAddress?.slice(-4)}</p>
                  <p className="text-[11px] text-text-secondary">Status: <span className="text-primary font-semibold">{treasuryCardDepositResult.status}</span></p>
                  <a
                    href={`https://staging.crossmint.com/checkout?clientSecret=${treasuryCardDepositResult.clientSecret}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
                  >
                    <ExternalLink size={12} />
                    Open Checkout Page (Staging)
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Withdraw to Bank (Offramp) */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightFromLine size={16} className="text-danger" />
              <h2 className="text-lg font-bold text-text-primary">Withdraw to Bank</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={offrampChain}
                  onChange={(e) => setOfframpChain(e.target.value)}
                  className="bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="">Select network</option>
                  {tNetworks.map((n: string) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Amount (USDC)"
                  value={offrampAmount}
                  onChange={(e) => setOfframpAmount(e.target.value)}
                  className="bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <p className="text-[10px] text-text-subtle mb-1">Source Wallet</p>
                <div className="flex gap-1">
                  {(["HOT", "WARM", "COLD"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOfframpSourceType(t)}
                      className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                        offrampSourceType === t ? walletTypeBtn[t].active : walletTypeBtn[t].inactive
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateOfframp}
                disabled={!offrampChain || !offrampAmount || treasuryRampLoading}
                className="w-full px-3 py-2 rounded-lg bg-danger text-white text-xs font-semibold hover:bg-danger/90 disabled:opacity-50 transition-all"
              >
                {treasuryRampLoading ? "Creating Order..." : "Create Offramp Order"}
              </button>

              {treasuryOfframpOrders.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-text-primary mb-2">Offramp Orders</p>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {treasuryOfframpOrders.map((o: { id: string; amount: number; chain: string; status: string; crossmintOrderId: string | null; txHash: string | null; failureReason: string | null; createdAt: string }) => (
                      <div key={o.id} className="bg-card-alt border border-border rounded-lg p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-text-primary font-medium">${o.amount.toLocaleString()}</span>
                          <span className="text-[9px] text-text-subtle">{o.chain}</span>
                          <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full border ${statusBadge[o.status] || ""}`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-text-subtle">
                          {o.crossmintOrderId && <span>ID: {o.crossmintOrderId.slice(0, 12)}...</span>}
                          {o.txHash && <span>Tx: {o.txHash.slice(0, 10)}...</span>}
                          <span className="ml-auto">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        {o.failureReason && (
                          <p className="text-[9px] text-danger mt-1">{o.failureReason}</p>
                        )}
                        {o.status === "AWAITING_PAYMENT" && (
                          <button
                            onClick={() => executeTreasuryOfframpOrder(o.id)}
                            disabled={treasuryRampLoading}
                            className="mt-1.5 text-[9px] px-2 py-1 rounded bg-primary-dim text-primary border border-primary-border hover:bg-primary/20 transition-all"
                          >
                            Execute
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Bank Accounts Management */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Bank Accounts</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-text-primary mb-2">Registered Accounts</p>
            {treasuryBankAccounts.length === 0 ? (
              <p className="text-xs text-text-subtle py-4">No bank accounts registered. Add one using the form.</p>
            ) : (
              <div className="space-y-1.5">
                {treasuryBankAccounts.map((a: { id: string; bankName: string | null; accountSuffix: string | null; routingNumber: string | null; currency: string; isDefault: boolean; paymentMethodId: string }) => (
                  <div key={a.id} className="flex items-center gap-2 bg-card-alt rounded-lg px-3 py-2 text-xs">
                    <Landmark size={12} className="text-primary shrink-0" />
                    <span className="text-text-primary font-medium">{a.bankName || "Bank Account"}</span>
                    {a.accountSuffix && <span className="font-mono text-text-subtle">••{a.accountSuffix}</span>}
                    <span className="text-text-subtle">{a.currency}</span>
                    {a.isDefault && <span className="text-[9px] text-primary font-semibold">Default</span>}
                    <button
                      onClick={() => removeTreasuryBankAccount(a.id)}
                      className="ml-auto text-text-subtle hover:text-danger transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-text-primary mb-2">Add New Account</p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Payment Method ID (from Crossmint)"
                value={pmId}
                onChange={(e) => setPmId(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Account suffix (optional, e.g. 1141)"
                value={acctSuffix}
                onChange={(e) => setAcctSuffix(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleAddBankAccount}
                disabled={!bankName || !pmId || treasuryRampLoading}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Plus size={12} />
                Add Account
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
