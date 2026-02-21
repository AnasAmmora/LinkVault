import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
