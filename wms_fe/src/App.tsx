import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

import AuthRoute from "./routes/AuthRoute";
import SupervisorRoute from "./routes/SupervisorRoute";
import AdminRoute from "./routes/AdminRoute";
import RedirectIfAuth from "./routes/RedirectIfAuth";
import CustomerRoute from "./routes/CustomerRoute";

// === AUTH PAGES ===
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// === CUSTOMER PAGES ===
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ProductCatalog from "./pages/Customer/ProductCatalog";
import OrderForm from "./pages/Customer/OrderForm";
import MyOrders from "./pages/Customer/MyOrders";

// === SUPERVISOR PAGES ===
import SupervisorDashboard from "./pages/Supervisor/SupervisorDashboard";
import SupervisorReports from "./pages/Supervisor/SupervisorReports";

// === ADMIN PAGES ===
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBranchStock from "./pages/admin/AdminBranchStock";
import AdminOutbounds from "./pages/admin/AdminOutbounds";
import AdminReports from "./pages/admin/AdminReports";

// === COMMON PAGES ===
import UserProfiles from "./pages/UserProfiles";
import NotFound from "./pages/OtherPage/NotFound";

import SuperadminDashboard from "./pages/Superadmin/Dashboard"; // Halaman Dashboard baru
import SuperadminProducts from "./pages/Superadmin/Products"; // Halaman Products baru
import SuperadminBranchStock from "./pages/Superadmin/Branchstock";
import SuperadminInbound from "./pages/Superadmin/Inbound";
import SuperadminUsers from "./pages/Superadmin/Users";
import SuperadminBranches from "./pages/Superadmin/Branches";
import SuperadminActivityLogs from "./pages/Superadmin/ActivityLogs";
import SuperAdminRoute from "./routes/SuperAdminRoute";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* === PUBLIC AUTH ROUTES === */}
        <Route element={<RedirectIfAuth />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* === PROTECTED ROUTES === */}
        <Route element={<AuthRoute />}>
          <Route element={<AppLayout />}>

            {/* ==== CUSTOMER ONLY ==== */}
            <Route element={<CustomerRoute />}>
              <Route path="/" element={<CustomerDashboard />} />
              <Route path="/books" element={<ProductCatalog />} />
              <Route path="/order" element={<OrderForm />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>

            {/* ==== COMMON AFTER LOGIN ==== */}
            <Route path="/profile" element={<UserProfiles />} />

            {/* ==== SUPERVISOR ==== */}
            <Route element={<SupervisorRoute />}>
              <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
              <Route path="/supervisor/reports" element={<SupervisorReports />} />
            </Route>

            {/* ==== ADMIN ==== */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/stock" element={<AdminBranchStock />} />
              <Route path="/admin/outbounds" element={<AdminOutbounds />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>

            {/* ==== ADMIN ==== */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/superadmin/dashboard" element={<SuperadminDashboard />} />
              <Route path="/superadmin/products" element={<SuperadminProducts />} />
              <Route path="/superadmin/branchstock" element={<SuperadminBranchStock />} />
              <Route path="/superadmin/inbound" element={<SuperadminInbound />} />
              <Route path="/superadmin/users" element={<SuperadminUsers />} />
              <Route path="/superadmin/branches" element={<SuperadminBranches />} />
              <Route path="/superadmin/activitylogs" element={<SuperadminActivityLogs />} />
            </Route>

          </Route>
        </Route>

        {/* === 404 === */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  );
}
