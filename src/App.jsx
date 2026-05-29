import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./components/AdminLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tenants from "./pages/Tenants.jsx";
import TenantDetail from "./pages/TenantDetail.jsx";
import Payments from "./pages/Payments.jsx";
import Plans from "./pages/Plans.jsx";
import AuditLog from "./pages/AuditLog.jsx";
import Support from "./pages/Support.jsx";
import SupportDetail from "./pages/SupportDetail.jsx";
import System from "./pages/System.jsx";

function RequireAuth({ children }) {
  const token = localStorage.getItem("platform_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="payments" element={<Payments />} />
          <Route path="plans" element={<Plans />} />
          <Route path="support" element={<Support />} />
          <Route path="support/:id" element={<SupportDetail />} />
          <Route path="system" element={<System />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
