import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { attachToken } from "./api/client";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import FleetPage from "./pages/Fleet";
import VehicleDetailPage from "./pages/VehicleDetail";
import FuelPage from "./pages/Fuel";
import MaintenancePage from "./pages/Maintenance";
import WaybillsPage from "./pages/Waybills";
import InspectionsPage from "./pages/Inspections";
import WarehousesPage from "./pages/Warehouses";
import OrdersPage from "./pages/Orders";
import FinesPage from "./pages/Fines";
import TiresPage from "./pages/Tires";
import ReportsPage from "./pages/Reports";

function ProtectedLayout() {
  const { token } = useAuth();
  attachToken(token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/fleet/:id" element={<VehicleDetailPage />} />
          <Route path="/fuel" element={<FuelPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/waybills" element={<WaybillsPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/fines" element={<FinesPage />} />
          <Route path="/tires" element={<TiresPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
