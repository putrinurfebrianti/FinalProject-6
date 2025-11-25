import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const AdminRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthorized =
    user && (user.role === "admin" || user.role === "superadmin");

  if (!isAuthorized) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
