import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/admin/auth.store";
import Modal from "./ui/Modal";

export default function SessionExpiredModal() {
  const navigate = useNavigate();
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired);
  const logout = useAuthStore((s) => s.logout);

  const handleClose = () => {
    setSessionExpired(false);
    navigate("/login");
  };

  const handleSignInAgain = () => {
    logout();
    navigate("/login");
  };

  return (
    <Modal open={sessionExpired} onClose={handleClose} title="Session Expired">
      <p className="text-text-secondary text-sm mb-5">
        Your session has expired due to inactivity. Please sign in again to continue.
      </p>
      <button
        onClick={handleSignInAgain}
        className="w-full px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Sign In Again
      </button>
    </Modal>
  );
}