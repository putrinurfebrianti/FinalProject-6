import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const RedirectIfAuth = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/supervisor/dashboard" />;
  }

  return <Outlet />;
};

export default RedirectIfAuth;