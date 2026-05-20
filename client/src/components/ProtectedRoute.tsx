import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#18181b] border-t-transparent" />
          <p className="text-xs font-light tracking-widest text-[#71717a] uppercase">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
