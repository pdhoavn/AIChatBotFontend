// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/Auth";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading, checkTokenValidity } = useAuth();
  const location = useLocation();

  // Check token validity on every page access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      checkTokenValidity();
    }
  }, [location.pathname, isLoading, isAuthenticated, checkTokenValidity]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // chuyển tới /login, nhớ vị trí cũ
    return <Navigate to="/loginforad" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
