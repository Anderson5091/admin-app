import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { ArrowLeft, Loader2, ArrowRight, User, Building2, Wallet, X } from "lucide-react";

interface TransferDetail {
  id: string;
  referenceId: string;
  amount: number;
  fee: number;
  destinationAmount: number;
  payoutMethod: string;
  currency: string;
  status: string;
  processingAgentId: string | null;
  createdAt: string;
  sender: { id: string; email: string; fullName: string | null; phone: string | null } | null;
  beneficiary: {
    id: string;
    fullName: string;
    country: string;
    bankName: string | null;
    accountNumber: string | null;
    accountCurrency: string | null;
    mobileWalletNumber: string | null;
    mobileProvider: string | null;
    cashPickupLocation: string | null;
  } | null;
}

export default function PayoutExecute() {
  const navigate = useNavigate();
  const { referenceId } = useParams<{ referenceId: string }>();
  const profile = useAuthStore((s) => s.profile);
  const [detail, setDetail] = useState<TransferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!referenceId) return;
    setLoading(true);
    setError("");
    AgentApi.getPendingTransferDetail(referenceId)
      .then(setDetail)
      .catch((err: any) => setError(err?.response?.data?.error || err?.message || "Failed to load transfer details"))
      .finally(() => setLoading(false));
  }, [referenceId]);

  const handleExecute = async () => {
    if (!detail || !profile?.id) return;
    setBusy(true);
    try {
      await AgentApi.executePayout(profile.id, detail.id);
      navigate("/pending-transfers", { replace: true });
    } catch {
      // handled by api
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/pending-transfers")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Execute Payout</h1>
          <p className="text-text-secondary text-sm mt-0.5">Review and process this payout transfer</p>
        </div>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <p className="text-danger text-sm text-center py-6">{error}</p>
        ) : detail ? (
          <div className="space-y-5">

            {/* Transfer Reference */}
            <div>
              <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mb-1">Transfer Reference</p>
              <p className="text-sm font-mono text-text-primary bg-card-alt px-3 py-2 rounded-lg">{detail.referenceId}</p>
            </div>

            {/* Sender Info */}
            <div>
              <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                <User size={12} /> Sender
              </p>
              <div className="bg-card-alt rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Name</span>
                  <span className="text-text-primary">{detail.sender?.fullName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Email</span>
                  <span className="text-text-primary">{detail.sender?.email || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Phone</span>
                  <span className="text-text-primary">{detail.sender?.phone || "—"}</span>
                </div>
              </div>
            </div>

            {/* Transfer Details */}
            <div>
              <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                <Wallet size={12} /> Transfer Details
              </p>
              <div className="bg-card-alt rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Amount</span>
                  <span className="text-text-primary font-bold">${detail.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Fee</span>
                  <span className="text-text-primary">${detail.fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Destination Amount</span>
                  <span className="text-text-primary">${detail.destinationAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Payout Method</span>
                  <Badge variant="info">{detail.payoutMethod.replace(/_/g, " ")}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Currency</span>
                  <span className="text-text-primary">{detail.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <Badge variant={detail.status === "PENDING_PAYOUT" ? "warning" : "info"}>
                    {detail.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Date</span>
                  <span className="text-text-primary">{new Date(detail.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Beneficiary Info */}
            {detail.beneficiary && (
              <div>
                <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                  <Building2 size={12} /> Beneficiary
                </p>
                <div className="bg-card-alt rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Full Name</span>
                    <span className="text-text-primary font-medium">{detail.beneficiary.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Country</span>
                    <span className="text-text-primary">{detail.beneficiary.country}</span>
                  </div>
                  {detail.beneficiary.bankName && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Bank Name</span>
                      <span className="text-text-primary">{detail.beneficiary.bankName}</span>
                    </div>
                  )}
                  {detail.beneficiary.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Account Number</span>
                      <span className="text-text-primary font-mono">{detail.beneficiary.accountNumber}</span>
                    </div>
                  )}
                  {detail.beneficiary.mobileWalletNumber && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Mobile Wallet</span>
                      <span className="text-text-primary">{detail.beneficiary.mobileWalletNumber}</span>
                    </div>
                  )}
                  {detail.beneficiary.mobileProvider && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Provider</span>
                      <span className="text-text-primary">{detail.beneficiary.mobileProvider}</span>
                    </div>
                  )}
                  {detail.beneficiary.cashPickupLocation && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Pickup Location</span>
                      <span className="text-text-primary">{detail.beneficiary.cashPickupLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExecute}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary px-4 py-2.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                {busy ? "Processing..." : "Continue Payout"}
              </button>
              <button
                onClick={() => navigate("/pending-transfers")}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-text-secondary bg-card px-4 py-2.5 rounded-lg hover:bg-card-alt transition-colors disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
