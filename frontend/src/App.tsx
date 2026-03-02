import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import SetPasswordPage from "@/pages/auth/SetPasswordPage";
import PatientDashboard from "@/pages/dashboards/patient/PatientDashboard";
import DoctorDashboard from "@/pages/dashboards/doctor/DoctorDashboard";
import StaffDashboard from "@/pages/dashboards/staff/StaffDashboard";
import AdminDashboard from "@/pages/dashboards/admin/AdminDashboard";
import PharmacyDashboard from "@/pages/dashboards/pharmacy/PharmacyDashboard";
import NotFound from "./pages/NotFound";
import AnalyticsPage from "./pages/dashboards/admin/AnalyticsPage";
import AIInsightsPage from "./pages/dashboards/admin/AIInsightsPage";
import AppointmentsPage from "./pages/dashboards/admin/AppointmentsPage";
import DoctorsPage from "./pages/dashboards/admin/DoctorsPage";
import StaffPage from "./pages/dashboards/admin/StaffPage";
import PatientsPage from "./pages/dashboards/admin/PatientsPage";
import PharmacyPage from "./pages/dashboards/admin/PharmacyPage";
import AdminSettingsPage from "./pages/dashboards/admin/AdminSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Patient Routes */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<PatientDashboard />} />
            </Route>

            {/* Doctor Routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DoctorDashboard />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StaffDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="ai-insights" element={<AIInsightsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="pharmacy" element={<PharmacyPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Pharmacy Routes */}
            <Route path="/pharmacy" element={
              <ProtectedRoute allowedRoles={['pharmacy']}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<PharmacyDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
