import { useEffect } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function PayoutMonitor() {
  const { failedPayouts, fetchFailedPayouts, retryPayout } = useAdminStore();

  useEffect(() => {
    fetchFailedPayouts();
  }, [fetchFailedPayouts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payout Monitor</h1>
          <p className="text-text-secondary text-sm mt-1">{failedPayouts.length} failed payouts requiring attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {(failedPayouts || []).map((payout) => (
          <Card key={payout.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-danger-dim text-danger">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-text-primary font-semibold">${(payout.amount || 0).toLocaleString()}</p>
                    <Badge variant="info">{payout.currency || "USDT"}</Badge>
                    <Badge variant={payout.status === "FAILED" ? "danger" : "warning"}>
                      {payout.status === "FAILED" ? "Failed" : "Pending Retry"}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5">{payout.reason || "Unknown"}</p>
                  <p className="text-xs text-text-subtle mt-0.5">
                    {(payout.attempts || 0)} attempt{(payout.attempts || 0) > 1 ? "s" : ""} · Last: {payout.lastAttempt ? new Date(payout.lastAttempt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="primary" onClick={() => retryPayout(payout.id)}>
                <RefreshCw size={14} className="mr-1" /> Retry
              </Button>
            </div>
          </Card>
        ))}

        {failedPayouts.length === 0 && (
          <Card>
            <p className="text-text-secondary text-center py-8">All payouts processing normally</p>
          </Card>
        )}
      </div>
    </div>
  );
}
