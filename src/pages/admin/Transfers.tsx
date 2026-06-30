import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import { Search } from "lucide-react";

const statusColor: Record<string, string> = {
  DRAFT: "text-text-subtle bg-card-alt",
  PENDING: "text-warning bg-warning-dim",
  PENDING_PAYOUT: "text-primary bg-primary-dim",
  SENT_TO_PARTNER: "text-secondary bg-secondary-dim",
  COMPLETED: "text-primary bg-primary-dim",
  FAILED: "text-danger bg-danger-dim",
  CANCELLED: "text-text-subtle bg-card-alt",
};

export default function Transfers() {
  const { transfers, transfersLoading, fetchTransfers } = useAdminStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  if (transfersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const safeTransfers = transfers ?? [];
  const filtered = safeTransfers.filter(
    (t) =>
      (t.userEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.referenceId ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transfers</h1>
          <p className="text-text-secondary text-sm mt-1">Track and monitor all platform transfers</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by user or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg bg-card-alt border border-border text-text-primary text-sm placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 w-64"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Fee</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Method</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Partner</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Reference</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-card-alt transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-text-primary font-medium text-sm">{t.userName}</div>
                    <div className="text-text-subtle text-[10px]">{t.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-text-primary font-mono font-medium">${t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-secondary font-mono">${t.fee.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-secondary">{t.payoutMethod?.replace(/_/g, " ") || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusColor[t.status] || "text-text-subtle bg-card-alt"}`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{t.partner || "—"}</td>
                  <td className="px-4 py-3 text-[10px] font-mono text-text-subtle max-w-[120px] truncate">{t.referenceId || "—"}</td>
                  <td className="px-4 py-3 text-right text-xs text-text-secondary whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-subtle text-sm">No transfers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
