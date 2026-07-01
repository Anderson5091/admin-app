import { useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Search, AlertTriangle, MapPin, RefreshCw } from "lucide-react";

export default function FraudInvestigation() {
  const { fraudAnalysis, analyzeFraud, loading } = useAdminStore();
  const [searchId, setSearchId] = useState("");

  const handleAnalyze = () => {
    if (searchId.trim()) {
      analyzeFraud(searchId.trim());
    }
  };

  const riskColor = (score: number) => {
    if (score >= 70) return "text-danger";
    if (score >= 40) return "text-warning";
    return "text-primary";
  };

  const riskBg = (score: number) => {
    if (score >= 70) return "bg-danger-dim border-danger/30";
    if (score >= 40) return "bg-warning-dim border-warning/30";
    return "bg-primary-dim border-primary-border";
  };

  const riskLabel = (score: number) => {
    if (score >= 70) return "High Risk";
    if (score >= 40) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Fraud Investigation</h1>
        <p className="text-text-secondary text-xs sm:text-sm mt-1">Analyze user activity for suspicious patterns</p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder="Enter User ID to analyze..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card-alt border border-border text-text-primary text-sm placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button onClick={handleAnalyze} isLoading={loading} className="w-full sm:w-auto">
            <Search size={16} className="mr-1" /> Analyze
          </Button>
        </div>
      </Card>

      {/* Results */}
      {fraudAnalysis && (
        <div className="space-y-6">
          {/* Risk Score */}
          <Card className={`border ${riskBg(fraudAnalysis.riskScore)}`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-secondary">User</p>
                <p className="text-text-primary font-bold text-base sm:text-lg truncate">{fraudAnalysis.email}</p>
                <p className="text-xs text-text-subtle">ID: {fraudAnalysis.userId}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-text-secondary">Risk Score</p>
                <p className={`text-3xl sm:text-4xl font-extrabold ${riskColor(fraudAnalysis.riskScore)}`}>
                  {fraudAnalysis.riskScore}
                </p>
                <p className={`text-sm font-semibold ${riskColor(fraudAnalysis.riskScore)}`}>
                  {riskLabel(fraudAnalysis.riskScore)}
                </p>
              </div>
            </div>
          </Card>

          {/* Flags */}
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" />
              Risk Flags
            </h2>
            <div className="flex flex-wrap gap-2">
              {fraudAnalysis.flags.map((flag) => (
                <Badge key={flag} variant="danger">{flag}</Badge>
              ))}
              {fraudAnalysis.flags.length === 0 && (
                <p className="text-sm text-text-secondary">No risk flags detected</p>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-text-primary">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {fraudAnalysis.recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-0.5 shrink-0" />
                  <p className="flex-1 text-sm text-text-primary">{act.action}</p>
                  <span className="text-xs text-text-subtle shrink-0">{new Date(act.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {!fraudAnalysis && !loading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin size={32} className="text-text-subtle mb-3" />
            <p className="text-text-secondary font-medium">Enter a User ID to begin investigation</p>
            <p className="text-xs text-text-subtle mt-1">e.g., usr_1, usr_2, usr_100</p>
          </div>
        </Card>
      )}
    </div>
  );
}
