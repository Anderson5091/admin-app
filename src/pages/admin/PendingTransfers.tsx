import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Play, Loader2, AlertCircle } from "lucide-react";

interface PendingTransfer {
  id: string;
  amount: number;
  fee: number;
  destinationAmount: number;
  payoutMethod: string | null;
  currency: string;
  status: string;
  referenceId: string | null;
  createdAt: string;
}

export default function PendingTransfers() {
  const profile = useAuthStore((s) => s.profile);
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await AgentApi.getPendingTransfers();
      setTransfers(data);
    } catch {
      // handled by api
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const executePayout = async (transferId: string) => {
    if (!profile?.id) return;
    setExecuting(transferId);
    try {
      await AgentApi.executePayout(profile.id, transferId);
      load();
    } catch {
      // handled by api
    } finally {
      setExecuting(null);
    }
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
      <div className="flex items-center gap-2">
        <AlertCircle size={20} className="text-warning" />
        <h1 className="text-2xl font-bold text-text-primary">Pending Transfers</h1>
        <Badge variant="warning">{transfers.length}</Badge>
      </div>

      {transfers.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-sm">No pending transfers.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-2 pr-4">Reference</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Method</th>
                  <th className="text-left py-2 pr-4">Currency</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-text-subtle font-mono text-[10px]">{t.referenceId || "—"}</td>
                    <td className="py-2 pr-4 text-text-primary font-bold">${t.amount.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="info">{t.payoutMethod || "—"}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-text-secondary">{t.currency}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={t.status === "PENDING_PAYOUT" ? "warning" : "info"}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => executePayout(t.id)}
                        disabled={executing === t.id}
                        className="flex items-center gap-1 ml-auto text-xs font-semibold text-primary bg-primary-dim px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                      >
                        {executing === t.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Play size={12} />
                        )}
                        {executing === t.id ? "Executing..." : "Execute"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
