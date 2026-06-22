import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Plus, UserCog, DollarSign, TrendingUp, BarChart3, ToggleLeft, X } from "lucide-react";

const typeColors: Record<string, string> = {
  PARTNER: "text-purple-400 bg-purple-900/30 border-purple-700/30",
  INTERNAL: "text-primary bg-primary-dim border-primary-border",
};

export default function Agents() {
  const { agents, fetchAgents, createAgent, toggleAgentStatus, fetchAgentDetail, agentDetail, fetchAgentKpi, agentKpi } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [kpiPeriod, setKpiPeriod] = useState("DAILY");
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "", phone: "", type: "PARTNER" });

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentDetail(selectedAgent);
      fetchAgentKpi(selectedAgent, kpiPeriod);
    }
  }, [selectedAgent, kpiPeriod, fetchAgentDetail, fetchAgentKpi]);

  const handleCreate = async () => {
    if (!formData.email || !formData.password) return;
    await createAgent(formData);
    setShowForm(false);
    setFormData({ email: "", password: "", fullName: "", phone: "", type: "PARTNER" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Local Agents</h1>
          <p className="text-text-secondary text-sm mt-1">Manage partner and internal agents, their treasuries, and KPI performance</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-dim border border-primary-border"
        >
          <Plus size={14} />
          <span>Create Agent</span>
        </button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Register New Agent</h3>
            <button onClick={() => setShowForm(false)} className="text-text-subtle hover:text-text-primary">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="PARTNER">Partner (External)</option>
              <option value="INTERNAL">Internal Agent</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-card-alt transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="text-xs font-semibold text-white bg-gradient-to-r from-[#00D6A3] to-[#0084FF] hover:opacity-90 px-3 py-1.5 rounded-lg transition-all"
            >
              Create Agent
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-4 cursor-pointer hover:border-primary-border transition-colors" onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2.5 rounded-lg shrink-0 ${typeColors[agent.type] || "bg-card text-text-secondary"}`}>
                  <UserCog size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-primary">{agent.fullName || agent.email}</h3>
                    <Badge variant={agent.type === "PARTNER" ? "purple" : "success"}>{agent.type}</Badge>
                    <Badge variant={agent.status === "ACTIVE" ? "success" : "danger"}>{agent.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{agent.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} className="text-primary" />
                      Base: {agent.baseTreasuryBalance.toLocaleString()} USDT
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-warning" />
                      Commission: {agent.commissionBalance.toLocaleString()} USDT
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 size={12} className="text-secondary" />
                      {agent.totalTransactions} txs
                    </span>
                    {agent.kpiRating !== null && (
                      <span className={`font-semibold ${agent.kpiRating >= 70 ? "text-primary" : agent.kpiRating >= 50 ? "text-warning" : "text-danger"}`}>
                        KPI: {agent.kpiRating}/100
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent.id); }}
                className="text-[10px] text-danger hover:opacity-80 hover:bg-danger-dim px-2 py-1 rounded-lg transition-colors shrink-0"
              >
                <ToggleLeft size={14} />
              </button>
            </div>

            {selectedAgent === agent.id && agentDetail && agentDetail.id === agent.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-card-alt rounded-lg p-3 text-center">
                    <p className="text-xs text-text-secondary">Base Treasury</p>
                    <p className="text-lg font-bold text-text-primary">{agentDetail.baseTreasuryBalance?.toLocaleString() || "N/A"}</p>
                    <p className="text-[9px] text-text-subtle">USDT</p>
                  </div>
                  <div className="bg-card-alt rounded-lg p-3 text-center">
                    <p className="text-xs text-text-secondary">Commission Wallet</p>
                    <p className="text-lg font-bold text-warning">{agentDetail.commissionBalance?.toLocaleString() || "N/A"}</p>
                    <p className="text-[9px] text-text-subtle">USDT</p>
                  </div>
                  <div className="bg-card-alt rounded-lg p-3 text-center">
                    <p className="text-xs text-text-secondary">Today Volume</p>
                    <p className="text-lg font-bold text-primary">${agentDetail.todayVolume.toLocaleString()}</p>
                    <p className="text-[9px] text-text-subtle">{agentDetail.todayTxCount} txs</p>
                  </div>
                  <div className="bg-card-alt rounded-lg p-3 text-center">
                    <p className="text-xs text-text-secondary">Today Commission</p>
                    <p className="text-lg font-bold text-secondary">${agentDetail.todayCommission.toLocaleString()}</p>
                    <p className="text-[9px] text-text-subtle">USDT</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">KPI Period:</span>
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

                {agentKpi.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-text-subtle uppercase border-b border-border">
                          <th className="text-left py-2 pr-4">Period</th>
                          <th className="text-right py-2 pr-4">Volume</th>
                          <th className="text-right py-2 pr-4">Commission</th>
                          <th className="text-right py-2 pr-4">TX Count</th>
                          <th className="text-right py-2 pr-4">Reward Points</th>
                          <th className="text-right py-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentKpi.map((kpi) => (
                          <tr key={kpi.id} className="border-b border-border last:border-0">
                            <td className="py-2 pr-4 text-text-primary">{new Date(kpi.periodStart).toLocaleDateString()}</td>
                            <td className="py-2 pr-4 text-right text-text-primary">${kpi.totalVolume.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-right text-warning">${kpi.totalCommission.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-right text-text-secondary">{kpi.totalTxCount}</td>
                            <td className="py-2 pr-4 text-right text-primary">{kpi.rewardPoints.toLocaleString()}</td>
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
                )}

                {agentDetail.transactions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Recent Transactions</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-text-subtle uppercase border-b border-border">
                            <th className="text-left py-2 pr-4">Type</th>
                            <th className="text-right py-2 pr-4">Amount</th>
                            <th className="text-right py-2 pr-4">Commission</th>
                            <th className="text-right py-2 pr-4">Net</th>
                            <th className="text-right py-2 pr-4">User Ref</th>
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
                  </div>
                )}

                {agentDetail.wallets && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Wallets</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {agentDetail.wallets.map((w) => (
                        <div key={w.id} className="bg-card-alt rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={w.walletType === "BASE_TREASURY" ? "purple" : "warning"}>{w.walletType}</Badge>
                            <span className="text-[10px] text-text-subtle">{w.network}</span>
                          </div>
                          <p className="text-xs font-mono text-text-secondary truncate">{w.address}</p>
                          <p className="text-sm font-bold text-text-primary mt-1">{w.balance.toLocaleString()} USDT</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
