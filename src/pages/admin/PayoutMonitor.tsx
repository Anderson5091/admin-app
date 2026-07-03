import { useEffect } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function PayoutMonitor() {
  const { failedPayouts, executedPayouts, fetchFailedPayouts, fetchExecutedPayouts, retryPayout } = useAdminStore();

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
              <Card key={payout.id} className="p-4 border-l-2 border-danger">
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
                  <Button size="sm" variant="primary" onClick={() => retryPayout(payout.id)} className="w-full sm:w-auto">
                    <RefreshCw size={14} className="mr-1" /> Retry
                  </Button>
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
              <Card key={payout.id} className="p-4 border-l-2 border-success">
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
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
