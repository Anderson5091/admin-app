import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { Plus, ShieldCheck, Trash2, Pencil, X, Check, KeyRound } from "lucide-react";

const roleBadge: Record<string, { variant: "purple" | "info" | "warning" | "success" | "default"; label: string }> = {
  SUPER_ADMIN: { variant: "purple", label: "Super Admin" },
  ADMIN: { variant: "info", label: "Admin" },
  COMPLIANCE: { variant: "info", label: "Compliance" },
  OPS: { variant: "warning", label: "Operations" },
  TREASURY: { variant: "success", label: "Treasury" },
};

const ALL_ROLES = ["SUPER_ADMIN", "ADMIN", "COMPLIANCE", "OPS", "TREASURY"];

export default function Admins() {
  const { adminUsers, fetchAdminUsers, createAdmin, toggleAdminStatus, deleteAdmin, updateAdmin, sendResetEmail } = useAdminStore();
  const profile = useAuthStore((s) => s.profile);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OPS");
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  const [sendingReset, setSendingReset] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    try {
      await createAdmin({ email, name: name.trim() || undefined, password, role });
      setEmail("");
      setName("");
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

  const startEdit = (admin: { id: string; name?: string; email: string; role: string }) => {
    setEditingId(admin.id);
    setEditName(admin.name || "");
    setEditEmail(admin.email);
    setEditRole(admin.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditRole("");
  };

  const saveEdit = async (adminId: string) => {
    try {
      await updateAdmin(adminId, {
        name: editName.trim() || undefined,
        email: editEmail.trim() || undefined,
        role: editRole,
      });
      cancelEdit();
    } catch {
      console.error("Failed to update admin");
    }
  };

  const handleSendReset = async (adminId: string) => {
    setSendingReset(adminId);
    try {
      await sendResetEmail(adminId);
      alert("Reset email sent successfully");
    } catch {
      alert("Failed to send reset email");
    }
    setSendingReset(null);
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-app-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                  ))}
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
          const isEditing = editingId === admin.id;

          return (
            <Card key={admin.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-app-bg border border-border rounded px-2 py-1 text-sm text-text-primary w-32"
                          placeholder="Name"
                        />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="bg-app-bg border border-border rounded px-2 py-1 text-sm text-text-primary w-40"
                          placeholder="Email"
                        />
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="bg-app-bg border border-border rounded px-2 py-1 text-sm text-text-primary"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveEdit(admin.id)}
                          className="p-1 rounded text-primary hover:bg-primary-dim transition-colors"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 rounded text-text-subtle hover:text-text-primary transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-text-primary truncate">{admin.name || admin.email}</span>
                          <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                          <Badge variant={admin.status === "ACTIVE" ? "success" : "danger"}>
                            {admin.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-subtle mt-0.5">
                          {admin.email} · Created {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.id !== profile?.id ? (
                    <>
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(admin)}
                          className="p-1.5 rounded-lg text-text-subtle hover:text-primary hover:bg-primary-dim transition-colors"
                          title="Edit admin"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => handleSendReset(admin.id)}
                          disabled={sendingReset === admin.id}
                          className="p-1.5 rounded-lg text-text-subtle hover:text-warning hover:bg-warning-dim transition-colors disabled:opacity-50"
                          title="Send password reset email"
                        >
                          <KeyRound size={16} />
                        </button>
                      )}
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
                        onClick={() => setDeleteTarget({ id: admin.id, name: admin.name || admin.email })}
                        className="p-1.5 rounded-lg text-danger-dim hover:text-danger hover:bg-danger-dim/30 transition-colors"
                        title="Delete admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Admin"
        message={`Permanently delete admin "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        error={deleteError}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleteError(null);
          setDeleting(true);
          try {
            await deleteAdmin(deleteTarget.id);
            setDeleteTarget(null);
          } catch (err: any) {
            setDeleteError(err?.response?.data?.error || err?.message || "Failed to delete admin");
          }
          setDeleting(false);
        }}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />

      {}
    </div>
  );
}
