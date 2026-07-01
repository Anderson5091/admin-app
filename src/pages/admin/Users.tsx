import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Search } from "lucide-react";

export default function Users() {
  const { users, fetchUsers, toggleUserStatus, usersLoading } = useAdminStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const safeUsers = users ?? [];
  const filtered = safeUsers.filter(
    (u) => (u.email ?? "").toLowerCase().includes(search.toLowerCase()) || (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge variant="success">Active</Badge>;
      case "FROZEN": return <Badge variant="danger">Frozen</Badge>;
      case "SUSPENDED": return <Badge variant="warning">Suspended</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Manage platform users</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg bg-card-alt border border-border text-text-primary text-sm placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="p-0 overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">KYC Tier</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Transfers</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Volume</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-card-alt transition-colors">
                  <td className="px-4 py-3 text-text-primary font-medium">{user.name || user.email}</td>
                  <td className="px-4 py-3 text-text-primary">{user.email}</td>
                  <td className="px-4 py-3">{statusBadge(user.status || "ACTIVE")}</td>
                  <td className="px-4 py-3"><Badge variant="info">Tier {user.kycTier ?? 0}</Badge></td>
                  <td className="px-4 py-3 text-text-primary">{user.totalTransfers ?? 0}</td>
                  <td className="px-4 py-3 text-text-primary">${(user.totalVolume ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    {user.status === "ACTIVE" || !user.status ? (
                      <Button size="sm" variant="danger" onClick={() => toggleUserStatus(user.id)}>Freeze</Button>
                    ) : (
                      <Button size="sm" variant="success" onClick={() => toggleUserStatus(user.id)}>Activate</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary truncate">{user.name || user.email}</p>
                <p className="text-xs text-text-secondary truncate mt-0.5">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {statusBadge(user.status || "ACTIVE")}
                  <Badge variant="info">Tier {user.kycTier ?? 0}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                  <span>{user.totalTransfers ?? 0} transfers</span>
                  <span>${(user.totalVolume ?? 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="shrink-0">
                {user.status === "ACTIVE" || !user.status ? (
                  <Button size="sm" variant="danger" onClick={() => toggleUserStatus(user.id)}>Freeze</Button>
                ) : (
                  <Button size="sm" variant="success" onClick={() => toggleUserStatus(user.id)}>Activate</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-text-subtle text-sm">No users found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
