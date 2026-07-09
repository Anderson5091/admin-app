import { useState } from "react";
import Modal from "../ui/Modal";
import { AgentApi } from "../../features/agent/agent.api";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  agentId: string;
  onSuccess?: () => void;
}

export default function RequestCashModal({ open, onClose, agentId, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await AgentApi.requestCash(agentId, {
        amount: Number(amount),
        destination: destination || undefined,
        bankName: bankName || undefined,
        accountNumber: accountNumber || undefined,
        country: country || undefined,
        notes: notes || undefined,
      });
      setAmount("");
      setDestination("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setCountry("");
      setNotes("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Request failed");
    }
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Request Cash">
      <div className="space-y-3">
        <p className="text-xs text-text-secondary">
          Request cash delivery from QuickSend to your bank account.
        </p>

        <div>
          <label className="text-xs text-text-secondary mb-1 block">Amount (USD) *</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
          />
        </div>

        <p className="text-xs font-semibold text-text-primary mb-1">Account Details</p>

        <div>
          <label className="text-xs text-text-secondary mb-1 block">Account Name *</label>
          <input
            type="text"
            placeholder="Full name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs text-text-secondary mb-1 block">Account Number *</label>
          <input
            type="text"
            placeholder="Account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Bank Name *</label>
            <input
              type="text"
              placeholder="Bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Country *</label>
            <input
              type="text"
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-text-secondary mb-1 block">Notes (optional)</label>
          <textarea
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {error && (
          <div className="bg-danger-dim border border-danger/30 text-danger text-sm rounded-lg px-4 py-2.5 font-medium text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!amount || Number(amount) <= 0 || !accountName || !accountNumber || !bankName || !country || submitting}
          className="w-full px-3 py-2 rounded-lg bg-warning text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
          {submitting ? "Submitting..." : `Request $${amount ? Number(amount).toLocaleString() : ""} Cash`}
        </button>
      </div>
    </Modal>
  );
}