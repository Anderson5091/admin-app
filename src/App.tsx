import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useAuthStore } from "./features/admin/auth.store";

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return <RouterProvider router={router} />;
}
