import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../context/AuthContext"; 

const AdminRoute = () => {
  const { user } = useAuth();

  // 1. Cek apakah user ada?
  // 2. Cek apakah rolenya 'superadmin'?
  if (user && user.role === 'superadmin') {
    // 3. Jika ya, izinkan akses ke halaman
    return <Outlet />; 
  }

  // 4. Jika tidak, "usir" ke halaman Sign In
  return <Navigate to="/signin" replace />;
};

export default AdminRoute;