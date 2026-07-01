import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Building2, Smartphone, MapPin, Activity, Plus, RotateCcw, Loader2 } from "lucide-react";

const typeIcon: Record<string, React.ElementType> = {
  BANK: Building2,
  MOBILE_MONEY: Smartphone,
  CASH_PICKUP: MapPin,
};

const typeColor: Record<string, string> = {
  BANK: "text-secondary bg-secondary-dim",
  MOBILE_MONEY: "text-purple-400 bg-purple-900/30",
  CASH_PICKUP: "text-primary bg-primary-dim",
};

export default function Partners() {
  const { partners, partnerMetrics, reconcileResult, fetchPartners, fetchPartnerMetrics, createPartner, deactivatePartner, runReconciliation } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "BANK" as string, country: "", baseUrl: "", priority: 1 });
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    partners.forEach((p) => {
      if (!partnerMetrics[p.id]) {
        fetchPartnerMetrics(p.id);
      }
    });
  }, [partners.length, fetchPartnerMetrics]);

  const handleCreate = async () => {
    if (!formData.name) return;
    await createPartner(formData);
    setShowForm(false);
    setFormData({ name: "", type: "BANK", country: "", baseUrl: "", priority: 1 });
  };

  const handleReconcile = async () => {
    setReconciling(true);
    await runReconciliation();
    setReconciling(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Partner Network</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Manage payout partners and monitor SLA performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt border border-border"
          >
            {reconciling ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            <span>Reconcile</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-dim border border-primary-border"
          >
            <Plus size={14} />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Result */}
      {reconcileResult && (
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-text-primary">Reconciliation Complete</h3>
              <div className="flex flex-wrap gap-4 mt-1 text-xs text-text-secondary">
                <span>{reconcileResult.total} total</span>
                <span className="text-primary">{reconcileResult.matched} matched</span>
                <span className="text-warning">{reconcileResult.unmatched} unmatched</span>
                <span className="text-danger">{reconcileResult.errors} errors</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add Partner Form */}
      {showForm && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-text-primary">Register New Partner</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Partner Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="BANK">Bank</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CASH_PICKUP">Cash Pickup</option>
            </select>
            <input
              placeholder="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Priority (1=highest)"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Base URL (optional)"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              className="bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary sm:col-span-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-card-alt transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="text-xs font-semibold text-white bg-gradient-to-r from-[#00D6A3] to-[#0084FF] hover:opacity-90 px-3 py-1.5 rounded-lg transition-all"
            >
              Register
            </button>
          </div>
        </Card>
      )}

      {/* Partner List */}
      <div className="space-y-3">
        {partners.map((partner) => {
          const Icon = typeIcon[partner.type] || Building2;
          const colorClass = typeColor[partner.type] || "text-text-secondary bg-card-alt";
          const metrics = partnerMetrics[partner.id];

          return (
            <Card key={partner.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2.5 rounded-lg shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-text-primary">{partner.name}</h3>
                      <Badge variant={partner.status === "ACTIVE" ? "success" : "danger"}>
                        {partner.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {partner.type.replace(/_/g, " ")}
                      {partner.country && ` · ${partner.country}`}
                      {partner.priority && ` · Priority ${partner.priority}`}
                    </p>
                    {partner.baseUrl && (
                      <p className="text-[10px] text-text-subtle mt-1 font-mono truncate max-w-[200px] sm:max-w-[300px]">{partner.baseUrl}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {metrics && (
                    <div className="flex items-center gap-3 text-center">
                      <div>
                        <p className="text-sm font-bold text-primary">{metrics.successRate}%</p>
                        <p className="text-[9px] text-text-subtle uppercase">Success</p>
                      </div>
                      <div className="w-px h-8 bg-border hidden sm:block" />
                      <div className="hidden sm:block">
                        <p className="text-sm font-bold text-secondary">{metrics.avgResponseTimeMs}ms</p>
                        <p className="text-[9px] text-text-subtle uppercase">Response</p>
                      </div>
                      <div className="w-px h-8 bg-border hidden sm:block" />
                      <div className="hidden sm:block">
                        <p className="text-sm font-bold text-warning">{metrics.failureCount}</p>
                        <p className="text-[9px] text-text-subtle uppercase">Failed</p>
                      </div>
                      <div className="block sm:hidden text-left text-xs">
                        <p className="text-text-secondary">{metrics.avgResponseTimeMs}ms | {metrics.failureCount} fail</p>
                      </div>
                    </div>
                  )}

                  {partner.status === "ACTIVE" && (
                    <button
                      onClick={() => deactivatePartner(partner.id)}
                      className="text-[10px] text-danger hover:opacity-80 hover:bg-danger-dim px-2 py-1 rounded-lg transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
