import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { FileText, CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react";

export default function KycReview() {
  const { pendingKyc, fetchPendingKyc, approveKyc, rejectKyc, fetchKycDetail, kycDetail } = useAdminStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchPendingKyc();
  }, [fetchPendingKyc]);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    await fetchKycDetail(id);
    setShowDetail(true);
  };

  const renderScores = (payload: Record<string, any> | null) => {
    if (!payload) return null;
    const items: { label: string; value: string }[] = [];
    if (payload.aml) items.push({ label: "AML Hits", value: `${payload.aml.total_hits ?? 0}` });
    if (payload.database) items.push({ label: "DB Match", value: `${payload.database.match_rate ?? 0}%` });
    if (payload.idVerification) items.push({ label: "ID Status", value: payload.idVerification.status });
    if (payload.liveness) items.push({ label: "Liveness", value: `${payload.liveness.score ?? 0}%` });
    if (payload.faceMatch) items.push({ label: "Face Match", value: `${payload.faceMatch.score ?? 0}%` });
    if (payload.poa) items.push({ label: "POA Status", value: payload.poa.status });
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item) => (
          <span key={item.label} className="text-[10px] bg-card-alt border border-border rounded px-2 py-0.5 text-text-secondary">
            {item.label}: {item.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">KYC Review</h1>
        <p className="text-text-secondary text-xs sm:text-sm mt-1">{pendingKyc.length} pending applications</p>
      </div>

      <div className="space-y-4">
        {pendingKyc.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-text-primary font-bold text-sm sm:text-base">{item.name || item.email}</h3>
                  <Badge variant="info">Tier {item.tier}</Badge>
                  <Badge variant={item.status === "PENDING" ? "warning" : item.status === "IN_REVIEW" ? "warning" : "info"}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{item.email}</p>
                <p className="text-xs text-text-subtle mt-1">
                  User KYC: T{item.userKycTier} · {item.userKycStatus}
                </p>
                <p className="text-xs text-text-subtle">Submitted {new Date(item.submittedAt).toLocaleDateString()}</p>

                {item.lastEvent && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <FileText size={12} />
                      <span className="font-medium">{item.lastEvent.type}</span>
                      <Badge variant={item.lastEvent.status === "APPROVED" ? "success" : "warning"}>
                        {item.lastEvent.status}
                      </Badge>
                    </div>
                    {renderScores(item.lastEvent.payload)}
                  </div>
                )}
              </div>
              <div className="flex gap-2 sm:shrink-0 items-start">
                <Button size="sm" variant="ghost" onClick={() => openDetail(item.id)}>
                  <Shield size={14} className="mr-1" /> Detail
                </Button>
                <Button size="sm" variant="success" onClick={() => approveKyc(item.id)}>
                  <CheckCircle size={14} className="mr-1" /> Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => rejectKyc(item.id)}>
                  <XCircle size={14} className="mr-1" /> Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {pendingKyc.length === 0 && (
          <Card>
            <p className="text-text-secondary text-center py-8">No pending KYC applications</p>
          </Card>
        )}
      </div>

      {showDetail && kycDetail && (
        <Modal onClose={() => setShowDetail(false)}>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary">KYC Detail</h2>
            <div className="text-sm text-text-secondary space-y-2">
              <p><span className="font-semibold text-text-primary">Profile ID:</span> {kycDetail.profile?.id}</p>
              <p><span className="font-semibold text-text-primary">User:</span> {kycDetail.profile?.user?.email} (Tier {kycDetail.profile?.user?.kycTier})</p>
              <p><span className="font-semibold text-text-primary">Tier:</span> {kycDetail.profile?.tier} · Status: {kycDetail.profile?.status}</p>
              <p><span className="font-semibold text-text-primary">Name:</span> {kycDetail.profile?.fullName}</p>
              <p><span className="font-semibold text-text-primary">DOB:</span> {kycDetail.profile?.dateOfBirth}</p>
              <p><span className="font-semibold text-text-primary">Nationality:</span> {kycDetail.profile?.nationality || "—"}</p>
              <p><span className="font-semibold text-text-primary">Country:</span> {kycDetail.profile?.country}</p>
              <p><span className="font-semibold text-text-primary">Address:</span> {kycDetail.profile?.address || "—"}</p>
              {kycDetail.profile?.diditVerificationId && (
                <p><span className="font-semibold text-text-primary">Didit ID:</span> {kycDetail.profile.diditVerificationId}</p>
              )}
            </div>

            <h3 className="font-semibold text-text-primary pt-2 border-t border-border">Event History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(kycDetail.events || []).map((ev: any) => (
                <div key={ev.id} className="text-xs bg-card-alt rounded p-2 border border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{ev.eventType}</span>
                    <Badge variant={ev.status === "APPROVED" ? "success" : "warning"}>{ev.status}</Badge>
                    <span className="text-text-subtle">{ev.provider}</span>
                    <span className="text-text-subtle ml-auto">{new Date(ev.createdAt).toLocaleString()}</span>
                  </div>
                  {ev.rawPayload && (
                    <pre className="text-[10px] text-text-subtle mt-1 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(ev.rawPayload, null, 1).slice(0, 500)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
