import { Routes, Route, } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

import AuthRoute from "./routes/AuthRoute"; 
import SupervisorRoute from "./routes/SupervisorRoute";
import RedirectIfAuth from "./routes/RedirectIfAuth";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

import SupervisorDashboard from "./pages/Supervisor/SupervisorDashboard";
import SupervisorReports from "./pages/Supervisor/SupervisorReports";


import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles"; 
import NotFound from "./pages/OtherPage/NotFound";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        
        {/* === Rute Auth (Publik) === */}
        <Route element={<RedirectIfAuth />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* === Rute Dashboard (Wajib Login) === */}
        <Route element={<AuthRoute />}>
          <Route element={<AppLayout />}>
            
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<UserProfiles />} />

          
            <Route element={<SupervisorRoute />}>
              <Route
                path="/supervisor/dashboard"
                element={<SupervisorDashboard />}
              />
              <Route
                path="/supervisor/reports"
                element={<SupervisorReports />}
              />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </>
  );
}