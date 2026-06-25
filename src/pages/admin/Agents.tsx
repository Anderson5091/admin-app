import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Plus, UserCog, DollarSign, BarChart3, X, ExternalLink, HandCoins } from "lucide-react";

const typeColors: Record<string, string> = {
  PARTNER: "text-purple-400 bg-purple-900/30 border-purple-700/30",
  INTERNAL: "text-primary bg-primary-dim border-primary-border",
};

export default function Agents() {
  const { agents, fetchAgents, createAgent, toggleAgentStatus } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "", phone: "", type: "PARTNER" });

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

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
        <div className="flex items-center gap-2">
          <Link
            to="/agents/topup"
            className="flex items-center gap-1.5 text-xs font-semibold text-warning hover:opacity-80 transition-colors px-3 py-1.5 rounded-lg hover:bg-warning-dim border border-warning/30"
          >
            <HandCoins size={14} />
            <span>Top Up</span>
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-dim border border-primary-border"
          >
            <Plus size={14} />
            <span>Create Agent</span>
          </button>
        </div>
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
          <Card key={agent.id} className="p-4 hover:border-primary-border transition-colors">
            <div className="flex items-start justify-between gap-4">
              <Link to={`/agents/${agent.id}`} className="flex items-start gap-3 min-w-0 flex-1">
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
                      Treasury: {agent.baseTreasuryBalance.toLocaleString()} USDT
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 size={12} className="text-secondary" />
                      Commission: {agent.commissionLedgerBalance.toLocaleString()} USDT
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
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/agents/${agent.id}`}
                  className="flex items-center gap-1 text-xs text-text-subtle hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-primary-dim"
                >
                  <ExternalLink size={12} />
                  <span>Details</span>
                </Link>
                <button
                  onClick={() => toggleAgentStatus(agent.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    agent.status === "ACTIVE"
                      ? "bg-warning-dim text-warning hover:bg-warning/20"
                      : "bg-primary-dim text-primary hover:bg-primary/20"
                  }`}
                >
                  {agent.status === "ACTIVE" ? "Suspend" : "Activate"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
