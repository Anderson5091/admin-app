import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/admin/auth.store";
import { AdminApi } from "../../features/admin/admin.api";
import type { FeeConfig } from "../../features/admin/admin.types";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Save, X, AlertTriangle, CheckCircle } from "lucide-react";

type FeeMode = "FIXED" | "PERCENTAGE" | "BOTH";

const FEE_MODE_OPTIONS: { value: FeeMode; label: string }[] = [
  { value: "FIXED", label: "Fixed" },
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "BOTH", label: "Fixed + Percent" },
];

const TX_TYPE_LABELS: Record<string, string> = {
  AGENT_TRANSFER: "Agent Transfer",
  WEB_TRANSFER: "Web Transfer",
  WEB_DEPOSIT: "Web Deposit",
  AGENT_DEPOSIT: "Agent Deposit",
  WEB_WITHDRAW: "Web Withdraw",
  AGENT_CASH_WITHDRAW: "Agent Cash Withdraw",
  PAYOUT: "Payout",
  P2P: "P2P Transfer",
};

export default function FeeManagement() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [configs, setConfigs] = useState<FeeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FeeConfig> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data = await AdminApi.getFeeConfigs();
      setConfigs(data);
    } catch {
      setError("Failed to load fee configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const startEdit = (config: FeeConfig) => {
    if (config.superAdminOnly && !isSuperAdmin) return;
    setEditingId(config.id);
    setEditForm({ ...config });
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await AdminApi.updateFeeConfig(editingId, {
        systemFeeEnabled: editForm.systemFeeEnabled,
        systemFeeMode: editForm.systemFeeMode,
        systemFixedFee: editForm.systemFixedFee,
        systemPercentFee: editForm.systemPercentFee,
        processingFeeEnabled: editForm.processingFeeEnabled,
        processingFeeMode: editForm.processingFeeMode,
        processingFixedFee: editForm.processingFixedFee,
        processingPercentFee: editForm.processingPercentFee,
        enabled: editForm.enabled,
      });
      setConfigs((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      setSuccess("Fee configuration updated successfully");
      setEditingId(null);
      setEditForm(null);
    } catch {
      setError("Failed to update fee configuration");
    } finally {
      setSaving(false);
    }
  };

  const setNumericField = (field: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setEditForm((prev) => (prev ? { ...prev, [field]: num } : prev));
    } else if (value === "" || value === "0") {
      setEditForm((prev) => (prev ? { ...prev, [field]: 0 } : prev));
    }
  };

  const renderFeeEditor = (
    label: string,
    enabledField: "systemFeeEnabled" | "processingFeeEnabled",
    modeField: "systemFeeMode" | "processingFeeMode",
    fixedField: "systemFixedFee" | "processingFixedFee",
    percentField: "systemPercentFee" | "processingPercentFee"
  ) => {
    if (!editForm) return null;
    const enabled = editForm[enabledField] as boolean;
    const mode = editForm[modeField] as FeeMode;

    return (
      <div className="space-y-2 border border-border rounded-lg p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEditForm({ ...editForm, [enabledField]: e.target.checked })}
            className="w-4 h-4 rounded border-border bg-card-alt accent-primary"
          />
          <span className="text-text-primary text-sm font-medium">{label}</span>
        </label>
        {enabled && (
          <div className="space-y-2 pl-5">
            <div>
              <label className="text-text-subtle text-[10px] uppercase tracking-wider block mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setEditForm({ ...editForm, [modeField]: e.target.value as FeeMode })}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {FEE_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {(mode === "FIXED" || mode === "BOTH") && (
              <div>
                <label className="text-text-subtle text-[10px] uppercase tracking-wider block mb-1">Fixed Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm[fixedField] as number}
                  onChange={(e) => setNumericField(fixedField, e.target.value)}
                  className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}
            {(mode === "PERCENTAGE" || mode === "BOTH") && (
              <div>
                <label className="text-text-subtle text-[10px] uppercase tracking-wider block mb-1">Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm[percentField] as number}
                  onChange={(e) => setNumericField(percentField, e.target.value)}
                  className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Fee Management</h1>
        <p className="text-text-secondary text-sm mt-1">Configure system and processing fees per transaction type</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 text-sm text-danger">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 text-sm text-primary">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {configs.map((config) => {
          const isEditing = editingId === config.id;
          const isSuperAdminOnly = config.superAdminOnly;
          const canEdit = !isSuperAdminOnly || isSuperAdmin;

          return (
            <Card key={config.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-text-primary font-semibold">
                      {config.label || TX_TYPE_LABELS[config.transactionType] || config.transactionType}
                    </h3>
                    {isSuperAdminOnly && (
                      <Badge variant="purple">SUPER ADMIN</Badge>
                    )}
                    {!config.enabled && (
                      <Badge variant="danger">DISABLED</Badge>
                    )}
                  </div>
                  <p className="text-text-subtle text-xs mt-0.5">{config.description}</p>
                </div>
                {!isEditing && canEdit && (
                  <button
                    onClick={() => startEdit(config)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={cancelEdit}
                    className="text-text-subtle hover:text-text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {isEditing && editForm ? (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.enabled ?? true}
                      onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-border bg-card-alt accent-primary"
                    />
                    <span className="text-text-primary text-sm font-medium">Enabled</span>
                  </label>

                  {renderFeeEditor("System Fee", "systemFeeEnabled", "systemFeeMode", "systemFixedFee", "systemPercentFee")}
                  {renderFeeEditor("Processing Fee", "processingFeeEnabled", "processingFeeMode", "processingFixedFee", "processingPercentFee")}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-card-alt border border-border rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card-alt rounded-lg p-3">
                    <p className="text-text-subtle text-[10px] uppercase tracking-wider font-semibold mb-1">System Fee</p>
                    {config.systemFeeEnabled ? (
                      <div>
                        <Badge variant={config.systemFeeMode === "FIXED" ? "info" : config.systemFeeMode === "PERCENTAGE" ? "warning" : "success"}>
                          {config.systemFeeMode}
                        </Badge>
                        <div className="mt-1.5 space-y-0.5">
                          {config.systemFixedFee > 0 && (
                            <p className="text-text-primary text-sm">${config.systemFixedFee.toFixed(2)} fixed</p>
                          )}
                          {config.systemPercentFee > 0 && (
                            <p className="text-text-primary text-sm">{config.systemPercentFee}%</p>
                          )}
                          {config.systemFixedFee === 0 && config.systemPercentFee === 0 && (
                            <p className="text-text-subtle text-sm">$0.00</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-subtle text-sm">Not applied</p>
                    )}
                  </div>
                  <div className="bg-card-alt rounded-lg p-3">
                    <p className="text-text-subtle text-[10px] uppercase tracking-wider font-semibold mb-1">Processing Fee</p>
                    {config.processingFeeEnabled ? (
                      <div>
                        <Badge variant={config.processingFeeMode === "FIXED" ? "info" : config.processingFeeMode === "PERCENTAGE" ? "warning" : "success"}>
                          {config.processingFeeMode}
                        </Badge>
                        <div className="mt-1.5 space-y-0.5">
                          {config.processingFixedFee > 0 && (
                            <p className="text-text-primary text-sm">${config.processingFixedFee.toFixed(2)} fixed</p>
                          )}
                          {config.processingPercentFee > 0 && (
                            <p className="text-text-primary text-sm">{config.processingPercentFee}%</p>
                          )}
                          {config.processingFixedFee === 0 && config.processingPercentFee === 0 && (
                            <p className="text-text-subtle text-sm">$0.00</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-subtle text-sm">Not applied</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
