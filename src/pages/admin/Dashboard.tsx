import { useEffect } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAdminStreamStore } from "../../features/admin/stream.store";
import Card from "../../components/ui/Card";
import { Users, ArrowUpDown, Shield, AlertTriangle, Scale, Ban, AlertCircle, Clock, Radio, UserCog, Handshake } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING_PAYOUT: "text-warning",
  SENT_TO_PARTNER: "text-secondary",
  COMPLETED: "text-primary",
  FAILED: "text-danger",
};

export default function Dashboard() {
  const { dashboard, fetchDashboard, loading, error } = useAdminStore();
  const { liveTransactions, connected } = useAdminStreamStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
  const kpis = [
    { label: "Total Users", value: (d.totalUsers ?? 0).toLocaleString(), icon: Users, color: "text-secondary bg-secondary-dim" },
    { label: "Active Users", value: (d.activeUsers ?? 0).toLocaleString(), icon: Users, color: "text-primary bg-primary-dim" },
    { label: "Total Transfers", value: (d.totalTransfers ?? 0).toLocaleString(), icon: ArrowUpDown, color: "text-violet-400 bg-violet-900/30" },
    { label: "Volume (USDT)", value: "$" + ((d.totalVolume ?? 0) / 1_000_000).toFixed(1) + "M", icon: ArrowUpDown, color: "text-primary bg-primary-dim" },
    { label: "Pending KYC", value: d.pendingKyc ?? 0, icon: Shield, color: "text-warning bg-warning-dim" },
    { label: "Failed Payouts", value: d.failedPayouts ?? 0, icon: AlertTriangle, color: "text-danger bg-danger-dim" },
    { label: "Open Cases", value: d.openCases ?? 0, icon: Scale, color: "text-warning bg-warning-dim" },
    { label: "Fraud Alerts", value: d.fraudAlerts ?? 0, icon: Ban, color: "text-danger bg-danger-dim" },
    { label: "Local Agents", value: (d.internalAgents ?? 0).toLocaleString(), icon: UserCog, color: "text-primary bg-primary-dim" },
    { label: "External Agents", value: (d.partnerAgents ?? 0).toLocaleString(), icon: Handshake, color: "text-purple-400 bg-purple-900/30" },
  ];

  const severityColor = (s: string) => {
    switch (s) {
      case "CRITICAL": return "border-l-danger bg-danger-dim";
      case "HIGH": return "border-l-orange-500 bg-orange-900/10";
      case "MEDIUM": return "border-l-warning bg-warning-dim";
      default: return "border-l-border bg-card-alt";
    }
  };

  const severityIcon = (s: string) => {
    switch (s) {
      case "CRITICAL": return "text-danger";
      case "HIGH": return "text-orange-400";
      case "MEDIUM": return "text-warning";
      default: return "text-text-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Control Tower</h1>
          <p className="text-text-secondary text-sm mt-1">Real-time overview of platform operations</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
          connected ? "bg-primary-dim text-primary" : "bg-danger-dim text-danger"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-danger"}`} />
          {connected ? "Live" : "Disconnected"}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
                <p className="text-xs text-text-secondary">{kpi.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">Active Alerts</h2>
          </div>
          <div className="space-y-2">
            {(d.alerts ?? []).map((alert) => (
              <div key={alert.id} className={`border-l-4 pl-3 py-2 rounded-r-lg ${severityColor(alert.severity)}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} className={severityIcon(alert.severity)} />
                  <span className={`text-xs font-semibold uppercase ${severityIcon(alert.severity)}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {(d.recentActivity ?? []).map((item) => (
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
