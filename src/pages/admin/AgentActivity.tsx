import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { RefreshCw, Filter, Clock } from "lucide-react";

export default function AgentActivity() {
  const profile = useAuthStore((s) => s.profile);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchTransactions = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await AgentApi.getMyTransactions(profile.id);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load activity:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [profile?.id]);

  const filtered = typeFilter === "ALL" ? transactions : transactions.filter((tx) => tx.type === typeFilter);

  const typeOptions = ["ALL", "ADD_BALANCE", "WITHDRAW", "TRANSFER", "PAYOUT", "TOPUP", "COMMISSION_WITHDRAW"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Activity</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">All transactions for {profile?.email}</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
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
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "ALL" ? "All Types" : opt.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="hidden sm:block overflow-x-auto">
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
                         <Badge variant={tx.type === "COMMISSION" || tx.type === "COMMISSION_WITHDRAW" ? "warning" : tx.type === "ADD_BALANCE" || tx.type === "TOPUP" ? "success" : tx.type === "WITHDRAW" || tx.type === "PAYOUT" ? "danger" : "info"}>
                           {tx.type.replace(/_/g, " ")}
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

<div className="sm:hidden space-y-2">
               {filtered.map((tx) => (
                 <div key={tx.id} className="bg-card-alt rounded-lg p-3 border border-border">
                   <div className="flex items-center justify-between mb-2">
                     <Badge variant={tx.type === "COMMISSION" || tx.type === "COMMISSION_WITHDRAW" ? "warning" : tx.type === "ADD_BALANCE" || tx.type === "TOPUP" ? "success" : tx.type === "WITHDRAW" || tx.type === "PAYOUT" ? "danger" : "info"}>
                       {tx.type.replace(/_/g, " ")}
                     </Badge>
                     <Badge variant={tx.status === "COMPLETED" ? "success" : tx.status === "PENDING" ? "warning" : "danger"}>
                       {tx.status}
                     </Badge>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-text-primary font-bold">${tx.amount.toLocaleString()}</span>
                     <span className="text-text-subtle">{new Date(tx.createdAt).toLocaleString()}</span>
                   </div>
<div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                      <span>Commission: <span className="text-warning">${tx.commission.toLocaleString()}</span></span>
                      <span>Net: ${tx.netAmount.toLocaleString()}</span>
                    </div>
                   {tx.userRef && <p className="text-[10px] text-text-subtle mt-1">Ref: {tx.userRef.slice(0, 12)}</p>}
                 </div>
               ))}
             </div>
          </>
        ) : (
          <p className="text-text-subtle text-sm py-12 text-center">
            {typeFilter === "ALL" ? "No transactions found" : `No ${typeFilter.replace(/_/g, " ").toLowerCase()} transactions found`}
          </p>
        )}

        <p className="text-xs text-text-subtle text-center mt-4">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</p>
      </Card>
    </div>
  );
}
