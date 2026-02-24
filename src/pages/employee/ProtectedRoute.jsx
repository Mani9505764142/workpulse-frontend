import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true";

  const role = localStorage.getItem("role");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // ✅ ADMIN can access everything
  if (role === "ADMIN") {
    return <Outlet />;
  }

  // ✅ EMPLOYEE-only routes
  if (allowedRole === "EMPLOYEE" && role === "EMPLOYEE") {
    return <Outlet />;
  }

  // ❌ fallback
  return <Navigate to="/" replace />;
}
