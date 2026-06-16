import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="p-3 rounded-lg bg-danger-dim border border-danger/30 mb-4">
        <Shield size={32} className="text-danger" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Access Denied</h2>
      <p className="text-text-secondary text-sm mb-4 max-w-sm">
        Your admin role does not have permission to access this page. Contact a SUPER_ADMIN to request access.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] hover:opacity-90 text-white text-sm font-semibold transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
