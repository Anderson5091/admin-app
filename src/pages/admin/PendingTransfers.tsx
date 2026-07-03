import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Play, Loader2, AlertCircle, CheckCircle, Camera, XCircle, Send, Lock } from "lucide-react";

interface PendingTransfer {
  id: string;
  amount: number;
  fee: number;
  destinationAmount: number;
  payoutMethod: string | null;
  currency: string;
  status: string;
  referenceId: string | null;
  processingAgentId: string | null;
  createdAt: string;
}

export default function PendingTransfers() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<{ transferId: string; base64: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMine = (t: PendingTransfer) => t.processingAgentId === profile?.id;
  const isLocked = (t: PendingTransfer) => t.status === "SENT_TO_PARTNER" && !isMine(t);

  const load = async () => {
    setLoading(true);
    setPhotoData(null);
    try {
      const data = await AgentApi.getPendingTransfers();
      setTransfers(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancelPayout = async (transferId: string) => {
    if (!profile?.id) return;
    setBusyId(transferId);
    try {
      await AgentApi.cancelPayout(profile.id, transferId);
      setPhotoData(null);
      load();
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const handleCameraClick = (_transferId: string) => {
    setPhotoData(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      const transferId = photoData?.transferId || transfers.find(t => t.status === "SENT_TO_PARTNER" && isMine(t))?.id;
      if (transferId) {
        setPhotoData({ transferId, base64, mimeType: file.type || "image/jpeg", preview: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const submitPhoto = async () => {
    if (!photoData || !profile?.id) return;
    setBusyId(photoData.transferId);
    try {
      await AgentApi.confirmPayout(profile.id, photoData.transferId, photoData.base64, photoData.mimeType);
      setPhotoData(null);
      load();
    } catch {
    } finally {
      setBusyId(null);
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
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Pending Transfers</h1>
        <Badge variant="warning">{transfers.length}</Badge>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {photoData && (
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img src={photoData.preview} alt="Proof" className="w-20 h-20 object-cover rounded-lg border border-border" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-text-secondary">Proof photo captured</p>
              <p className="text-[10px] text-text-subtle font-mono">{photoData.transferId}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={submitPhoto}
                disabled={busyId === photoData.transferId}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-success px-3 py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {busyId === photoData.transferId ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {busyId === photoData.transferId ? "Submitting..." : "Submit Proof"}
              </button>
              <button
                onClick={() => setPhotoData(null)}
                disabled={busyId === photoData.transferId}
                className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-card px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
              >
                <XCircle size={14} />
                Discard
              </button>
            </div>
          </div>
        </Card>
      )}

      {transfers.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-sm">No pending transfers.</p>
        </Card>
      ) : (
        <Card>
          <>
            <div className="hidden sm:block overflow-x-auto">
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
                        <Badge variant="info">{t.payoutMethod?.replace(/_/g, " ") || "—"}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-text-secondary">{t.currency}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={t.status === "PENDING_PAYOUT" ? "warning" : t.status === "SENT_TO_PARTNER" ? "info" : "success"}>
                          {t.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 text-right">
                        {t.status === "PENDING_PAYOUT" ? (
                          <button
                            onClick={() => t.referenceId && navigate(`/pending-transfers/${t.referenceId}`)}
                            className="flex items-center gap-1 ml-auto text-xs font-semibold text-primary bg-primary-dim px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity"
                          >
                            <Play size={12} />
                            EXECUTE PAYOUT
                          </button>
                        ) : isLocked(t) ? (
                          <span className="flex items-center gap-1 ml-auto text-xs text-text-subtle">
                            <Lock size={12} />
                            Locked
                          </span>
                        ) : t.status === "SENT_TO_PARTNER" && isMine(t) ? (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              onClick={() => handleCameraClick(t.id)}
                              disabled={busyId === t.id}
                              className="flex items-center gap-1 text-xs font-semibold text-success bg-success-dim px-2 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                            >
                              {busyId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                              Camera
                            </button>
                            <button
                              onClick={() => cancelPayout(t.id)}
                              disabled={busyId === t.id}
                              className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger-dim px-2 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                            >
                              <XCircle size={12} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 ml-auto text-xs text-text-subtle">
                            <CheckCircle size={12} className="text-success" />
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {transfers.map((t) => (
                <div key={t.id} className="bg-card-alt rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-text-subtle">{t.referenceId || "—"}</span>
                    <span className="text-sm font-bold text-text-primary">${t.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                    <Badge variant="info">{t.payoutMethod?.replace(/_/g, " ") || "—"}</Badge>
                    <span className="text-text-secondary">{t.currency}</span>
                    <Badge variant={t.status === "PENDING_PAYOUT" ? "warning" : t.status === "SENT_TO_PARTNER" ? "info" : "success"}>
                      {t.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.status === "PENDING_PAYOUT" && (
                      <button
                        onClick={() => t.referenceId && navigate(`/pending-transfers/${t.referenceId}`)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-primary bg-primary-dim px-2.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                      >
                        <Play size={12} />
                        Execute
                      </button>
                    )}
                    {t.status === "SENT_TO_PARTNER" && isMine(t) && (
                      <>
                        <button
                          onClick={() => handleCameraClick(t.id)}
                          disabled={busyId === t.id}
                          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-success bg-success-dim px-2 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {busyId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                          Camera
                        </button>
                        <button
                          onClick={() => cancelPayout(t.id)}
                          disabled={busyId === t.id}
                          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-danger bg-danger-dim px-2 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          Cancel
                        </button>
                      </>
                    )}
                    {isLocked(t) && (
                      <span className="flex items-center gap-1 text-xs text-text-subtle">
                        <Lock size={12} />
                        Locked
                      </span>
                    )}
                    {t.status !== "PENDING_PAYOUT" && t.status !== "SENT_TO_PARTNER" && (
                      <span className="flex items-center gap-1 text-xs text-text-subtle">
                        <CheckCircle size={12} className="text-success" />
                        Done
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        </Card>
      )}

    </div>
  );
}
