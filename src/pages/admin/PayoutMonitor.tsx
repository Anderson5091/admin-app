import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Search, Filter, RefreshCw, AlertTriangle, CheckCircle, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import type { PayoutDetailItem } from "../../features/admin/admin.types";

const statusOptions = ["All Statuses", "FAILED", "COMPLETED", "PENDING", "PROCESSING", "QUEUED"];

function PayoutDetailModal({ payoutId, onClose }: { payoutId: string; onClose: () => void }) {
  const { fetchPayoutDetail } = useAdminStore();
  const [detail, setDetail] = useState<PayoutDetailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayoutDetail(payoutId).then(setDetail).finally(() => setLoading(false));
  }, [payoutId, fetchPayoutDetail]);

  const statusVariant = (s: string) =>
    s === "COMPLETED" ? "success" : s === "FAILED" ? "danger" : s === "PENDING" ? "warning" : "info";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Payout Detail</h2>
          <button onClick={onClose} className="text-text-subtle hover:text-text-primary"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading...</div>
        ) : !detail ? (
          <div className="p-8 text-center text-danger">Failed to load payout detail</div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-subtle">Payout ID</p>
                <p className="text-sm text-text-primary font-mono truncate">{detail.id}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Transfer ID</p>
                <p className="text-sm text-text-primary font-mono truncate">{detail.transferId}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Amount</p>
                <p className="text-sm text-text-primary font-semibold">${detail.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Currency</p>
                <p className="text-sm text-text-primary">{detail.currency}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Status</p>
                <Badge variant={statusVariant(detail.status)}>{detail.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Partner</p>
                <p className="text-sm text-text-primary">{detail.partner || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Payout Method</p>
                <p className="text-sm text-text-primary">{detail.payoutMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">External Ref</p>
                <p className="text-sm text-text-primary font-mono">{detail.externalReference || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Attempts</p>
                <p className="text-sm text-text-primary">{detail.attemptCount}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Created</p>
                <p className="text-sm text-text-primary">{new Date(detail.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Processing Agent */}
            {detail.processingAgent && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Processing Agent</h3>
                <div className="flex items-center gap-3 bg-card-alt rounded-lg p-3">
                  <div className="p-2 rounded-lg bg-secondary-dim text-secondary shrink-0">
                    <ExternalLink size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-text-primary font-medium">{detail.processingAgent.name}</p>
                    <p className="text-xs text-text-secondary">{detail.processingAgent.email}</p>
                    <Badge variant={detail.processingAgent.type === "PARTNER" ? "info" : "purple"}>{detail.processingAgent.type}</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Info */}
            {detail.transfer && (() => {
              const t = detail.transfer;
              return (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Transfer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-subtle">Reference</p>
                    <p className="text-sm text-text-primary font-mono">{t.referenceId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">User</p>
                    <p className="text-sm text-text-primary">{t.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Email</p>
                    <p className="text-sm text-text-primary">{t.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Amount</p>
                    <p className="text-sm text-text-primary">${t.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Fee</p>
                    <p className="text-sm text-warning">${t.fee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Net</p>
                    <p className="text-sm text-text-primary">${t.destinationAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Proof Image */}
                {t.proofImage && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-text-subtle mb-2">Proof Image</h4>
                    {detail.transfer.proofMimeType?.startsWith("image/") ? (
                      <img
                        src={`data:${detail.transfer.proofMimeType};base64,${detail.transfer.proofImage}`}
                        alt="Proof"
                        className="max-w-full max-h-64 rounded-lg border border-border object-contain cursor-pointer"
                        onClick={() => window.open(`data:${t.proofMimeType};base64,${t.proofImage}`, "_blank")}
                      />
                    ) : (
                      <a
                        href={`data:${t.proofMimeType || "image/jpeg"};base64,${t.proofImage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> View proof file
                      </a>
                    )}
                  </div>
                )}
              </div>
              );
            })()}

            {/* Events */}
            {detail.events.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Events ({detail.events.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detail.events.map((e) => (
                    <div key={e.id} className="bg-card-alt rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary font-medium">{e.eventType}</span>
                        <span className="text-text-subtle">{new Date(e.createdAt).toLocaleString()}</span>
                      </div>
                      {e.payload != null && (
                        <pre className="mt-1 text-text-secondary overflow-x-auto">{JSON.stringify(e.payload, null, 1)}</pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner Logs */}
            {detail.partnerLogs.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Partner Logs ({detail.partnerLogs.length})</h3>
                <div className="space-y-2">
                  {detail.partnerLogs.map((l) => (
                    <div key={l.id} className="bg-card-alt rounded-lg p-3 text-xs flex items-center justify-between">
                      <span className="text-text-primary">{l.partner}</span>
                      <span className={l.statusCode && l.statusCode < 300 ? "text-success" : "text-danger"}>
                        {l.statusCode || "N/A"} · {new Date(l.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PayoutMonitor() {
  const { failedPayouts, executedPayouts, fetchFailedPayouts, fetchExecutedPayouts, retryPayout } = useAdminStore();
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const allPayouts = useMemo(() => [...failedPayouts, ...executedPayouts], [failedPayouts, executedPayouts]);
  const methodOptions = useMemo(() => {
    const methods = new Set(allPayouts.map(p => p.partner).filter(Boolean) as string[]);
    return ["All Methods", ...Array.from(methods).sort()];
  }, [allPayouts]);

  const filterFn = (p: { id: string; referenceId: string; amount: number; partner: string | null; currency: string; status: string; createdAt: string }) => {
    const q = search.toLowerCase();
    if (search && !p.id.toLowerCase().includes(q) && !p.referenceId.toLowerCase().includes(q) &&
        !p.amount.toString().includes(q) && !(p.partner || "").toLowerCase().includes(q) &&
        !p.currency.toLowerCase().includes(q)) return false;
    if (statusFilter !== "All Statuses" && p.status !== statusFilter) return false;
    if (methodFilter !== "All Methods" && p.partner !== methodFilter) return false;
    if (startDate && p.createdAt && new Date(p.createdAt) < new Date(startDate)) return false;
    if (endDate && p.createdAt) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(p.createdAt) > end) return false;
    }
    if (minAmount && p.amount < Number(minAmount)) return false;
    if (maxAmount && p.amount > Number(maxAmount)) return false;
    return true;
  };

  const filteredFailed = failedPayouts.filter(filterFn);
  const filteredExecuted = executedPayouts.filter(filterFn);

  useEffect(() => {
    fetchFailedPayouts();
    fetchExecutedPayouts();
  }, [fetchFailedPayouts, fetchExecutedPayouts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Payout Monitor</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">{failedPayouts.length} failed payouts requiring attention</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder="Search payouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-card-alt border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs text-text-primary transition-colors px-3 py-2 rounded-lg bg-card-alt border border-border hover:bg-card-alt/80"
          >
            <Filter size={14} />
            Filters
            {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                {methodOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Min Amount ($)</label>
              <input
                type="number"
                min="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Max Amount ($)</label>
              <input
                type="number"
                min="0"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => { setStatusFilter("All Statuses"); setMethodFilter("All Methods"); setStartDate(""); setEndDate(""); setMinAmount(""); setMaxAmount(""); setSearch(""); }}
                  className="bg-card-alt border border-border rounded-lg px-3 py-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Failed Payouts */}
      <div>
        <h2 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Failed Payouts ({filteredFailed.length})
        </h2>
        <div className="space-y-3">
          {filteredFailed.length === 0 ? (
            <Card>
              <p className="text-text-secondary text-center py-8">No failed payouts</p>
            </Card>
          ) : (
            filteredFailed.map((payout) => (
              <Card key={payout.id} className="p-4 border-l-2 border-danger cursor-pointer hover:bg-card-alt transition-colors" onClick={() => setSelectedPayoutId(payout.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-danger-dim text-danger shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-text-primary font-semibold text-sm sm:text-base">${(payout.amount || 0).toLocaleString()}</p>
                        <Badge variant="info">{payout.currency || "USDT"}</Badge>
                        <Badge variant="danger">Failed</Badge>
                      </div>
                      {payout.referenceId && <p className="text-xs text-text-subtle mt-0.5">Ref: {payout.referenceId}</p>}
                      <p className="text-xs text-text-subtle mt-0.5">
                        {payout.attempts} attempt{payout.attempts > 1 ? "s" : ""} · {payout.createdAt ? new Date(payout.createdAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="primary" onClick={() => retryPayout(payout.id)} className="w-full sm:w-auto">
                      <RefreshCw size={14} className="mr-1" /> Retry
                    </Button>
                    <ExternalLink size={16} className="text-text-subtle shrink-0" />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Executed Payouts */}
      <div>
        <h2 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
          <CheckCircle size={16} /> Executed Payouts ({filteredExecuted.length})
        </h2>
        <div className="space-y-3">
          {filteredExecuted.length === 0 ? (
            <Card>
              <p className="text-text-secondary text-center py-8">No executed payouts yet</p>
            </Card>
          ) : (
            filteredExecuted.map((payout) => (
              <Card key={payout.id} className="p-4 border-l-2 border-success cursor-pointer hover:bg-card-alt transition-colors" onClick={() => setSelectedPayoutId(payout.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-success-dim text-success shrink-0">
                      <CheckCircle size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-text-primary font-semibold text-sm sm:text-base">${(payout.amount || 0).toLocaleString()}</p>
                        <Badge variant="info">{payout.currency || "USDT"}</Badge>
                        <Badge variant="success">Completed</Badge>
                      </div>
                      {payout.referenceId && <p className="text-xs text-text-subtle mt-0.5">Ref: {payout.referenceId}</p>}
                      {payout.partner && <p className="text-xs text-text-subtle mt-0.5">Partner: {payout.partner}</p>}
                      <p className="text-xs text-text-subtle mt-0.5">
                        {payout.createdAt ? new Date(payout.createdAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-text-subtle shrink-0" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPayoutId && (
        <PayoutDetailModal payoutId={selectedPayoutId} onClose={() => setSelectedPayoutId(null)} />
      )}
    </div>
  );
}
