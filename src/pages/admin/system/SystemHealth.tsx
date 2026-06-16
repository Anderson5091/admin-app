import { useEffect, useState } from "react";
import { useAdminStore } from "../../../features/admin/admin.store";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { Activity, Server, Database, Shield, Clock, HardDrive, Download, CheckCircle2, XCircle, Loader2, TrendingUp, BarChart3 } from "lucide-react";

export default function SystemHealth() {
  const { systemHealth, systemMetrics, systemStatus, fetchSystemHealth, fetchSystemMetrics, fetchSystemStatus, triggerBackup } = useAdminStore();
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    fetchSystemHealth();
    fetchSystemMetrics();
    fetchSystemStatus();
    const interval = setInterval(() => {
      fetchSystemHealth();
      fetchSystemMetrics();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSystemHealth, fetchSystemMetrics, fetchSystemStatus]);

  const handleBackup = async () => {
    setBackingUp(true);
    await triggerBackup();
    await fetchSystemStatus();
    setBackingUp(false);
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">System Health</h1>
        <p className="text-text-secondary text-sm mt-1">Production infrastructure monitoring and observability</p>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systemHealth ? (
          Object.entries(systemHealth.services).map(([service, status]) => (
            <Card key={service} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status === "UP" ? "bg-primary-dim text-primary" : "bg-danger-dim text-danger"}`}>
                  {service === "database" ? <Database size={18} /> : service === "redis" ? <HardDrive size={18} /> : <Server size={18} />}
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary capitalize">{status === "UP" ? "Operational" : "Down"}</p>
                  <p className="text-xs text-text-secondary capitalize">{service}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-4 col-span-4">
            <div className="flex items-center justify-center h-12">
              <Loader2 size={20} className="animate-spin text-text-secondary" />
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">System Overview</h2>
          </div>
          {systemHealth && (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-secondary">Status</span>
                <Badge variant={systemHealth.status === "OK" ? "success" : "danger"}>
                  {systemHealth.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-secondary">Version</span>
                <span className="text-sm font-mono text-text-primary">v{systemHealth.version}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-secondary">Uptime</span>
                <span className="text-sm text-text-primary flex items-center gap-1.5">
                  <Clock size={14} className="text-text-subtle" />
                  {formatUptime(systemHealth.uptime)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-secondary">Total Requests</span>
                <span className="text-sm font-bold text-text-primary">{systemHealth.metrics.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-text-secondary">Active Traces</span>
                <span className="text-sm font-bold text-text-primary">{systemHealth.metrics.activeTraces}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Safety & Recovery */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Safety & Recovery</h2>
          </div>
          {systemStatus && (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-secondary">System Health</span>
                {systemStatus.healthy ? (
                  <span className="flex items-center gap-1 text-sm text-primary"><CheckCircle2 size={14} /> Healthy</span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-danger"><XCircle size={14} /> Degraded</span>
                )}
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-secondary">Last Backup</span>
                <span className="text-xs font-mono text-text-primary">{systemStatus.lastBackup || "Never"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-text-secondary">Available Backups</span>
                <span className="text-sm font-bold text-text-primary">{systemStatus.availableBackups}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-text-secondary">Disk Usage</span>
                <span className="text-xs font-mono text-text-primary">{systemStatus.disk}</span>
              </div>
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:opacity-80 transition-colors px-3 py-2 rounded-lg hover:bg-primary-dim border border-primary-border"
              >
                {backingUp ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {backingUp ? "Backing up..." : "Trigger Manual Backup"}
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* API Metrics */}
      {systemMetrics && (
        <>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-violet-400" />
              <h2 className="text-lg font-bold text-text-primary">Request Counters</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {systemMetrics.counters.slice(0, 8).map((counter) => (
                <div key={counter.name} className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-lg font-bold text-text-primary">{counter.count.toLocaleString()}</p>
                  <p className="text-[10px] text-text-secondary uppercase mt-0.5 break-all">{counter.name.replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-warning" />
              <h2 className="text-lg font-bold text-text-primary">API Latency (ms)</h2>
            </div>
            <div className="space-y-2">
              {systemMetrics.latencies.map((latency) => (
                <div key={latency.name} className="bg-card rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-text-primary">{latency.name}</span>
                    <span className="text-xs text-text-subtle">{latency.count.toLocaleString()} requests</span>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{latency.avg}</p>
                      <p className="text-[9px] text-text-subtle uppercase">Avg</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-secondary">{latency.min}</p>
                      <p className="text-[9px] text-text-subtle uppercase">Min</p>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${latency.max > 2000 ? "text-danger" : "text-warning"}`}>{latency.max}</p>
                      <p className="text-[9px] text-text-subtle uppercase">Max</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
