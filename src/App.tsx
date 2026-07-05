import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useAuthStore } from "./features/admin/auth.store";
import { setupInterceptors } from "./api/interceptors";

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    setupInterceptors();
    fetchProfile();
  }, [fetchProfile]);

  return <RouterProvider router={router} />;
}
