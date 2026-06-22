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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary text-sm mt-1">Manage platform users</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search users..."
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
    </div>
  );
}
