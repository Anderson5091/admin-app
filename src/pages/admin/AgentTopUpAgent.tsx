import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import Card from "../../components/ui/Card";
import {
  ArrowLeft, ArrowUpFromLine, DollarSign,
  Loader2, CheckCircle, AlertCircle, Users,
} from "lucide-react";

export default function AgentTopUpAgent() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const { loading, result, topupPartner, clearResult } = useAgentStore();

  const [partnerAgentId, setPartnerAgentId] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  const isInternal = profile?.role === "AGENT_INTERNAL";

  const handleSubmit = async () => {
    if (!partnerAgentId || !usdtAmount || Number(usdtAmount) <= 0) return;
    await topupPartner({ partnerAgentId, usdtAmount: Number(usdtAmount) });
  };

  useEffect(() => {
    if (result && result.success) {
      const t = setTimeout(() => { clearResult(); setPartnerAgentId(""); setUsdtAmount(""); }, 4000);
      return () => clearTimeout(t);
    }
  }, [result, clearResult]);

  const canSubmit = partnerAgentId && usdtAmount && Number(usdtAmount) > 0 && !loading;

  if (!isInternal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="p-3 rounded-lg bg-warning-dim border border-warning/30 mb-4">
          <ArrowUpFromLine size={32} className="text-warning" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
        <p className="text-text-secondary text-sm mb-4 max-w-sm">
          Only internal agents can top up partner treasuries.
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
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Top Up Partner</h1>
          <p className="text-text-secondary text-sm mt-0.5">Transfer USDT from system treasury to a partner's wallet</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <ArrowUpFromLine size={18} className="text-warning" />
          <h2 className="text-lg font-bold text-text-primary">Partner Top-Up</h2>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <Users size={14} className="inline mr-1" />
            Partner Agent ID *
          </label>
          <input
            value={partnerAgentId}
            onChange={(e) => setPartnerAgentId(e.target.value)}
            placeholder="Enter the partner agent's ID"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            disabled={loading}
          />
          <p className="text-[10px] text-text-subtle mt-1">The agent ID of the partner to receive the funds</p>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <DollarSign size={14} className="inline mr-1" />
            USDT Amount *
          </label>
          <input
            type="number"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            disabled={loading}
            min="0"
          />
          <p className="text-[10px] text-text-subtle mt-1">Amount to transfer from system treasury to partner's wallet</p>
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-6 py-2 text-sm bg-warning text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Processing..." : "Confirm Top Up"}
          </button>
        </div>
      </Card>
    </div>
  );
}
