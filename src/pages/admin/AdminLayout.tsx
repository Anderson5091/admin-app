import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Shield, Scale, AlertTriangle, Ban, Bell, ChevronLeft, LogOut, GitBranch, Activity, Radio, Database, UserCog, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import { connectAdminStream, disconnectAdminStream } from "../../features/admin/ws.service";
import { useAdminStreamStore } from "../../features/admin/stream.store";
import { getAccessiblePages } from "../../features/admin/roles";

const navIconMap: Record<string, any> = {
  "/": LayoutDashboard,
  "/live": Radio,
  "/users": Users,
  "/kyc": Shield,
  "/cases": Scale,
  "/payouts": AlertTriangle,
  "/fraud": Ban,
  "/system": Activity,
  "/treasury": Database,
  "/partners": GitBranch,
  "/agents": UserCog,
  "/admins": ShieldCheck,
  "/notifications": Bell,
};

const navLabelMap: Record<string, string> = {
  "/": "Dashboard",
  "/live": "Live Feed",
  "/users": "Users",
  "/kyc": "KYC Review",
  "/cases": "Compliance Cases",
  "/payouts": "Payout Monitor",
  "/fraud": "Fraud Investigation",
  "/system": "System Health",
  "/treasury": "Treasury",
  "/partners": "Partners",
  "/agents": "Agents",
  "/admins": "Admins",
  "/notifications": "Notifications",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "text-purple-400 bg-purple-900/30",
  COMPLIANCE: "text-blue-400 bg-blue-900/30",
  OPS: "text-warning bg-warning-dim",
  TREASURY: "text-primary bg-primary-dim",
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { unreadNotifications, fetchNotifications } = useAdminStore();
  const { profile, logout } = useAuthStore();
  const connected = useAdminStreamStore((s) => s.connected);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    connectAdminStream();
    return () => disconnectAdminStream();
  }, []);

  const handleLogout = () => {
    disconnectAdminStream();
    logout();
    navigate("/login");
  };

  const accessiblePaths = getAccessiblePages(profile?.role);
  const navItems = accessiblePaths.map((path) => ({
    to: path,
    icon: navIconMap[path],
    label: navLabelMap[path],
    end: path === "/",
  }));

  return (
    <div className="min-h-screen bg-app-page flex">
      {/* Sidebar */}
      <aside className={`bg-app-bg border-r border-border flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">A</div>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary text-sm leading-tight">Admin Panel</span>
                {profile && (
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${roleColors[profile.role]?.split(" ")[0] || "text-text-secondary"}`}>
                    {profile.role}
                  </span>
                )}
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-card-alt text-text-subtle hover:text-text-primary transition-colors">
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-primary-dim text-primary border border-primary-border" : "text-text-secondary hover:text-text-primary hover:bg-card border border-transparent"
                }`
              }
            >
              <div className="relative">
                <item.icon size={18} />
                {item.label === "Notifications" && unreadNotifications > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
                {item.label === "Live Feed" && (
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${connected ? "bg-primary" : "bg-danger"} ${connected ? "animate-pulse" : ""}`} />
                )}
              </div>
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {item.label === "Notifications" && unreadNotifications > 0 && (
                    <span className="bg-danger-dim text-danger text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {!collapsed && profile && (
            <div className="px-3 py-1.5">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-danger"}`} />
                <span className="text-[10px] text-text-subtle uppercase tracking-wider">
                  {connected ? "Stream Live" : "Disconnected"}
                </span>
              </div>
              <p className="text-xs text-text-subtle truncate">{profile.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full text-xs text-text-subtle hover:text-danger transition-colors hover:bg-card-alt rounded-lg"
          >
            <LogOut size={14} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-app-page">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
