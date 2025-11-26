import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RedirectIfAuth = () => {
  const { user } = useAuth();

  if (user) {
    switch (user.role) {
      case "user":
        return <Navigate to="/" replace />;
      case "supervisor":
        return <Navigate to="/supervisor/dashboard" replace />;
      case "admin":
      case "superadmin":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default RedirectIfAuth;
