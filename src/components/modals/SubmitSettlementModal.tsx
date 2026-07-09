import { useState, useRef } from "react";
import Modal from "../ui/Modal";
import { AgentApi } from "../../features/agent/agent.api";
import { Loader2, HandCoins, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  agentId: string;
  cashRequests?: { id: string; amount: number }[];
  onSuccess?: () => void;
}

export default function SubmitSettlementModal({ open, onClose, agentId, cashRequests, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [cashRequestId, setCashRequestId] = useState("");
  const [depositBankName, setDepositBankName] = useState("");
  const [depositAccountNumber, setDepositAccountNumber] = useState("");
  const [depositAccountName, setDepositAccountName] = useState("");
  const [depositCountry, setDepositCountry] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProofImage(result.split(",")[1] || result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0 || !bankName || !referenceNumber) return;
    setSubmitting(true);
    setError(null);
    try {
      await AgentApi.submitSettlement(agentId, {
        amount: Number(amount),
        bankName,
        referenceNumber,
        cashRequestId: cashRequestId || undefined,
        proofImage: proofImage || undefined,
        depositBankName: depositBankName || undefined,
        depositAccountNumber: depositAccountNumber || undefined,
        depositAccountName: depositAccountName || undefined,
        depositCountry: depositCountry || undefined,
      });
      setAmount("");
      setBankName("");
      setReferenceNumber("");
      setCashRequestId("");
      setDepositBankName("");
      setDepositAccountNumber("");
      setDepositAccountName("");
      setDepositCountry("");
      setProofImage(null);
      setProofFileName("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Submission failed");
    }
    setSubmitting(false);
  };

  const pendingCashRequests = (cashRequests || []).filter((cr: any) => cr.status === "PENDING");

  return (
    <Modal open={open} onClose={onClose} title="Bank Settlement">
      <div className="space-y-3">
        <p className="text-xs text-text-secondary">
          Submit bank deposit proof for verification. This reconciles your cash position with QuickSend.
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

        <div>
          <label className="text-xs text-text-secondary mb-1 block">Reference / Transaction Number *</label>
          <input
            type="text"
            placeholder="Transaction reference number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
          />
        </div>

        {pendingCashRequests.length > 0 && (
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Link to Cash Request (optional)</label>
            <select
              value={cashRequestId}
              onChange={(e) => setCashRequestId(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="">Select a cash request</option>
              {pendingCashRequests.map((cr: any) => (
                <option key={cr.id} value={cr.id}>${Number(cr.amount).toLocaleString()} — {cr.id.slice(-8)}</option>
              ))}
            </select>
          </div>
        )}

        <div className="border-t border-border pt-3 mt-1">
          <p className="text-xs font-semibold text-text-primary mb-1">Deposit Details</p>

          <div>
            <label className="text-xs text-text-secondary mb-1 block">Account Number *</label>
            <input
              type="text"
              placeholder="Account number"
              value={depositAccountNumber}
              onChange={(e) => setDepositAccountNumber(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-2">
            <label className="text-xs text-text-secondary mb-1 block">Account Name *</label>
            <input
              type="text"
              placeholder="Full name"
              value={depositAccountName}
              onChange={(e) => setDepositAccountName(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Bank Name *</label>
              <input
                type="text"
                placeholder="Bank name"
                value={depositBankName}
                onChange={(e) => setDepositBankName(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Country *</label>
              <input
                type="text"
                placeholder="e.g. United States"
                value={depositCountry}
                onChange={(e) => setDepositCountry(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="text-xs text-text-secondary mb-1 block">Deposit Proof *</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-card-alt border border-border border-dashed rounded-lg px-3 py-3 text-sm text-text-secondary hover:bg-card transition-colors"
            >
              <Upload size={14} />
              {proofFileName || "Upload deposit receipt / proof image"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-danger-dim border border-danger/30 text-danger text-sm rounded-lg px-4 py-2.5 font-medium text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!amount || Number(amount) <= 0 || !referenceNumber || !proofImage || !depositAccountNumber || !depositAccountName || !depositBankName || !depositCountry || submitting}
          className="w-full px-3 py-2 rounded-lg bg-success text-white text-sm font-semibold hover:bg-success/90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <HandCoins size={14} />}
          {submitting ? "Submitting..." : "Submit Bank Settlement"}
        </button>
      </div>
    </Modal>
  );
}