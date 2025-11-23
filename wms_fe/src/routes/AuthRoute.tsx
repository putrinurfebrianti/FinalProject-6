import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const AuthRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthRoute;