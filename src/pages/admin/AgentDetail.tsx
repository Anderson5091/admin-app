import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  ArrowLeft, DollarSign, Activity,
  Wallet, Clock, BarChart3, HandCoins, RefreshCw, Copy, Check, Trash2,
} from "lucide-react";

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const { agentDetail, agentKpi, fetchAgentDetail, fetchAgentKpi, toggleAgentStatus, deleteAgent } = useAdminStore();
  const [kpiPeriod, setKpiPeriod] = useState("DAILY");
  const [copiedWalletId, setCopiedWalletId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAgentDetail(id);
      fetchAgentKpi(id, kpiPeriod);
    }
  }, [id, kpiPeriod, fetchAgentDetail, fetchAgentKpi]);

  if (!agentDetail || agentDetail.id !== id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const a = agentDetail;
  const isPartner = a.type === "PARTNER";
  const canDelete = (profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN") && a.status === "SUSPENDED";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/agents")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">{a.fullName || a.email}</h1>
              <Badge variant={isPartner ? "purple" : "success"}>{a.type}</Badge>
              <Badge variant={a.status === "ACTIVE" ? "success" : "danger"}>{a.status}</Badge>
            </div>
            <p className="text-text-secondary text-sm mt-0.5">{a.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (id) fetchAgentDetail(id); }}
            className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => id && toggleAgentStatus(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              a.status === "ACTIVE"
                ? "bg-warning-dim text-warning hover:bg-warning/20"
                : "bg-primary-dim text-primary hover:bg-primary/20"
            }`}
          >
            {a.status === "ACTIVE" ? "Suspend" : "Activate"}
          </button>
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-danger-dim text-danger hover:bg-danger/20 flex items-center gap-1"
            >
              <Trash2 size={14} />
              Delete {isPartner ? "Partner" : "Agent"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary-dim">
              <DollarSign size={14} className="sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">{a.walletBalance?.toLocaleString() ?? "N/A"}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Wallet Balance</p>
              <p className="text-[9px] text-text-subtle">USDT</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-secondary-dim">
              <HandCoins size={14} className="sm:w-4 sm:h-4 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">{a.ledgerBalance.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Ledger Balance</p>
              <p className="text-[9px] text-text-subtle">USDT</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-violet-900/30">
              <Activity size={14} className="sm:w-4 sm:h-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">${a.todayVolume.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Today Volume</p>
              <p className="text-[9px] text-text-subtle">{a.todayTxCount} txs</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary-dim">
              <BarChart3 size={14} className="sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">{a.totalRewards.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Total Rewards</p>
              <p className="text-[9px] text-text-subtle">{a.kpiRating ? `KPI: ${a.kpiRating}/100` : "No rating"}</p>
            </div>
          </div>
        </Card>
      </div>

      {a.wallets && a.wallets.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Wallets</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-left py-2 pr-4">Network</th>
                  <th className="text-left py-2 pr-4">Address</th>
                  <th className="text-right py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {a.wallets.map((w) => (
                  <tr key={w.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4">
                      <Badge variant="purple">{w.walletType}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-text-subtle">{w.walletType === "MAIN" ? "BASE  ·  ETHEREUM  ·  POLYGON" : w.network}</td>
                    <td className="py-2 pr-4">
                      {w.address ? (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(w.address!);
                            setCopiedWalletId(w.id);
                            setTimeout(() => setCopiedWalletId(null), 1500);
                          }}
                          className="flex items-center gap-1 text-[11px] font-mono text-text-subtle hover:text-primary transition-colors"
                        >
                          {copiedWalletId === w.id ? <Check size={12} /> : <Copy size={12} />}
                          {copiedWalletId === w.id ? "Copied" : w.address.slice(0, 8) + "..." + w.address.slice(-6)}
                        </button>
                      ) : (
                        <span className="text-text-subtle">—</span>
                      )}
                    </td>
                    <td className="py-2 text-right text-text-primary font-bold">{w.balance.toLocaleString()} USDT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
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
                    <th className="text-left py-2 pr-4">Period</th>
                    <th className="text-right py-2 pr-4">Volume</th>
                    <th className="text-right py-2 pr-4">Commission</th>
                    <th className="text-right py-2 pr-4">TX</th>
                    <th className="text-right py-2 pr-4">Points</th>
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
          ) : (
            <p className="text-text-subtle text-sm py-8 text-center">No KPI data yet</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h2 className="text-lg font-bold text-text-primary">Recent Transactions</h2>
            </div>
            {id && (
              <Link to={`/agents/${id}/transactions`} className="text-xs text-primary hover:underline shrink-0">
                View All
              </Link>
            )}
          </div>
          {a.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-subtle uppercase border-b border-border">
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-right py-2 pr-4">Amount</th>
                    <th className="text-right py-2 pr-4">Commission</th>
                    <th className="text-right py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {a.transactions.slice(0, 8).map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">
                        <Badge variant={tx.type === "COMMISSION" ? "warning" : tx.type === "ADD_BALANCE" ? "success" : tx.type === "WITHDRAW" ? "danger" : "info"}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-right text-text-primary">${tx.amount.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-warning">${tx.commission.toLocaleString()}</td>
                      <td className="py-2 text-right text-text-subtle">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-subtle text-sm py-8 text-center">No transactions yet</p>
          )}
        </Card>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title={`Delete ${isPartner ? "Partner" : "Agent"}`}
        message={`Permanently delete ${isPartner ? "partner" : "agent"} "${a?.fullName || a?.email}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        error={deleteError}
        onConfirm={async () => {
          setDeleteError(null);
          setDeleting(true);
          try {
            await deleteAgent(id!);
            navigate("/agents");
          } catch (err: any) {
            setDeleteError(err?.message || "Failed to delete agent");
            setDeleting(false);
          }
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
