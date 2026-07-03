import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  ArrowLeft, Search, Play, Loader2, AlertCircle, CheckCircle,
  Lock, Camera, XCircle, Send, RefreshCw,
} from "lucide-react";

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

export default function AgentPayout() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const [searchRef, setSearchRef] = useState("");
  const [searchResult, setSearchResult] = useState<TransferDetail | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [lockedPayouts, setLockedPayouts] = useState<any[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<{ transferId: string; base64: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTransferIdRef = useRef<string | null>(null);

  const loadPendingPayouts = async () => {
    if (!profile?.id) return;
    setPayoutsLoading(true);
    try {
      const detail = await AgentApi.getMyDashboard();
      const locked = (detail.pendingTransfers || []).filter(
        (t: any) => t.status === "SENT_TO_PARTNER" && t.processingAgentId === profile?.id
      );
      setLockedPayouts(locked);
    } catch {
    } finally {
      setPayoutsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPayouts();
  }, [profile?.id]);

  const handleSearch = async () => {
    if (!searchRef.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const data = await AgentApi.getPendingTransferDetail(searchRef.trim());
      setSearchResult(data);
    } catch (err: any) {
      setSearchError(err?.response?.data?.error || err?.message || "Transfer not found");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleExecute = async (transferId: string) => {
    if (!profile?.id) return;
    setBusyId(transferId);
    try {
      await AgentApi.executePayout(profile.id, transferId);
      setSearchResult(null);
      setSearchRef("");
      loadPendingPayouts();
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const cancelPayout = async (transferId: string) => {
    if (!profile?.id) return;
    setBusyId(transferId);
    try {
      await AgentApi.cancelPayout(profile.id, transferId);
      setPhotoData(null);
      loadPendingPayouts();
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const handleCameraClick = (transferId: string) => {
    pendingTransferIdRef.current = transferId;
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
      const tid = pendingTransferIdRef.current || (lockedPayouts.length > 0 ? lockedPayouts[0].id : null);
      if (tid) {
        setPhotoData({ transferId: tid, base64, mimeType: file.type || "image/jpeg", preview: dataUrl });
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
      loadPendingPayouts();
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Payout</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Execute payouts by transfer reference</p>
        </div>
      </div>

      {/* Search Card */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Search size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Search Transfer</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter transfer reference code"
              className="w-full bg-card-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searchLoading || !searchRef.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {searchError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm bg-danger/10 text-danger">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{searchError}</p>
          </div>
        )}

        {searchResult && (
          <>
            {/* Desktop table */}
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
                  <tr className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-text-subtle font-mono text-[10px]">{searchResult.referenceId}</td>
                    <td className="py-2 pr-4 text-text-primary font-bold">${searchResult.amount.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="info">{searchResult.payoutMethod?.replace(/_/g, " ") || "—"}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-text-secondary">{searchResult.currency}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={searchResult.status === "PENDING_PAYOUT" ? "warning" : searchResult.status === "SENT_TO_PARTNER" ? "info" : "success"}>
                        {searchResult.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-text-subtle">{new Date(searchResult.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 text-right">
                      {searchResult.status === "PENDING_PAYOUT" ? (
                        <button
                          onClick={() => handleExecute(searchResult.id)}
                          disabled={busyId === searchResult.id}
                          className="flex items-center gap-1 ml-auto text-xs font-semibold text-primary bg-primary-dim px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {busyId === searchResult.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Play size={12} />
                          )}
                          {busyId === searchResult.id ? "Processing..." : "Execute"}
                        </button>
                      ) : searchResult.status === "SENT_TO_PARTNER" ? (
                        <span className="flex items-center gap-1 ml-auto text-xs text-text-subtle">
                          <Lock size={12} />
                          In Progress
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 ml-auto text-xs text-text-subtle">
                          <CheckCircle size={12} className="text-success" />
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile card */}
            <div className="sm:hidden bg-card-alt rounded-lg p-3 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-text-subtle">{searchResult.referenceId}</span>
                <span className="text-sm font-bold text-text-primary">${searchResult.amount.toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="info">{searchResult.payoutMethod?.replace(/_/g, " ") || "—"}</Badge>
                <span className="text-text-secondary">{searchResult.currency}</span>
                <Badge variant={searchResult.status === "PENDING_PAYOUT" ? "warning" : searchResult.status === "SENT_TO_PARTNER" ? "info" : "success"}>
                  {searchResult.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs text-text-subtle">{new Date(searchResult.createdAt).toLocaleDateString()}</span>
                {searchResult.status === "PENDING_PAYOUT" && (
                  <button
                    onClick={() => handleExecute(searchResult.id)}
                    disabled={busyId === searchResult.id}
                    className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary-dim px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {busyId === searchResult.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Play size={12} />
                    )}
                    Execute
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

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

      {/* Pending Payouts Card */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">Pending Payouts</h2>
            {!payoutsLoading && lockedPayouts.length > 0 && (
              <Badge variant="warning">{lockedPayouts.length} locked</Badge>
            )}
          </div>
          <button
            onClick={loadPendingPayouts}
            className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-card-alt"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        {payoutsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : lockedPayouts.length === 0 ? (
          <p className="text-text-subtle text-sm py-6 text-center">No pending payouts</p>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-subtle uppercase border-b border-border">
                    <th className="text-left py-2 pr-4">Reference</th>
                    <th className="text-left py-2 pr-4">Amount</th>
                    <th className="text-left py-2 pr-4">Method</th>
                    <th className="text-left py-2 pr-4">Currency</th>
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-right py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lockedPayouts.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-text-subtle font-mono text-[10px]">{t.referenceId || "—"}</td>
                      <td className="py-2 pr-4 text-text-primary font-bold">${t.amount.toLocaleString()}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="info">{t.payoutMethod || "—"}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-text-secondary">{t.currency}</td>
                      <td className="py-2 pr-4 text-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center gap-1.5 ml-auto justify-end">
                          <button
                            onClick={() => handleCameraClick(t.id)}
                            disabled={busyId === t.id}
                            className="flex items-center gap-1 text-xs font-semibold text-success bg-success-dim px-2 py-1 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                          >
                            {busyId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                            Proof
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {lockedPayouts.map((t) => (
                <div key={t.id} className="bg-card-alt rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-text-subtle">{t.referenceId || "—"}</span>
                    <span className="text-sm font-bold text-text-primary">${t.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                    <Badge variant="info">{t.payoutMethod || "—"}</Badge>
                    <span className="text-text-secondary">{t.currency}</span>
                    <span className="text-text-subtle">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCameraClick(t.id)}
                      disabled={busyId === t.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-success bg-success-dim px-2 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {busyId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                      Proof
                    </button>
                    <button
                      onClick={() => cancelPayout(t.id)}
                      disabled={busyId === t.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-danger bg-danger-dim px-2 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
