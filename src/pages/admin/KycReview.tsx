import { useEffect } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export default function KycReview() {
  const { pendingKyc, fetchPendingKyc, approveKyc, rejectKyc } = useAdminStore();

  useEffect(() => {
    fetchPendingKyc();
  }, [fetchPendingKyc]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">KYC Review</h1>
        <p className="text-text-secondary text-sm mt-1">{pendingKyc.length} pending applications</p>
      </div>

      <div className="space-y-4">
        {pendingKyc.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-text-primary font-bold">{item.name || item.email}</h3>
                  <Badge variant="info">Tier {item.tier}</Badge>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{item.email}</p>
                <p className="text-xs text-text-subtle mt-1">Submitted {new Date(item.submittedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => approveKyc(item.id)}>
                  <CheckCircle size={14} className="mr-1" /> Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => rejectKyc(item.id)}>
                  <XCircle size={14} className="mr-1" /> Reject
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(item.documents || []).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 bg-card rounded-lg p-3 border border-border">
                  <FileText size={16} className="text-text-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium capitalize">{(doc.type || "").replace(/_/g, " ")}</p>
                    <Badge variant={doc.status === "PENDING" ? "warning" : doc.status === "APPROVED" ? "success" : "danger"}>
                      {doc.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {pendingKyc.length === 0 && (
          <Card>
            <p className="text-text-secondary text-center py-8">No pending KYC applications</p>
          </Card>
        )}
      </div>
    </div>
  );
}
