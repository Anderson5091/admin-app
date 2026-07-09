import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import { HandCoins, Landmark, Loader2, RefreshCw, CheckCircle2, XCircle, Clock, Plus, Banknote } from "lucide-react";

const statusBadge: Record<string, string> = {
  PENDING: "bg-warning-dim text-warning border-warning/30",
  DELIVERED: "bg-success-dim text-success border-success/30",
  CANCELLED: "bg-danger-dim text-danger border-danger/30",
  VERIFIED: "bg-success-dim text-success border-success/30",
  REJECTED: "bg-danger-dim text-danger border-danger/30",
};

export default function AgentCashSettlement() {
  const profile = useAuthStore((s) => s.profile);
  const agentId = profile?.agent?.id || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cashRequests, setCashRequests] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [crAmount, setCrAmount] = useState("");
  const [crNotes, setCrNotes] = useState("");

  const [stAmount, setStAmount] = useState("");
  const [stBankName, setStBankName] = useState("");
  const [stRefNum, setStRefNum] = useState("");
  const [stCashRequestId, setStCashRequestId] = useState("");

  const fetchData = async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const [cr, st] = await Promise.all([
        AgentApi.getCashRequests(agentId),
        AgentApi.getSettlements(agentId),
      ]);
      setCashRequests(cr);
      setSettlements(st);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || err?.message || "Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [agentId]);

  const handleRequestCash = async () => {
    if (!crAmount || !agentId) return;
    setSubmitting(true);
    setMessage("");
    try {
      await AgentApi.requestCash(agentId, { amount: parseFloat(crAmount), notes: crNotes || undefined });
      setMessage(`Cash request for $${parseFloat(crAmount).toLocaleString()} submitted`);
      setCrAmount("");
      setCrNotes("");
      fetchData();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || err?.message || "Request failed");
    }
    setSubmitting(false);
  };

  const handleSubmitSettlement = async () => {
    if (!stAmount || !stBankName || !stRefNum || !agentId) return;
    setSubmitting(true);
    setMessage("");
    try {
      await AgentApi.submitSettlement(agentId, {
        amount: parseFloat(stAmount),
        bankName: stBankName,
        referenceNumber: stRefNum,
        cashRequestId: stCashRequestId || undefined,
      });
      setMessage(`Settlement of $${parseFloat(stAmount).toLocaleString()} submitted for verification`);
      setStAmount("");
      setStBankName("");
      setStRefNum("");
      setStCashRequestId("");
      fetchData();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || err?.message || "Submission failed");
    }
    setSubmitting(false);
  };

  if (!agentId) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        <p className="text-sm">Agent profile not found. Please log in as an agent.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash & Settlement</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Request cash delivery and submit bank settlements for verification</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 ${
          message.includes("failed") || message.includes("Failed")
            ? "bg-danger-dim border border-danger/30 text-danger"
            : "bg-success-dim border border-success/30 text-success"
        }`}>
          <span className="flex-1">{message}</span>
          <button onClick={() => setMessage("")} className="opacity-60 hover:opacity-100">
            <XCircle size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Cash */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Banknote size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Request Cash</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4">Request cash delivery from QuickSend to fulfill payouts and agent operations.</p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Amount (USD)"
              value={crAmount}
              onChange={(e) => setCrAmount(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
            />
            <textarea
              placeholder="Notes / reason (optional)"
              value={crNotes}
              onChange={(e) => setCrNotes(e.target.value)}
              rows={2}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary resize-none"
            />
            <button
              onClick={handleRequestCash}
              disabled={!crAmount || submitting}
              className="w-full px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {submitting ? "Submitting..." : "Request Cash"}
            </button>
          </div>

          {cashRequests.length > 0 && (
            <div className="border-t border-border mt-4 pt-4">
              <p className="text-xs font-semibold text-text-primary mb-2">Recent Requests</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {cashRequests.slice(0, 10).map((cr: any) => (
                  <div key={cr.id} className="flex items-center gap-2 text-xs bg-card-alt rounded px-3 py-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      cr.status === "DELIVERED" ? "bg-success" : cr.status === "CANCELLED" ? "bg-danger" : "bg-warning"
                    }`} />
                    <span className="text-text-primary font-medium">${Number(cr.amount).toLocaleString()}</span>
                    <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full border ${statusBadge[cr.status] || ""}`}>{cr.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Submit Settlement */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Landmark size={16} className="text-success" />
            <h2 className="text-lg font-bold text-text-primary">Submit Bank Settlement</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4">Submit bank deposit proof for verification. This reconciles your cash position with QuickSend.</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Amount (USD)"
                value={stAmount}
                onChange={(e) => setStAmount(e.target.value)}
                className="bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Bank name"
                value={stBankName}
                onChange={(e) => setStBankName(e.target.value)}
                className="bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <input
              type="text"
              placeholder="Reference / transaction number"
              value={stRefNum}
              onChange={(e) => setStRefNum(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
            />
            {cashRequests.filter((cr: any) => cr.status === "PENDING").length > 0 && (
              <select
                value={stCashRequestId}
                onChange={(e) => setStCashRequestId(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">Link to cash request (optional)</option>
                {cashRequests.filter((cr: any) => cr.status === "PENDING").map((cr: any) => (
                  <option key={cr.id} value={cr.id}>${Number(cr.amount).toLocaleString()} — {cr.id.slice(-8)}</option>
                ))}
              </select>
            )}
            <button
              onClick={handleSubmitSettlement}
              disabled={!stAmount || !stBankName || !stRefNum || submitting}
              className="w-full px-3 py-2 rounded-lg bg-success text-white text-xs font-semibold hover:bg-success/90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <HandCoins size={14} />}
              {submitting ? "Submitting..." : "Submit Bank Settlement"}
            </button>
          </div>

          {settlements.length > 0 && (
            <div className="border-t border-border mt-4 pt-4">
              <p className="text-xs font-semibold text-text-primary mb-2">Recent Settlements</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {settlements.slice(0, 10).map((st: any) => (
                  <div key={st.id} className="flex items-center gap-2 text-xs bg-card-alt rounded px-3 py-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      st.status === "VERIFIED" ? "bg-success" : st.status === "REJECTED" ? "bg-danger" : "bg-warning"
                    }`} />
                    <span className="text-text-primary font-medium">${Number(st.amount).toLocaleString()}</span>
                    <span className="text-text-subtle">{st.bankName}</span>
                    <span className="font-mono text-[9px] text-text-subtle hidden sm:inline">{st.referenceNumber}</span>
                    <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full border ${statusBadge[st.status] || ""}`}>{st.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Full History */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Full History</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[...cashRequests.map((cr: any) => ({ ...cr, _type: "Cash Request" })), ...settlements.map((st: any) => ({ ...st, _type: "Settlement" }))]
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 30)
              .map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 text-xs bg-card-alt rounded px-3 py-2">
                  {item._type === "Cash Request" ? (
                    <Banknote size={12} className="text-primary shrink-0" />
                  ) : (
                    <Landmark size={12} className="text-success shrink-0" />
                  )}
                  <span className="text-text-subtle font-medium">{item._type}</span>
                  <span className="text-text-primary font-medium">${Number(item.amount).toLocaleString()}</span>
                  {item.bankName && <span className="text-text-subtle">{item.bankName}</span>}
                  <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full border ${statusBadge[item.status] || ""}`}>{item.status}</span>
                  <span className="text-[9px] text-text-subtle">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            {cashRequests.length === 0 && settlements.length === 0 && (
              <p className="text-xs text-text-subtle text-center py-4">No cash requests or settlements yet</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
