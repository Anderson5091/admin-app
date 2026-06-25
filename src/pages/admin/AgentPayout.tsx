import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import Card from "../../components/ui/Card";
import {
  ArrowLeft, Send, DollarSign, Percent, CreditCard, User,
  Loader2, CheckCircle, AlertCircle, Hash,
} from "lucide-react";

const PAYOUT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "CASH_PICKUP", label: "Cash Pickup" },
];

export default function AgentPayout() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const agentId = profile?.id || "";
  const { loading, result, payout, clearResult } = useAgentStore();

  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("BANK_TRANSFER");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("0");

  const handleSubmit = async () => {
    if (!userId || !amount || !payoutMethod) return;
    await payout(agentId, {
      userId,
      amount: Number(amount),
      payoutMethod,
      beneficiaryId: beneficiaryId || undefined,
      commissionPercent: Number(commissionPercent) || 0,
    });
  };

  useEffect(() => {
    if (result && result.success) {
      const t = setTimeout(() => { clearResult(); setUserId(""); setAmount(""); setBeneficiaryId(""); setCommissionPercent("0"); }, 4000);
      return () => clearTimeout(t);
    }
  }, [result, clearResult]);

  const canSubmit = userId && amount && payoutMethod && Number(amount) > 0 && !loading;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Process Payout</h1>
          <p className="text-text-secondary text-sm mt-0.5">Send funds to a beneficiary through the partner payout network</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Send size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Payout Details</h2>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <User size={14} className="inline mr-1" />
            User ID *
          </label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter the user's ID"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <DollarSign size={14} className="inline mr-1" />
            USDT Amount *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            disabled={loading}
            min="0"
          />
          <p className="text-[10px] text-text-subtle mt-1">Amount to send to the beneficiary</p>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <CreditCard size={14} className="inline mr-1" />
            Payout Method *
          </label>
          <select
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary"
            disabled={loading}
          >
            {PAYOUT_METHODS.map((pm) => (
              <option key={pm.value} value={pm.value}>{pm.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <Hash size={14} className="inline mr-1" />
            Beneficiary ID
          </label>
          <input
            value={beneficiaryId}
            onChange={(e) => setBeneficiaryId(e.target.value)}
            placeholder="Optional — beneficiary record ID"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <Percent size={14} className="inline mr-1" />
            Commission %
          </label>
          <input
            type="number"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(e.target.value)}
            placeholder="0"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary max-w-[200px]"
            disabled={loading}
            min="0"
            max="100"
          />
        </div>

        {result && (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${
            result.success ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
          }`}>
            {result.success ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
            <div>
              <p>{result.message}</p>
              {result.reference && <p className="text-[10px] mt-1 opacity-70">Ref: {result.reference}</p>}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Processing..." : "Process Payout"}
          </button>
        </div>
      </Card>
    </div>
  );
}
