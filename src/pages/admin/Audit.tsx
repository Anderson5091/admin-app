import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Search, Shield, User, FileText, AlertTriangle } from "lucide-react";

const actionIcon: Record<string, React.ElementType> = {
  APPROVE_KYC: Shield,
  REJECT_KYC: Shield,
  FREEZE_USER: AlertTriangle,
  ACTIVATE_USER: User,
  CREATE_ADMIN: User,
  SUSPEND_ADMIN: AlertTriangle,
  ACTIVATE_ADMIN: User,
  DELETE_ADMIN: User,
  RETRY_PAYOUT: FileText,
  REVERT_PAYOUT: FileText,
};

const actionColor: Record<string, string> = {
  APPROVE_KYC: "text-primary bg-primary-dim",
  REJECT_KYC: "text-danger bg-danger-dim",
  FREEZE_USER: "text-warning bg-warning-dim",
  ACTIVATE_USER: "text-primary bg-primary-dim",
  CREATE_ADMIN: "text-secondary bg-secondary-dim",
  SUSPEND_ADMIN: "text-warning bg-warning-dim",
  ACTIVATE_ADMIN: "text-primary bg-primary-dim",
  DELETE_ADMIN: "text-danger bg-danger-dim",
  RETRY_PAYOUT: "text-secondary bg-secondary-dim",
  REVERT_PAYOUT: "text-warning bg-warning-dim",
};

export default function Audit() {
  const { auditLogs, auditLogsLoading, fetchAuditLogs } = useAdminStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  if (auditLogsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const safeLogs = auditLogs ?? [];
  const filtered = safeLogs.filter(
    (l) =>
      (l.action ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.entity ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.adminId ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.entityId ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formatAction = (action: string) =>
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">System Audit Logs</h1>
          <p className="text-text-secondary text-sm mt-1">Track all admin actions and system changes</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by action, entity, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg bg-card-alt border border-border text-text-primary text-sm placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 w-72"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Entity</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Admin</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Details</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => {
                const Icon = actionIcon[log.action] || FileText;
                const color = actionColor[log.action] || "text-text-secondary bg-card-alt";
                return (
                  <tr key={log.id} className="hover:bg-card-alt transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${color}`}>
                          <Icon size={12} />
                        </div>
                        <span className="text-text-primary font-medium text-xs">{formatAction(log.action)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-text-primary">{log.entity || "—"}</div>
                      {log.entityId && (
                        <div className="text-[10px] font-mono text-text-subtle truncate max-w-[100px]">{log.entityId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">{log.adminId ? `${log.adminId.slice(0, 8)}...` : "System"}</td>
                    <td className="px-4 py-3 text-[10px] text-text-subtle max-w-[200px] truncate">
                      {log.metadata ? JSON.stringify(log.metadata).slice(0, 80) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-subtle text-sm">No audit logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
