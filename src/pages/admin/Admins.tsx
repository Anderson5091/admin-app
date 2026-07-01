import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Plus, ShieldCheck, Trash2, X } from "lucide-react";

const roleBadge: Record<string, { variant: "purple" | "info" | "warning" | "success"; label: string }> = {
  SUPER_ADMIN: { variant: "purple", label: "Super Admin" },
  COMPLIANCE: { variant: "info", label: "Compliance" },
  OPS: { variant: "warning", label: "Operations" },
  TREASURY: { variant: "success", label: "Treasury" },
};

export default function Admins() {
  const { adminUsers, fetchAdminUsers, createAdmin, toggleAdminStatus, deleteAdmin } = useAdminStore();
  const profile = useAuthStore((s) => s.profile);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OPS");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    try {
      await createAdmin({ email, password, role });
      setEmail("");
      setPassword("");
      setRole("OPS");
      setShowForm(false);
    } catch {
      setError("Failed to create admin. Email may already be in use.");
    }
  };

  const handleToggleStatus = async (adminId: string) => {
    try {
      await toggleAdminStatus(adminId);
    } catch {
      console.error("Failed to toggle status");
    }
  };

  const handleDelete = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin? This cannot be undone.")) return;
    try {
      await deleteAdmin(adminId);
    } catch {
      console.error("Failed to delete admin");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Admin Users</h1>
          <p className="text-sm text-text-subtle mt-1">Manage administrator accounts and roles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Create Admin"}
        </button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">New Admin Account</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-app-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-app-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-app-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="OPS">Operations</option>
                  <option value="TREASURY">Treasury</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Create Admin
            </button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {adminUsers.map((admin) => {
          const roleInfo = roleBadge[admin.role] || { variant: "default" as const, label: admin.role };
          return (
            <Card key={admin.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-text-primary truncate">{admin.email}</span>
                      <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                      <Badge variant={admin.status === "ACTIVE" ? "success" : "danger"}>
                        {admin.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-subtle mt-0.5">
                      Created {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.id !== profile?.id && (
                    <>
                      <button
                        onClick={() => handleToggleStatus(admin.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          admin.status === "ACTIVE"
                            ? "bg-warning-dim text-warning hover:bg-warning/20"
                            : "bg-primary-dim text-primary hover:bg-primary/20"
                        }`}
                      >
                        {admin.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-1.5 rounded-lg text-danger-dim hover:text-danger hover:bg-danger-dim/30 transition-colors"
                        title="Delete admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {admin.id === profile?.id && (
                    <span className="text-xs text-text-subtle italic">Current account</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {adminUsers.length === 0 && (
          <p className="text-center text-text-subtle py-8">No admin users found.</p>
        )}
      </div>
    </div>
  );
}
