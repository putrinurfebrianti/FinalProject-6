import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../context/AuthContext"; 

const AdminRoute = () => {
  const { user } = useAuth();

  if (user && user.role === 'superadmin') {
    return <Outlet />; 
  }

  return <Navigate to="/signin" replace />;
};

export default AdminRoute;