import { useEffect } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import { Wallet, ArrowUpDown, AlertTriangle, RefreshCw, Thermometer, Database, Shield, Copy } from "lucide-react";

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

export default function Treasury() {
  const { treasuryOverview, treasuryLoading, rebalanceMessage, fetchTreasuryOverview, triggerRebalance } = useAdminStore();

  useEffect(() => {
    fetchTreasuryOverview();
  }, [fetchTreasuryOverview]);

  if (treasuryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!treasuryOverview) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
        <AlertTriangle size={32} className="mb-2" />
        <p className="text-sm">Failed to load treasury data</p>
        <button onClick={() => fetchTreasuryOverview()} className="mt-3 text-xs text-primary hover:underline">Retry</button>
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

  const byType = (type: string) => tWallets.filter((w) => w.walletType === type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Treasury & Liquidity</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Institutional liquidity management & reserve monitoring</p>
        </div>
        <button
          onClick={() => fetchTreasuryOverview()}
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
          {tNetworks.map((network) => {
            const netWallets = tWallets.filter((w) => w.network === network);
            const netTotal = netWallets.reduce((s, w) => s + (w.balance ?? 0), 0) || 1;
            return (
              <div key={network} className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm font-bold text-text-primary mb-3">{network}</p>
                <p className="text-2xl font-bold text-primary mb-3">{fmt(netTotal)}</p>
                <div className="space-y-2">
                  {(["HOT", "WARM", "COLD"] as const).map((type) => {
                    const wallet = netWallets.find((w) => w.walletType === type);
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
                {byType(type).map((w) => (
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
      </Card>

      {/* Rebalance Controls + Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rebalance */}
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
              {tNetworks.map((network) => (
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

        {/* Recent Movements */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpDown size={16} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">Recent Movements</h2>
          </div>
          <div className="space-y-2">
            {tMovements.length === 0 ? (
              <p className="text-text-subtle text-sm py-8 text-center">No recent movements</p>
            ) : (
              tMovements.map((m) => (
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
          {tSnapshots.map((s) => (
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
    </div>
  );
}
