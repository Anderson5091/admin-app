import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { ArrowLeft, Clock, RefreshCw, Filter } from "lucide-react";

export default function AgentTransactions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agentDetail, fetchAgentDetail } = useAdminStore();
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    if (id) fetchAgentDetail(id);
  }, [id, fetchAgentDetail]);

  const transactions = agentDetail?.transactions || [];
  const filtered = typeFilter === "ALL" ? transactions : transactions.filter((tx) => tx.type === typeFilter);

  const agentName = agentDetail ? (agentDetail.fullName || agentDetail.email) : "Agent";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/agents/${id}`)} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
            <p className="text-text-secondary text-sm mt-0.5">{agentName}</p>
          </div>
        </div>
        <button
          onClick={() => id && fetchAgentDetail(id)}
          className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Transaction History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-text-subtle" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-card-alt border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Types</option>
              <option value="ADD_BALANCE">Add Balance</option>
              <option value="WITHDRAW">Withdraw</option>
              <option value="COMMISSION">Commission</option>
              <option value="TOPUP">Top Up</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-right py-3 pr-4">Amount</th>
                  <th className="text-right py-3 pr-4">Commission</th>
                  <th className="text-right py-3 pr-4">Net</th>
                  <th className="text-right py-3 pr-4">User Ref</th>
                  <th className="text-right py-3 pr-4">Status</th>
                  <th className="text-right py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-card-alt transition-colors">
                    <td className="py-3 pr-4">
                      <Badge variant={tx.type === "COMMISSION" ? "warning" : tx.type === "ADD_BALANCE" ? "success" : tx.type === "WITHDRAW" ? "danger" : "info"}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-right text-text-primary">${tx.amount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-warning">${tx.commission.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-text-primary">${tx.netAmount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-text-secondary font-mono text-[10px]">{tx.userRef?.slice(0, 12) || "—"}</td>
                    <td className="py-3 pr-4 text-right">
                      <Badge variant={tx.status === "COMPLETED" ? "success" : tx.status === "PENDING" ? "warning" : "danger"}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-text-subtle whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-subtle text-sm py-12 text-center">
            {typeFilter === "ALL" ? "No transactions found" : `No ${typeFilter} transactions found`}
          </p>
        )}

        <p className="text-xs text-text-subtle text-center mt-4">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</p>
      </Card>
    </div>
  );
}
