import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Sesuaikan path jika perlu

const SupervisorRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthorized =
    user && (user.role === "supervisor" || user.role === "superadmin");

  if (!isAuthorized) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default SupervisorRoute;