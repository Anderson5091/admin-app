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

interface Transaction {
  type: string;
  amount: number;
  date: string;
  description: string;
}

interface ReconciliationData {
  openingBalance: number;
  cashIn: number;
  liquidCashReceived: number;
  cashOut: number;
  treasuryIn: number;
  bankSettlements: number;
  closingBalance: number;
  transactions: Transaction[];
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
        transactions: [
          { type: "CASH_DEPOSIT", amount: 200, date: "2026-06-01", description: "User cash deposit" },
          { type: "LIQUID_CASH", amount: 500, date: "2026-06-01", description: "Cash delivery from Quicksend" },
          { type: "CASH_WITHDRAWAL", amount: 70, date: "2026-06-02", description: "User cash withdrawal" },
          { type: "TREASURY_TOPUP", amount: 1000, date: "2026-06-03", description: "Float top-up from treasury" },
          { type: "BANK_SETTLEMENT", amount: 500, date: "2026-06-04", description: "Confirmed bank deposit" },
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

  if (!state.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
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
      <div className="flex flex-col items-center justify-center h-64 text-center">
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Cash Reconciliation Worksheet</h1>
            <p className="text-text-secondary text-sm mt-0.5">Internal Agent Cash Flow Tracking</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-text-primary">Opening Balance</h2>
              </div>
              <span className="text-3xl font-bold text-primary">{state.data.openingBalance.toLocaleString()} USDT</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">Starting cash position</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-success" />
                <h2 className="text-lg font-bold text-text-primary">Cash In</h2>
              </div>
              <span className="text-3xl font-bold text-success">+{state.data.cashIn.toLocaleString()} USDT</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">Cash received from users</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-info" />
                <h2 className="text-lg font-bold text-text-primary">Liquid Cash Received</h2>
              </div>
              <span className="text-3xl font-bold text-info">+{state.data.liquidCashReceived || 0} USDT</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">Cash delivery from Quicksend</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-danger" />
                <h2 className="text-lg font-bold text-text-primary">Cash Out</h2>
              </div>
              <span className="text-3xl font-bold text-danger">-{state.data.cashOut.toLocaleString()} USDT</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">Cash paid to users</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-warning" />
                <h2 className="text-lg font-bold text-text-primary">Treasury Top-up</h2>
              </div>
              <span className="text-3xl font-bold text-warning">+{state.data.treasuryIn.toLocaleString()} USDT</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">Float replenishment from treasury</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-danger" />
                <h2 className="text-lg font-bold text-text-primary">Bank Settlements</h2>
              </div>
              <span className="text-3xl font-bold text-danger">-{state.data.bankSettlements.toLocaleString()} USDT</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">Confirmed bank deposits to Quicksend</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-primary font-bold" />
                <h2 className="text-lg font-bold text-text-primary">Closing Balance</h2>
              </div>
              <span className="text-3xl font-bold text-primary">{state.data.closingBalance.toLocaleString()} USDT</span>
            </div>
            <p className="text-text-secondary text-sm mt-2">Current cash position</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Transaction Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-right py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {state.data.transactions.map((tx, index) => (
                  <tr key={tx.date + tx.type + index} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-text-secondary">{tx.date}</td>
                    <td className="py-2 pr-4">
                        <Badge variant={
                          tx.type === "CASH_DEPOSIT" ? "success" :
                          tx.type === "CASH_WITHDRAWAL" ? "danger" :
                          tx.type === "TREASURY_TOPUP" ? "warning" :
                          tx.type === "LIQUID_CASH" ? "info" : "info"
                        }>
                          {tx.type.replace("_", " ")}
                        </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right text-primary font-bold">
                        {tx.type === "CASH_DEPOSIT" || tx.type === "TREASURY_TOPUP" || tx.type === "LIQUID_CASH" ? "+" : "-"}${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-text-secondary">{tx.description}</td>
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