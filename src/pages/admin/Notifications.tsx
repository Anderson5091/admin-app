import { useEffect } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import { Bell, CheckCheck, AlertCircle, Clock } from "lucide-react";

const severityColor = (s: string) => {
  switch (s) {
    case "CRITICAL": return "border-l-danger bg-danger-dim";
    case "HIGH": return "border-l-orange-500 bg-orange-900/10";
    case "MEDIUM": return "border-l-warning bg-warning-dim";
    default: return "border-l-border bg-card-alt";
  }
};

const severityIcon = (s: string) => {
  switch (s) {
    case "CRITICAL": return "text-danger";
    case "HIGH": return "text-orange-400";
    case "MEDIUM": return "text-warning";
    default: return "text-text-secondary";
  }
};

export default function Notifications() {
  const { notifications, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useAdminStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">System alerts and operational notifications</p>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-dim border border-primary-border"
        >
          <CheckCheck size={14} />
          <span>Mark All Read</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-card-alt rounded-full flex items-center justify-center text-text-subtle mb-3">
              <Bell size={22} />
            </div>
            <h3 className="text-text-primary font-bold text-sm">No notifications</h3>
            <p className="text-text-subtle text-xs mt-1">All caught up!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                if (notification.status === "UNREAD") markNotificationRead(notification.id);
              }}
              className={`w-full text-left border-l-4 p-4 rounded-r-lg transition-all ${
                severityColor(notification.severity)
              } ${notification.status === "UNREAD" ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <AlertCircle size={14} className={`mt-0.5 shrink-0 ${severityIcon(notification.severity)}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase ${severityIcon(notification.severity)}`}>
                        {notification.severity}
                      </span>
                      {notification.status === "UNREAD" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mt-0.5">{notification.title}</h4>
                    <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-text-subtle">
                      <Clock size={10} />
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
