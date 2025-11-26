import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CustomerRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthorized = user && user.role === "user";

  if (!isAuthorized) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default CustomerRoute;
