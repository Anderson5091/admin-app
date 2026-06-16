import { useEffect } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { ExternalLink } from "lucide-react";

export default function ComplianceCases() {
  const { complianceCases, fetchComplianceCases, escalateCase } = useAdminStore();

  useEffect(() => {
    fetchComplianceCases();
  }, [fetchComplianceCases]);

  const severityBadge = (s: string) => {
    switch (s) {
      case "CRITICAL": return <Badge variant="danger">Critical</Badge>;
      case "HIGH": return <Badge variant="warning">High</Badge>;
      case "MEDIUM": return <Badge variant="info">Medium</Badge>;
      default: return <Badge>Low</Badge>;
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "OPEN": return <Badge variant="warning">Open</Badge>;
      case "INVESTIGATING": return <Badge variant="info">Investigating</Badge>;
      case "ESCALATED": return <Badge variant="danger">Escalated</Badge>;
      case "CLOSED": return <Badge variant="success">Closed</Badge>;
      default: return <Badge>{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Compliance Cases</h1>
        <p className="text-text-secondary text-sm mt-1">{complianceCases.filter(c => c.status !== "CLOSED").length} active cases</p>
      </div>

      <div className="space-y-3">
        {complianceCases.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {severityBadge(c.severity)}
                {statusBadge(c.status)}
                <div>
                  <p className="text-text-primary font-semibold text-sm">{c.type}</p>
                  <p className="text-xs text-text-secondary">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-subtle">{new Date(c.createdAt).toLocaleDateString()}</span>
                {c.status !== "ESCALATED" && c.status !== "CLOSED" && (
                  <Button size="sm" variant="ghost" onClick={() => escalateCase(c.id)}>
                    <ExternalLink size={14} className="mr-1" /> Escalate
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {complianceCases.length === 0 && (
          <Card>
            <p className="text-text-secondary text-center py-8">No compliance cases</p>
          </Card>
        )}
      </div>
    </div>
  );
}
