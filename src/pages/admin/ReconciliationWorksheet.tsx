import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  ArrowLeft, DollarSign, Clock,
  RefreshCw,
} from "lucide-react";

interface DailyReconciliation {
  date: string;
  openingBalance: number;
  cashIn: number;
  cashOut: number;
  closingBalance: number;
  status: "MATCHED" | "PENDING" | "DISCREPANCY";
  discrepancy: number;
}

interface ReconciliationData {
  openingBalance: number;
  cashIn: number;
  liquidCashReceived: number;
  cashOut: number;
  treasuryIn: number;
  bankSettlements: number;
  closingBalance: number;
  reconciliations: DailyReconciliation[];
}

interface ReconciliationState {
  data: ReconciliationData | null;
  loading: boolean;
  error: string | null;
}

export default function ReconciliationWorksheet() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const [state, setState] = useState<ReconciliationState>({
    data: null,
    loading: true,
    error: null
  });

  const loadWorksheetData = async () => {
    if (!profile?.id) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data: ReconciliationData = {
        openingBalance: 0,
        cashIn: 200,
        liquidCashReceived: 500,
        cashOut: 70,
        treasuryIn: 1000,
        bankSettlements: 500,
        closingBalance: 1130,
        reconciliations: [
          { date: "2026-06-30", openingBalance: 1130, cashIn: 0, cashOut: 0, closingBalance: 1130, status: "PENDING", discrepancy: 0 },
          { date: "2026-06-29", openingBalance: 500, cashIn: 700, cashOut: 70, closingBalance: 1130, status: "MATCHED", discrepancy: 0 },
          { date: "2026-06-28", openingBalance: 500, cashIn: 200, cashOut: 200, closingBalance: 500, status: "MATCHED", discrepancy: 0 },
          { date: "2026-06-27", openingBalance: 600, cashIn: 100, cashOut: 200, closingBalance: 500, status: "DISCREPANCY", discrepancy: -10 },
          { date: "2026-06-26", openingBalance: 0, cashIn: 1000, cashOut: 400, closingBalance: 600, status: "MATCHED", discrepancy: 0 },
        ]
      };
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (err) {
      console.error("Failed to load reconciliation worksheet:", err);
      setState(prev => ({ ...prev, error: "Failed to load data", loading: false }));
    }
  };

  useEffect(() => {
    loadWorksheetData();
  }, [profile?.id]);

  useEffect(() => {
    return () => {
      useAgentStore.getState().clearResult();
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!state.data || !state.data.reconciliations) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="p-3 rounded-lg bg-warning-dim border border-warning/30 mb-4">
          <DollarSign size={32} className="text-warning" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">No Data Available</h2>
        <p className="text-text-secondary text-sm mb-4 max-w-sm">
          Unable to load reconciliation worksheet data.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] hover:opacity-90 text-white text-sm font-semibold transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="p-3 rounded-lg bg-warning-dim border border-warning/30 mb-4">
          <DollarSign size={32} className="text-warning" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Error Loading Data</h2>
        <p className="text-text-secondary text-sm mb-4 max-w-sm">
          {state.error}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] hover:opacity-90 text-white text-sm font-semibold transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const data = state.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Reconciliation Worksheet</h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Internal Agent Yesterday reconciliation</p>
          </div>
        </div>
        <button
          onClick={loadWorksheetData}
          disabled={state.loading}
          className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt disabled:opacity-50"
        >
          <RefreshCw size={14} className={state.loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={20} className="text-primary shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary truncate">Opening</h2>
              </div>
              <span className="text-xl sm:text-3xl font-bold text-primary shrink-0">{(data.openingBalance ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Starting cash position</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={20} className="text-success shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary truncate">Cash In</h2>
              </div>
              <span className="text-xl sm:text-3xl font-bold text-success shrink-0">+{(data.cashIn ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Cash received from users</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={20} className="text-secondary shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary truncate">Liquid Cash</h2>
              </div>
              <span className="text-xl sm:text-3xl font-bold text-secondary shrink-0">+{(data.liquidCashReceived ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Cash delivery from Quicksend</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={20} className="text-danger shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary truncate">Cash Out</h2>
              </div>
              <span className="text-xl sm:text-3xl font-bold text-danger shrink-0">-{(data.cashOut ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Cash paid to users</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={20} className="text-warning shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary truncate">Treasury</h2>
              </div>
              <span className="text-xl sm:text-3xl font-bold text-warning shrink-0">+{(data.treasuryIn ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Float replenishment from treasury</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={20} className="text-danger shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary truncate">Settlements</h2>
              </div>
              <span className="text-xl sm:text-3xl font-bold text-danger shrink-0">-{(data.bankSettlements ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Confirmed bank deposits</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={20} className="text-primary shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary truncate">Closing</h2>
              </div>
              <span className="text-xl sm:text-3xl font-bold text-primary shrink-0">{(data.closingBalance ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Current cash position</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-warning shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary">Request Cash</h2>
              </div>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Request cash delivery from Quicksend</p>
            <button className="mt-3 w-full bg-warning text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Request Cash
            </button>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-secondary shrink-0" />
                <h2 className="text-sm sm:text-lg font-bold text-text-primary">Submit Settlement</h2>
              </div>
            </div>
            <p className="text-text-secondary text-[10px] sm:text-xs mt-1">Submit bank settlements for verification</p>
            <button className="mt-3 w-full bg-card-alt border border-border text-text-primary py-2 rounded-lg text-sm font-semibold hover:bg-card transition-colors">
              Submit Bank Settlements
            </button>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Reconciliation Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold">Date</th>
                  <th className="text-right py-3 pr-4 font-semibold">Open</th>
                  <th className="text-right py-3 pr-4 font-semibold">Cash In</th>
                  <th className="text-right py-3 pr-4 font-semibold">Cash Out</th>
                  <th className="text-right py-3 pr-4 font-semibold">Close</th>
                  <th className="text-right py-3 pr-4 font-semibold">Disc.</th>
                  <th className="text-right py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.reconciliations ?? []).map((rec) => (
                  <tr key={rec.date} className="border-b border-border last:border-0 hover:bg-card-alt transition-colors">
                    <td className="py-3 pr-4 font-medium text-text-primary">{rec.date}</td>
                    <td className="py-3 pr-4 text-right">${(rec.openingBalance ?? 0).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-success">+${(rec.cashIn ?? 0).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-danger">-${(rec.cashOut ?? 0).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right font-bold text-text-primary">${(rec.closingBalance ?? 0).toLocaleString()}</td>
                    <td className={`py-3 pr-4 text-right font-medium ${rec.discrepancy !== 0 ? "text-danger" : "text-text-subtle"}`}>
                      {rec.discrepancy !== 0 ? `-$${Math.abs(rec.discrepancy ?? 0).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          rec.status === "MATCHED" ? "success" :
                          rec.status === "PENDING" ? "warning" : "danger"
                        }
                      >
                        {rec.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
