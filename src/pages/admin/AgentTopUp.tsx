import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import {
  ArrowLeft, ArrowUpFromLine, Users, DollarSign,
  Loader2, CheckCircle, AlertCircle,
} from "lucide-react";
import { CURRENCY_TOKEN } from "../../config/constants";

export default function AgentTopUp() {
  const navigate = useNavigate();
  const { agents, fetchAgents, agentAddBalance, agentActionLoading, agentActionResult, clearAgentActionResult } = useAdminStore();
  const [partnerAgentId, setPartnerAgentId] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (agentActionResult) {
      const t = setTimeout(() => {
        clearAgentActionResult();
        setPartnerAgentId("");
        setUsdtAmount("");
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [agentActionResult, clearAgentActionResult]);

  const partners = agents.filter((a) => a.type === "PARTNER" && a.status === "ACTIVE");

  const handleSubmit = async () => {
    if (!partnerAgentId || !usdtAmount || Number(usdtAmount) <= 0) return;
    await agentAddBalance({ partnerAgentId, usdtAmount: Number(usdtAmount) });
  };

  const isSuccess = agentActionResult?.toLowerCase().includes("success") || agentActionResult?.toLowerCase().includes("completed");
  const isError = agentActionResult?.toLowerCase().includes("error") || agentActionResult?.toLowerCase().includes("fail");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/agents")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Top Up Partner</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Transfer {CURRENCY_TOKEN} from system treasury to a partner's wallet</p>
        </div>
      </div>

      <Card className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <ArrowUpFromLine size={18} className="text-warning" />
          <h2 className="text-lg font-bold text-text-primary">Partner Top-Up</h2>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <Users size={14} className="inline mr-1" />
            Partner Agent *
          </label>
          <select
            value={partnerAgentId}
            onChange={(e) => setPartnerAgentId(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary"
            disabled={agentActionLoading}
          >
            <option value="">Select a partner...</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName || p.email} — Wallet: {(p.walletBalance ?? 0).toLocaleString()} {CURRENCY_TOKEN}
              </option>
            ))}
          </select>
          {partners.length === 0 && (
            <p className="text-xs text-warning mt-1">No active partner agents available</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <DollarSign size={14} className="inline mr-1" />
            {`${CURRENCY_TOKEN} Amount *`}
          </label>
          <input
            type="number"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            disabled={agentActionLoading}
            min="0"
          />
          <p className="text-[10px] text-text-subtle mt-1">Amount to transfer from system treasury to partner's wallet</p>
        </div>

        {partnerAgentId && usdtAmount && Number(usdtAmount) > 0 && (
          <div className="bg-card-alt rounded-lg p-4 border border-border">
            <p className="text-xs text-text-secondary mb-1">Summary</p>
            <p className="text-sm text-text-primary">
              Top up <span className="font-bold text-primary">{partners.find((p) => p.id === partnerAgentId)?.fullName || "partner"}</span> with{" "}
              <span className="font-bold text-warning">{Number(usdtAmount).toLocaleString()} {CURRENCY_TOKEN}</span>
            </p>
          </div>
        )}

        {agentActionResult && (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${
            isSuccess ? "bg-primary/10 text-primary" : isError ? "bg-danger/10 text-danger" : "bg-card-alt text-text-secondary"
          }`}>
            {isSuccess ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : isError ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : null}
            <div>
              <p>{agentActionResult}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={() => navigate("/agents")}
            className="w-full sm:w-auto px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            disabled={agentActionLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={agentActionLoading || !partnerAgentId || !usdtAmount || Number(usdtAmount) <= 0}
            className="w-full sm:w-auto px-6 py-2 text-sm bg-warning text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {agentActionLoading && <Loader2 size={14} className="animate-spin" />}
            {agentActionLoading ? "Processing..." : "Confirm Top Up"}
          </button>
        </div>
      </Card>
    </div>
  );
}
