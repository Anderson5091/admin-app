import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminLayout from "../pages/admin/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import LiveFeed from "../pages/admin/LiveFeed";
import Users from "../pages/admin/Users";
import KycReview from "../pages/admin/KycReview";
import ComplianceCases from "../pages/admin/ComplianceCases";
import PayoutMonitor from "../pages/admin/PayoutMonitor";
import FraudInvestigation from "../pages/admin/FraudInvestigation";
import AdminNotifications from "../pages/admin/Notifications";
import AdminPartners from "../pages/admin/Partners";
import AdminAgents from "../pages/admin/Agents";
import AdminAdmins from "../pages/admin/Admins";
import AdminTreasury from "../pages/admin/Treasury";
import SystemHealth from "../pages/admin/system/SystemHealth";
import Forbidden from "../pages/admin/Forbidden";
import { getToken } from "../utils/token";
import { useAuthStore } from "../features/admin/auth.store";
import { canAccess } from "../features/admin/roles";

function ProtectedRoute({ children, requiredPath }: { children: React.ReactNode; requiredPath?: string }) {
  const token = getToken();
  const profile = useAuthStore.getState().profile;

  if (!token) return <Navigate to="/login" replace />;

  if (requiredPath && profile && !canAccess(requiredPath, profile.role)) {
    return <Forbidden />;
  }

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
      { index: true, element: <ProtectedRoute requiredPath="/"><Dashboard /></ProtectedRoute> },
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
      { path: "admins", element: <ProtectedRoute requiredPath="/admins"><AdminAdmins /></ProtectedRoute> },
      { path: "system", element: <ProtectedRoute requiredPath="/system"><SystemHealth /></ProtectedRoute> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
