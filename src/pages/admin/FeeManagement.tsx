import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/admin/auth.store";
import { AdminApi } from "../../features/admin/admin.api";
import type { FeeConfig, FeeRule } from "../../features/admin/admin.types";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Save, X, AlertTriangle, CheckCircle, Plus, Trash2, Edit3 } from "lucide-react";

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
  AGENT_TOPUP: "Agent Topup",
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

  const [rules, setRules] = useState<FeeRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<Partial<FeeRule> & { isNew?: boolean }>({});
  const [ruleSaving, setRuleSaving] = useState(false);

  const PAYOUT_METHOD_OPTIONS = ["BANK", "MOBILE_MONEY", "CASH_PICKUP"];

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const data = await AdminApi.getFeeRules();
      setRules(data);
    } catch {
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const startAddRule = () => {
    setEditingRuleId("__new__");
    setRuleForm({ country: "", payoutMethod: "BANK", fixedFee: 0, percentFee: 0, isNew: true });
  };

  const startEditRule = (rule: FeeRule) => {
    setEditingRuleId(rule.id);
    setRuleForm({ ...rule });
  };

  const cancelRuleEdit = () => {
    setEditingRuleId(null);
    setRuleForm({});
  };

  const handleSaveRule = async () => {
    if (!ruleForm.country || !ruleForm.payoutMethod) return;
    setRuleSaving(true);
    try {
      if (editingRuleId === "__new__") {
        const created = await AdminApi.createFeeRule({
          country: ruleForm.country,
          payoutMethod: ruleForm.payoutMethod,
          fixedFee: ruleForm.fixedFee ?? 0,
          percentFee: ruleForm.percentFee ?? 0,
        });
        setRules((prev) => [...prev, created]);
      } else if (editingRuleId) {
        const updated = await AdminApi.updateFeeRule(editingRuleId, {
          country: ruleForm.country,
          payoutMethod: ruleForm.payoutMethod,
          fixedFee: ruleForm.fixedFee,
          percentFee: ruleForm.percentFee,
        });
        setRules((prev) => prev.map((r) => (r.id === editingRuleId ? updated : r)));
      }
      cancelRuleEdit();
    } catch {
      setError("Failed to save fee rule");
    } finally {
      setRuleSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Delete this fee rule?")) return;
    try {
      await AdminApi.deleteFeeRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete fee rule");
    }
  };

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

      <hr className="border-border my-8" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Cross-Border Fee Rules</h2>
            <p className="text-text-secondary text-sm mt-0.5">Country + payout method fees deducted from recipient at payout</p>
          </div>
          <button
            onClick={startAddRule}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Add Rule
          </button>
        </div>

        <Card className="overflow-hidden">
          {rulesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : rules.length === 0 && editingRuleId !== "__new__" ? (
            <p className="text-text-subtle text-sm py-8 text-center">No fee rules configured. Add one to apply cross-border fees.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-subtle text-[10px] uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Country</th>
                    <th className="text-left py-3 px-4">Payout Method</th>
                    <th className="text-right py-3 px-4">Fixed Fee ($)</th>
                    <th className="text-right py-3 px-4">Percent (%)</th>
                    <th className="text-right py-3 px-4 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {editingRuleId === "__new__" && (
                    <tr className="bg-primary-dim/30 border-b border-border">
                      <td className="py-2 px-4">
                        <input
                          value={ruleForm.country || ""}
                          onChange={(e) => setRuleForm({ ...ruleForm, country: e.target.value })}
                          placeholder="e.g. Haiti"
                          className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <select
                          value={ruleForm.payoutMethod || "BANK"}
                          onChange={(e) => setRuleForm({ ...ruleForm, payoutMethod: e.target.value })}
                          className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                        >
                          {PAYOUT_METHOD_OPTIONS.map((pm) => (
                            <option key={pm} value={pm}>{pm}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ruleForm.fixedFee ?? 0}
                          onChange={(e) => setRuleForm({ ...ruleForm, fixedFee: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary text-right focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={ruleForm.percentFee ?? 0}
                          onChange={(e) => setRuleForm({ ...ruleForm, percentFee: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary text-right focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={handleSaveRule}
                            disabled={ruleSaving || !ruleForm.country}
                            className="p-1.5 text-primary hover:bg-primary-dim rounded transition-colors disabled:opacity-40"
                            title="Save"
                          >
                            {ruleSaving ? (
                              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                            ) : (
                              <Save size={14} />
                            )}
                          </button>
                          <button
                            onClick={cancelRuleEdit}
                            className="p-1.5 text-text-subtle hover:text-text-primary rounded transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {rules.map((rule) => {
                    const isEditing = editingRuleId === rule.id;
                    return (
                      <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-card-alt/50 transition-colors">
                        {isEditing ? (
                          <>
                            <td className="py-2 px-4">
                              <input
                                value={ruleForm.country || ""}
                                onChange={(e) => setRuleForm({ ...ruleForm, country: e.target.value })}
                                className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <select
                                value={ruleForm.payoutMethod || "BANK"}
                                onChange={(e) => setRuleForm({ ...ruleForm, payoutMethod: e.target.value })}
                                className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                              >
                                {PAYOUT_METHOD_OPTIONS.map((pm) => (
                                  <option key={pm} value={pm}>{pm}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={ruleForm.fixedFee ?? 0}
                                onChange={(e) => setRuleForm({ ...ruleForm, fixedFee: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary text-right focus:outline-none focus:border-primary"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={ruleForm.percentFee ?? 0}
                                onChange={(e) => setRuleForm({ ...ruleForm, percentFee: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-card-alt border border-border rounded px-2 py-1.5 text-sm text-text-primary text-right focus:outline-none focus:border-primary"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={handleSaveRule}
                                  disabled={ruleSaving || !ruleForm.country}
                                  className="p-1.5 text-primary hover:bg-primary-dim rounded transition-colors disabled:opacity-40"
                                  title="Save"
                                >
                                  {ruleSaving ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                  ) : (
                                    <Save size={14} />
                                  )}
                                </button>
                                <button
                                  onClick={cancelRuleEdit}
                                  className="p-1.5 text-text-subtle hover:text-text-primary rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-text-primary font-medium">{rule.country}</td>
                            <td className="py-3 px-4">
                              <Badge variant="info">{rule.payoutMethod}</Badge>
                            </td>
                            <td className="py-3 px-4 text-right text-text-primary">{rule.fixedFee.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-text-primary">{rule.percentFee}%</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => startEditRule(rule)}
                                  className="p-1.5 text-text-subtle hover:text-primary rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-1.5 text-text-subtle hover:text-danger rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
