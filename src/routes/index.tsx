import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminLayout from "../pages/admin/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import AgentDashboard from "../pages/admin/AgentDashboard";
import PendingTransfers from "../pages/admin/PendingTransfers";
import PayoutExecute from "../pages/admin/PayoutExecute";
import LiveFeed from "../pages/admin/LiveFeed";
import Users from "../pages/admin/Users";
import KycReview from "../pages/admin/KycReview";
import ComplianceCases from "../pages/admin/ComplianceCases";
import PayoutMonitor from "../pages/admin/PayoutMonitor";
import FraudInvestigation from "../pages/admin/FraudInvestigation";
import AdminNotifications from "../pages/admin/Notifications";
import AdminPartners from "../pages/admin/Partners";
import AdminAgents from "../pages/admin/Agents";
import AdminAgentDetail from "../pages/admin/AgentDetail";
import AdminAgentTransactions from "../pages/admin/AgentTransactions";
import AdminAgentTopUp from "../pages/admin/AgentTopUp";
import AgentDeposit from "../pages/admin/AgentDeposit";
import AgentWithdraw from "../pages/admin/AgentWithdraw";
import AgentPayout from "../pages/admin/AgentPayout";
import AgentTransfer from "../pages/admin/AgentTransfer";
import AgentTopUpAgent from "../pages/admin/AgentTopUpAgent";
import AgentActivity from "../pages/admin/AgentActivity";
import AdminAdmins from "../pages/admin/Admins";
import AdminTreasury from "../pages/admin/Treasury";
import AdminTransfers from "../pages/admin/Transfers";
import AdminAudit from "../pages/admin/Audit";
import SystemHealth from "../pages/admin/system/SystemHealth";
import Forbidden from "../pages/admin/Forbidden";
import ReconciliationWorksheet from "../pages/admin/ReconciliationWorksheet";
import { getToken } from "../utils/token";
import { useAuthStore } from "../features/admin/auth.store";
import { canAccess } from "../features/admin/roles";

function ProtectedRoute({ children, requiredPath }: { children: React.ReactNode; requiredPath?: string }) {
  const token = getToken();
  const profile = useAuthStore((s) => s.profile);

  if (!token) return <Navigate to="/login" replace />;

  if (requiredPath && profile && !canAccess(requiredPath, profile.role)) {
    return <Forbidden />;
  }

  return <>{children}</>;
}

function IndexPage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role;
  if (role === "AGENT_PARTNER" || role === "AGENT_INTERNAL") {
    return <ProtectedRoute requiredPath="/"><AgentDashboard /></ProtectedRoute>;
  }
  return <ProtectedRoute requiredPath="/"><Dashboard /></ProtectedRoute>;
}

function RouteGuard({ children, adminFallback }: { children: React.ReactNode; adminFallback: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const isAgent = profile?.role === "AGENT_PARTNER" || profile?.role === "AGENT_INTERNAL";
  if (!isAgent) return <>{adminFallback}</>;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <IndexPage /> },
      { path: "live", element: <ProtectedRoute requiredPath="/live"><LiveFeed /></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute requiredPath="/users"><Users /></ProtectedRoute> },
      { path: "kyc", element: <ProtectedRoute requiredPath="/kyc"><KycReview /></ProtectedRoute> },
      { path: "cases", element: <ProtectedRoute requiredPath="/cases"><ComplianceCases /></ProtectedRoute> },
      { path: "payouts", element: <ProtectedRoute requiredPath="/payouts"><PayoutMonitor /></ProtectedRoute> },
      { path: "fraud", element: <ProtectedRoute requiredPath="/fraud"><FraudInvestigation /></ProtectedRoute> },
      { path: "treasury", element: <ProtectedRoute requiredPath="/treasury"><AdminTreasury /></ProtectedRoute> },
      { path: "notifications", element: <ProtectedRoute requiredPath="/notifications"><AdminNotifications /></ProtectedRoute> },
      { path: "partners", element: <ProtectedRoute requiredPath="/partners"><AdminPartners /></ProtectedRoute> },
      { path: "agents", element: <ProtectedRoute requiredPath="/agents"><AdminAgents /></ProtectedRoute> },
      { path: "agents/topup", element: <ProtectedRoute requiredPath="/agents/topup"><AdminAgentTopUp /></ProtectedRoute> },
      { path: "agents/:id", element: <ProtectedRoute requiredPath="/agents"><AdminAgentDetail /></ProtectedRoute> },
      { path: "agents/:id/transactions", element: <ProtectedRoute requiredPath="/agents"><AdminAgentTransactions /></ProtectedRoute> },
      { path: "admins", element: <ProtectedRoute requiredPath="/admins"><AdminAdmins /></ProtectedRoute> },
      { path: "system", element: <ProtectedRoute requiredPath="/system"><SystemHealth /></ProtectedRoute> },
      { path: "agent/deposit", element: <ProtectedRoute requiredPath="/agent/deposit"><AgentDeposit /></ProtectedRoute> },
      { path: "agent/withdraw", element: <ProtectedRoute requiredPath="/agent/withdraw"><AgentWithdraw /></ProtectedRoute> },
      { path: "agent/payout", element: <ProtectedRoute requiredPath="/agent/payout"><AgentPayout /></ProtectedRoute> },
      { path: "agent/transfer", element: <ProtectedRoute requiredPath="/agent/transfer"><AgentTransfer /></ProtectedRoute> },
      { path: "agent/topup", element: <ProtectedRoute requiredPath="/agent/topup"><AgentTopUpAgent /></ProtectedRoute> },
{ path: "agent/reconciliation", element: <ProtectedRoute requiredPath="/agent/reconciliation"><ReconciliationWorksheet /></ProtectedRoute> },
      { path: "agent/activity", element: <ProtectedRoute requiredPath="/agent/activity"><AgentActivity /></ProtectedRoute> },
      { path: "transfers", element: <ProtectedRoute requiredPath="/transfers"><AdminTransfers /></ProtectedRoute> },
      { path: "audit", element: <ProtectedRoute requiredPath="/audit"><AdminAudit /></ProtectedRoute> },
      { path: "pending-transfers", element: (
        <ProtectedRoute requiredPath="/">
          <RouteGuard adminFallback={<Navigate to="/" replace />}>
            <PendingTransfers />
          </RouteGuard>
        </ProtectedRoute>
      )},
      { path: "pending-transfers/:referenceId", element: (
        <ProtectedRoute requiredPath="/">
          <RouteGuard adminFallback={<Navigate to="/" replace />}>
            <PayoutExecute />
          </RouteGuard>
        </ProtectedRoute>
      )},
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
