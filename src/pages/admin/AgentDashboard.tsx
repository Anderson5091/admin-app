import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Wallet, TrendingUp, RefreshCw, Clock } from "lucide-react";

export default function AgentDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const { agentDetail, agentKpi, fetchAgentDetail, fetchAgentKpi } = useAdminStore();
  const [kpiPeriod, setKpiPeriod] = useState("DAILY");

  useEffect(() => {
    if (profile?.id) {
      fetchAgentDetail(profile.id);
      fetchAgentKpi(profile.id, kpiPeriod);
    }
  }, [profile?.id, kpiPeriod, fetchAgentDetail, fetchAgentKpi]);

  const isAgent = profile?.role === "AGENT_PARTNER" || profile?.role === "AGENT_INTERNAL";
  if (!isAgent) return null;

  const agentName = agentDetail?.fullName || profile?.email || "Agent";

  const kpiCards = [
    { label: "Treasury", value: agentDetail?.baseTreasuryBalance ?? "—", icon: Wallet, color: "text-primary bg-primary-dim", suffix: "USDT" },
    { label: "Commission", value: agentDetail?.commissionLedgerBalance ?? "—", icon: Wallet, color: "text-warning bg-warning-dim", suffix: "USDT" },
    { label: "Today Volume", value: agentDetail?.todayVolume ? `$${agentDetail.todayVolume.toLocaleString()}` : "$0", icon: TrendingUp, color: "text-secondary bg-secondary-dim", suffix: agentDetail?.todayTxCount ? `${agentDetail.todayTxCount} txs` : "" },
    { label: "Today Commission", value: agentDetail?.todayCommission ? `$${agentDetail.todayCommission.toLocaleString()}` : "$0", icon: Wallet, color: "text-violet-400 bg-violet-900/30", suffix: "USDT" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Agent Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back, {agentName}</p>
        </div>
        <button
          onClick={() => { if (profile?.id) { fetchAgentDetail(profile.id); fetchAgentKpi(profile.id, kpiPeriod); } }}
          className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-text-primary truncate">{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</p>
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
                  <p className="text-xs font-mono text-text-secondary truncate mb-1">{w.address}</p>
                  <p className="text-lg font-bold text-text-primary">{w.balance.toLocaleString()} USDT</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-subtle text-sm py-8 text-center">No wallets assigned</p>
          )}
        </Card>
      </div>

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