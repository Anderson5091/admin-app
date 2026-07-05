import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Shield, Scale, AlertTriangle, Bell, ChevronLeft, LogOut, Activity, Radio, UserCog, ShieldCheck, Handshake, Warehouse, Gavel, Wallet, Send, ArrowUpFromLine, ArrowLeftRight, ScrollText, ExternalLink, ArrowRight, Clock, FileText, Menu, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import { useAuthStore } from "../../features/admin/auth.store";
import { connectAdminStream, disconnectAdminStream } from "../../features/admin/ws.service";
import { useAdminStreamStore } from "../../features/admin/stream.store";
import { canAccess } from "../../features/admin/roles";

const navIconMap: Record<string, any> = {
  "/admins": ShieldCheck,
  "/agents": UserCog,
  "/users": Users,
  "/kyc": Shield,
  "/partners": Handshake,
  "/treasury": Warehouse,
  "/payouts": AlertTriangle,
  "/cases": Scale,
  "/fraud": Gavel,
  "/": LayoutDashboard,
  "/live": Radio,
  "/system": Activity,
  "/notifications": Bell,
  "/agent/deposit": Wallet,
  "/agent/withdraw": Send,
  "/agent/payout": ExternalLink,
  "/agent/transfer": ArrowRight,
  "/agent/topup": ArrowUpFromLine,
  "/agent/reconciliation": FileText,
  "/agent/activity": Activity,
  "/transfers": ArrowLeftRight,
  "/audit": ScrollText,
  "/pending-transfers": Clock,
  "/finance/fees": DollarSign,
};

const navLabelMap: Record<string, string> = {
  "/admins": "Admins",
  "/agents": "Agents",
  "/users": "Users",
  "/kyc": "KYC Review",
  "/partners": "Partners",
  "/treasury": "Treasury",
  "/payouts": "Payout Monitor",
  "/cases": "Compliance Cases",
  "/fraud": "Fraud Investigation",
  "/": "Dashboard",
  "/live": "Live Feed",
  "/system": "System Health",
  "/notifications": "Notifications",
  "/agent/deposit": "Cash Deposit",
  "/agent/withdraw": "Cash Withdraw",
  "/agent/payout": "Payout",
  "/agent/transfer": "Cash Transfer",
  "/agent/topup": "Top Up Agent",
  "/agent/reconciliation": "Reconciliation",
  "/agent/activity": "Activity",
  "/transfers": "Transfers",
  "/audit": "Audit Logs",
  "/pending-transfers": "Pending Transfers",
  "/finance/fees": "Fee Management",
};

const NAV_SECTIONS = [
  { label: "Monitor", paths: ["/", "/notifications", "/live", "/system", "/agent/activity", "/pending-transfers"] },
  { label: "Administration", paths: ["/admins"] },
  { label: "Finance", paths: ["/treasury", "/payouts", "/transfers", "/finance/fees"] },
  { label: "Compliance", paths: ["/cases", "/fraud", "/audit"] },
  { label: "Users", paths: ["/users", "/kyc"] },
  { label: "Agents & Partners", paths: ["/agents", "/partners"] },
  { label: "Agent Operations", paths: ["/agent/deposit", "/agent/withdraw", "/agent/payout", "/agent/transfer", "/agent/topup", "/agent/reconciliation"] },

];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "text-purple-400 bg-purple-900/30",
  ADMIN: "text-purple-400 bg-purple-900/30",
  COMPLIANCE: "text-blue-400 bg-blue-900/30",
  OPS: "text-warning bg-warning-dim",
  TREASURY: "text-primary bg-primary-dim",
  AGENT_PARTNER: "text-violet-400 bg-violet-900/30",
  AGENT_INTERNAL: "text-emerald-400 bg-emerald-900/30",
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    disconnectAdminStream();
    logout();
    navigate("/login");
  };

  const role = profile?.role;

  const isAgent = role === "AGENT_PARTNER" || role === "AGENT_INTERNAL";

  const visibleSections = NAV_SECTIONS
    .filter((section) => section.label !== "Agent Operations" || isAgent)
    .map((section) => ({
      ...section,
      items: section.paths
        .filter((path) => path === "/pending-transfers" ? isAgent : true)
        .filter((path) => canAccess(path, role))
        .map((path) => ({
          to: path,
          icon: navIconMap[path],
          label: navLabelMap[path],
          end: path === "/",
        })),
    }))
    .filter((section) => section.items.length > 0);

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">A</div>
            <div className="flex flex-col">
              <span className="font-bold text-text-primary text-sm leading-tight">
                {profile?.role === "AGENT_PARTNER" || profile?.role === "AGENT_INTERNAL" ? "Agent Panel" : "Admin Panel"}
              </span>
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

      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {visibleSections.map((section) => (
          <div key={section.label || "alerts"}>
            {!collapsed && section.label && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex ${collapsed ? "justify-center p-2 rounded-full" : "items-center gap-3 px-3 py-2.5 rounded-lg"} text-sm font-medium transition-all ${
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
            </div>
          </div>
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
    </>
  );

  return (
    <div className="min-h-screen bg-app-page flex">
      {/* Mobile Top Nav Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden flex items-center gap-3 px-4 h-14 bg-app-bg border-b border-border shadow-sm">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-card-alt text-text-primary transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">A</div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-text-primary text-sm leading-tight truncate">
              {profile?.role === "AGENT_PARTNER" || profile?.role === "AGENT_INTERNAL" ? "Agent Panel" : "Admin Panel"}
            </span>
            {profile && (
              <span className={`text-[9px] font-semibold uppercase tracking-wider truncate ${roleColors[profile.role]?.split(" ")[0] || "text-text-secondary"}`}>
                {profile.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 h-full bg-app-bg border-r border-border flex flex-col transition-all duration-300 z-50 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "w-14" : "w-60"}`}>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex bg-app-bg border-r border-border flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-app-page">
        <div className="max-w-6xl mx-auto p-4 pt-16 lg:pt-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
