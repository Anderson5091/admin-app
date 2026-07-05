import { useEffect, useState, useCallback } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAdminStreamStore } from "../../features/admin/stream.store";
import { AdminApi } from "../../features/admin/admin.api";
import { useAuthStore } from "../../features/admin/auth.store";
import Card from "../../components/ui/Card";
import type { SystemRevenueData, AgentRevenueData } from "../../features/admin/admin.types";
import {
  Users, ArrowUpDown, Shield, AlertTriangle, Scale, Ban, AlertCircle, Clock, Radio, UserCog, Handshake,
  DollarSign, TrendingUp, BarChart3, Loader, Search, X
} from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING_PAYOUT: "text-warning",
  SENT_TO_PARTNER: "text-secondary",
  COMPLETED: "text-primary",
  FAILED: "text-danger",
};

function TrendChart({ data, period, colorStart, colorEnd }: {
  data: { label: string; total: number }[];
  period: string;
  colorStart: string;
  colorEnd: string;
}) {
  if (!data.length) return <p className="text-text-subtle text-xs py-8 text-center">No trend data for this period</p>;

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const barCount = data.length;

  const formatLabel = (label: string) => {
    if (period === "year") return label; // already "2024-01"
    if (period === "month") return label.slice(5); // "01" from "2024-01-01"
    return label.slice(5); // "01-15" from "2024-01-15"
  };

  const formatVerticalLabel = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  return (
    <div className="flex gap-2">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between text-[9px] text-text-subtle text-right pr-1 shrink-0" style={{ height: 160 }}>
        {yLabels.reverse().map((v) => (
          <span key={v}>{formatVerticalLabel(v)}</span>
        ))}
      </div>
      {/* Chart area */}
      <div className="flex-1">
        {/* Bars */}
        <div className="flex items-end gap-1" style={{ height: 140 }}>
          {data.map((d, i) => {
            const pct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
            return (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center justify-end group relative"
                style={{ height: "100%" }}
              >
                {/* Tooltip */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card-alt border border-border rounded px-1.5 py-0.5 z-10 whitespace-nowrap">
                  <span className="text-[9px] text-text-primary font-medium">${d.total.toFixed(2)}</span>
                </div>
                <div
                  className="w-full rounded-t-sm transition-all duration-300 min-h-[2px]"
                  style={{
                    height: `${Math.max(pct, 1)}%`,
                    background: `linear-gradient(to top, ${colorStart}, ${colorEnd})`,
                    opacity: 0.3 + (i / barCount) * 0.7,
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* X-axis labels */}
        {barCount > 0 && (
          <div className="flex gap-1 mt-1.5">
            {data.map((d, i) => {
              const showLabel = barCount <= 15 || i % Math.ceil(barCount / 10) === 0 || i === barCount - 1;
              return (
                <div key={d.label} className="flex-1 text-center">
                  {showLabel && (
                    <span className="text-[7px] sm:text-[8px] text-text-subtle truncate block">
                      {formatLabel(d.label)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { dashboard, fetchDashboard, loading, error } = useAdminStore();
  const { liveTransactions, connected } = useAdminStreamStore();
  const profile = useAuthStore((s) => s.profile);
  const canViewRevenue = profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN" || profile?.role === "TREASURY";

  const [sysRevenue, setSysRevenue] = useState<SystemRevenueData | null>(null);
  const [agentRevenue, setAgentRevenue] = useState<AgentRevenueData | null>(null);
  const [revPeriod, setRevPeriod] = useState<"day" | "month" | "year">("day");
  const [revAgentId, setRevAgentId] = useState<string>("");
  const [revAgentInput, setRevAgentInput] = useState("");
  const [revLoading, setRevLoading] = useState(false);

  const fetchRevenue = useCallback(async () => {
    if (!canViewRevenue) return;
    setRevLoading(true);
    try {
      const [sys, agent] = await Promise.all([
        AdminApi.getSystemRevenue(revPeriod),
        AdminApi.getAgentRevenue(revPeriod, revAgentId || undefined),
      ]);
      setSysRevenue(sys);
      setAgentRevenue(agent);
    } catch {
      /* ignore */
    } finally {
      setRevLoading(false);
    }
  }, [revPeriod, revAgentId, canViewRevenue]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-danger text-sm">{error}</p>
          <button onClick={fetchDashboard} className="text-xs text-primary hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const d = dashboard ?? {};

  const PERIODS = [
    { value: "day" as const, label: "Daily" },
    { value: "month" as const, label: "Monthly" },
    { value: "year" as const, label: "Yearly" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Control Tower</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Real-time overview of platform operations</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
          connected ? "bg-primary-dim text-primary" : "bg-danger-dim text-danger"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-danger"}`} />
          {connected ? "Live" : "Disconnected"}
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: "Total Users", value: (d.totalUsers ?? 0).toLocaleString(), icon: Users, color: "text-secondary bg-secondary-dim" },
          { label: "Active Users", value: (d.activeUsers ?? 0).toLocaleString(), icon: Users, color: "text-primary bg-primary-dim" },
          { label: "Total Transfers", value: (d.totalTransfers ?? 0).toLocaleString(), icon: ArrowUpDown, color: "text-violet-400 bg-violet-900/30" },
          { label: "Volume (USDT)", value: "$" + ((d.totalVolume ?? 0) / 1_000).toFixed(1) + "K", icon: ArrowUpDown, color: "text-primary bg-primary-dim" },
          { label: "Pending KYC", value: d.pendingKyc ?? 0, icon: Shield, color: "text-warning bg-warning-dim" },
          { label: "Failed Payouts", value: d.failedPayouts ?? 0, icon: AlertTriangle, color: "text-danger bg-danger-dim" },
          { label: "Open Cases", value: d.openCases ?? 0, icon: Scale, color: "text-warning bg-warning-dim" },
          { label: "Fraud Alerts", value: d.fraudAlerts ?? 0, icon: Ban, color: "text-danger bg-danger-dim" },
          { label: "Local Agents", value: (d.internalAgents ?? 0).toLocaleString(), icon: UserCog, color: "text-primary bg-primary-dim" },
          { label: "External Agents", value: (d.partnerAgents ?? 0).toLocaleString(), icon: Handshake, color: "text-purple-400 bg-purple-900/30" },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-text-primary truncate">{kpi.value}</p>
                <p className="text-[10px] sm:text-xs text-text-secondary truncate">{kpi.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

{/* Revenue — visible for SUPER_ADMIN, ADMIN, TREASURY */}
       {canViewRevenue && (
         <>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* ── System Revenue Card ── */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary-dim">
                    <BarChart3 size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">System Revenue</h3>
                    <p className="text-[10px] text-text-subtle">All time</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary">
                  ${(sysRevenue?.allTimeTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {sysRevenue && (
                <>
                  {/* All-time breakdown */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-card-alt rounded-lg p-2 text-center">
                      <p className="text-primary text-sm font-bold">${sysRevenue.allTimeBreakdown.transferFees.toFixed(2)}</p>
                      <p className="text-text-subtle text-[9px]">Transfer Fees</p>
                    </div>
                    <div className="bg-card-alt rounded-lg p-2 text-center">
                      <p className="text-primary text-sm font-bold">${sysRevenue.allTimeBreakdown.depositFees.toFixed(2)}</p>
                      <p className="text-text-subtle text-[9px]">Deposit Fees</p>
                    </div>
                    <div className="bg-card-alt rounded-lg p-2 text-center">
                      <p className="text-primary text-sm font-bold">${sysRevenue.allTimeBreakdown.withdrawalFees.toFixed(2)}</p>
                      <p className="text-text-subtle text-[9px]">Withdrawal Fees</p>
                    </div>
                  </div>

                  {/* Trend header with inline period picker */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <TrendingUp size={14} className="text-primary" />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">Trend </span>
                      <div className="relative">
                        <button
                          onClick={() => {
                            const next = PERIODS.find((p) => p.value === revPeriod);
                            const idx = PERIODS.findIndex((p) => p.value === revPeriod);
                            const nextIdx = (idx + 1) % PERIODS.length;
                            setRevPeriod(PERIODS[nextIdx].value);
                          }}
                          className="px-2 py-0.5 rounded bg-primary-dim text-primary text-xs font-medium hover:opacity-90"
                        >
                          {revPeriod === "day" ? "Daily" : revPeriod === "month" ? "Monthly" : "Yearly"}
                        </span>
                      </div>
                      <span className="text-text-subtle text-[9px] ml-auto">
                        ${sysRevenue.total.toFixed(2)} in period
                      </span>
                    </div>
                  </div>
                    <TrendChart
                      data={sysRevenue.trend}
                      period={revPeriod}
                      colorStart="#00D6A3"
                      colorEnd="#0084FF"
                    />
                  </div>
                </>
              )}
            </Card>

            {/* ── Agent Revenue Card ── */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-900/30">
                    <BarChart3 size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Agent Revenue</h3>
                    <p className="text-[10px] text-text-subtle">All time</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  ${(agentRevenue?.allTimeTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {agentRevenue && (
                <>
                  {/* Agent filter with ID input */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
                        <input
                          type="text"
                          value={revAgentInput}
                          onChange={(e) => setRevAgentInput(e.target.value)}
                          placeholder="Filter by agent ID..."
                          className="w-full pl-8 pr-8 py-2 rounded-lg bg-card-alt border border-border text-text-primary text-sm placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                        />
                        {revAgentInput && (
                          <button
                            onClick={() => { setRevAgentInput(""); setRevAgentId(""); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-primary"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setRevAgentId(revAgentInput.trim())}
                        disabled={!revAgentInput.trim()}
                        className="px-3 py-2 rounded-lg bg-purple-900/50 text-purple-400 text-xs font-medium border border-purple-700/30 disabled:opacity-40 hover:opacity-80 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                    {revAgentId && (
                      <p className="text-[10px] text-text-subtle mt-1">Filtered by agent: {revAgentId}</p>
                    )}
                  </div>

                  {/* All-time breakdown */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-card-alt rounded-lg p-2 text-center">
                      <p className="text-purple-400 text-sm font-bold">${agentRevenue.allTimeBreakdown.commissions.toFixed(2)}</p>
                      <p className="text-text-subtle text-[9px]">Commissions</p>
                    </div>
                    <div className="bg-card-alt rounded-lg p-2 text-center">
                      <p className="text-violet-400 text-sm font-bold">${agentRevenue.allTimeBreakdown.kpiRewards.toFixed(2)}</p>
                      <p className="text-text-subtle text-[9px]">KPI Rewards</p>
                    </div>
                  </div>

{/* Trend chart */}
                   <div>
                     <div className="flex items-center gap-1.5 mb-3">
                       <TrendingUp size={14} className="text-purple-400" />
                       <div className="flex items-center gap-1">
                         <span className="text-[10px]">Trend </span>
                         <div className="relative">
                           <button
                             onClick={() => {
                               const next = PERIODS.find((p) => p.value === revPeriod);
                               const idx = PERIODS.findIndex((p) => p.value === revPeriod);
                               const nextIdx = (idx + 1) % PERIODS.length;
                               setRevPeriod(PERIODS[nextIdx].value);
                             }}
                             className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-400 text-xs font-medium hover:opacity-90"
                           >
                             {revPeriod === "day" ? "Daily" : revPeriod === "month" ? "Monthly" : "Yearly"}
                           </span>
                         </div>
                         <span className="text-text-subtle text-[9px] ml-auto">
                           ${agentRevenue.total.toFixed(2)} in period
                         </span>
                       </div>
                     </div>
                    <TrendChart
                      data={agentRevenue.trend}
                      period={revPeriod}
                      colorStart="#A78BFA"
                      colorEnd="#7C3AED"
                    />
                  </div>
                </>
              )}
            </Card>
          </div>
        </>
      )}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Alerts */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">Active Alerts</h2>
          </div>
          <div className="space-y-2">
            {(d.alerts ?? []).map((alert: any) => (
              <div key={alert.id} className={`border-l-4 pl-3 py-2 rounded-r-lg ${
                alert.severity === "CRITICAL" ? "border-l-danger bg-danger-dim" :
                alert.severity === "HIGH" ? "border-l-orange-500 bg-orange-900/10" :
                alert.severity === "MEDIUM" ? "border-l-warning bg-warning-dim" :
                "border-l-border bg-card-alt"
              }`}>
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} className={
                    alert.severity === "CRITICAL" ? "text-danger" :
                    alert.severity === "HIGH" ? "text-orange-400" :
                    alert.severity === "MEDIUM" ? "text-warning" :
                    "text-text-secondary"
                  } />
                  <span className={`text-xs font-semibold uppercase ${
                    alert.severity === "CRITICAL" ? "text-danger" :
                    alert.severity === "HIGH" ? "text-orange-400" :
                    alert.severity === "MEDIUM" ? "text-warning" :
                    "text-text-secondary"
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-text-primary mt-0.5">{alert.message}</p>
                <p className="text-xs text-text-subtle mt-0.5">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Transaction Feed */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Radio size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Live Transactions</h2>
            <span className="text-xs text-text-subtle ml-auto">{liveTransactions.length} recent</span>
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {liveTransactions.length === 0 ? (
              <p className="text-text-subtle text-sm py-8 text-center">Waiting for transactions...</p>
            ) : (
              liveTransactions.slice(0, 15).map((tx, i) => (
                <div key={`${tx.id}-${i}`} className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-text-secondary">{tx.referenceId || tx.id.slice(0, 8)}</span>
                      <span className={`text-[10px] font-semibold ${statusColors[tx.status] || "text-text-secondary"}`}>
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-sm text-text-primary font-medium">${Number(tx.amount).toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-text-subtle shrink-0">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {(d.recentActivity ?? []).map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{item.action}</p>
                  <p className="text-xs text-text-subtle mt-0.5">{item.user}</p>
                </div>
                <span className="text-xs text-text-subtle shrink-0">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
