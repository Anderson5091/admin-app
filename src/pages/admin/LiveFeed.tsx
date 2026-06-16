import { useEffect, useRef } from "react";
import { useAdminStreamStore } from "../../features/admin/stream.store";
import Card from "../../components/ui/Card";
import { Radio, Activity, AlertTriangle, ArrowUpDown } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING_PAYOUT: "text-warning",
  SENT_TO_PARTNER: "text-secondary",
  COMPLETED: "text-primary",
  FAILED: "text-danger",
  CONFIRMED: "text-primary",
  PAYOUT_FAILED: "text-danger",
};

export default function LiveFeed() {
  const { liveTransactions, payoutUpdates, alerts, adminEvents, connected, systemStatus, clearTransactions } = useAdminStreamStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveTransactions.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Live Transaction Feed</h1>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              connected ? "bg-primary-dim text-primary" : "bg-danger-dim text-danger"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-danger"}`} />
              {connected ? "Live" : "Disconnected"}
            </div>
          </div>
          <p className="text-text-secondary text-sm mt-1">Real-time transaction streaming via WebSocket</p>
        </div>
        <button
          onClick={clearTransactions}
          className="text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
        >
          Clear Feed
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Transaction Feed */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Radio size={16} className="text-primary" />
              <h2 className="text-lg font-bold text-text-primary">Transactions</h2>
              <span className="text-xs text-text-subtle ml-auto">{liveTransactions.length} events</span>
            </div>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {liveTransactions.length === 0 ? (
                <p className="text-text-subtle text-sm py-8 text-center">Waiting for transactions...</p>
              ) : (
                liveTransactions.map((tx, i) => (
                  <div key={`${tx.id}-${i}`} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-text-secondary">{tx.referenceId || tx.id.slice(0, 8)}</span>
                        <span className={`text-xs font-semibold ${statusColors[tx.status] || "text-text-secondary"}`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-sm text-text-primary font-medium">${Number(tx.amount).toLocaleString()}</span>
                        <span className="text-[10px] text-text-subtle">{tx.payoutMethod}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-text-subtle shrink-0">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </Card>

          {/* Admin Events */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-violet-400" />
              <h2 className="text-lg font-bold text-text-primary">System Events</h2>
              <span className="text-xs text-text-subtle ml-auto">{adminEvents.length} events</span>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {adminEvents.length === 0 ? (
                <p className="text-text-subtle text-sm py-8 text-center">Waiting for events...</p>
              ) : (
                adminEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-text-primary">{ev.eventType}</span>
                      <span className="text-[10px] text-text-subtle ml-2">
                        {ev.payload?.entity as string}:{String(ev.payload?.entityId || "").slice(0, 8)}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-subtle shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* System Status */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-primary" />
              <h3 className="text-sm font-bold text-text-primary">System Status</h3>
            </div>
            {systemStatus ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Events Logged</span>
                  <span className="text-text-primary font-mono">{systemStatus.eventCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Active Admins</span>
                  <span className="text-text-primary font-mono">{systemStatus.connectedAdmins}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Connected Users</span>
                  <span className="text-text-primary font-mono">{systemStatus.connectedUsers}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Uptime</span>
                  <span className="text-text-primary font-mono">{Math.floor(systemStatus.uptime / 3600)}h {Math.floor((systemStatus.uptime % 3600) / 60)}m</span>
                </div>
              </div>
            ) : (
              <p className="text-text-subtle text-xs">Waiting for status...</p>
            )}
          </Card>

          {/* Payout Updates */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown size={14} className="text-warning" />
              <h3 className="text-sm font-bold text-text-primary">Payout Updates</h3>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {payoutUpdates.length === 0 ? (
                <p className="text-text-subtle text-xs py-4 text-center">No payout updates yet</p>
              ) : (
                payoutUpdates.map((pu, i) => (
                  <div key={i} className="flex items-start gap-2 pb-2 border-b border-border last:border-0">
                    <div className="w-1 h-1 rounded-full bg-warning mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-semibold ${statusColors[pu.status] || "text-text-secondary"}`}>
                        {pu.status}
                      </span>
                      <p className="text-[10px] text-text-subtle truncate">{pu.partner || "N/A"}</p>
                    </div>
                    <span className="text-[9px] text-text-subtle shrink-0">
                      {new Date(pu.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Alerts */}
          {alerts.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-danger" />
                <h3 className="text-sm font-bold text-text-primary">Alerts</h3>
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert, i) => (
                  <div key={i} className={`border-l-2 pl-2 py-1 ${
                    alert.severity === "CRITICAL" ? "border-l-danger" :
                    alert.severity === "HIGH" ? "border-l-orange-500" :
                    alert.severity === "MEDIUM" ? "border-l-warning" : "border-l-border"
                  }`}>
                    <p className="text-[10px] text-text-secondary">{alert.message}</p>
                    <span className="text-[9px] text-text-subtle">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
