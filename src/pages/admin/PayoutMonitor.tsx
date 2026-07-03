import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { RefreshCw, AlertTriangle, CheckCircle, X, ExternalLink } from "lucide-react";
import type { PayoutDetailItem } from "../../features/admin/admin.types";

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
            {detail.transfer && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Transfer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-subtle">Reference</p>
                    <p className="text-sm text-text-primary font-mono">{detail.transfer.referenceId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">User</p>
                    <p className="text-sm text-text-primary">{detail.transfer.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Email</p>
                    <p className="text-sm text-text-primary">{detail.transfer.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Amount</p>
                    <p className="text-sm text-text-primary">${detail.transfer.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Fee</p>
                    <p className="text-sm text-warning">${detail.transfer.fee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Net</p>
                    <p className="text-sm text-text-primary">${detail.transfer.destinationAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Transfer Status</p>
                    <Badge variant={statusVariant(detail.transfer.status)}>{detail.transfer.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Created</p>
                    <p className="text-sm text-text-primary">{new Date(detail.transfer.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

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
                      {e.payload && (
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
      </div>

      {/* Failed Payouts */}
      <div>
        <h2 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Failed Payouts ({failedPayouts.length})
        </h2>
        <div className="space-y-3">
          {failedPayouts.length === 0 ? (
            <Card>
              <p className="text-text-secondary text-center py-8">No failed payouts</p>
            </Card>
          ) : (
            failedPayouts.map((payout) => (
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
          <CheckCircle size={16} /> Executed Payouts ({executedPayouts.length})
        </h2>
        <div className="space-y-3">
          {executedPayouts.length === 0 ? (
            <Card>
              <p className="text-text-secondary text-center py-8">No executed payouts yet</p>
            </Card>
          ) : (
            executedPayouts.map((payout) => (
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
