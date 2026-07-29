import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { routeForUser } from "./utils/routeForUser";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetCode from "./pages/VerifyResetCode";
import ResetPassword from "./pages/ResetPassword";

import AdminDashboard from "./pages/AdminDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import StudentParentPortal from "./pages/StudentParentPortal";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
      Loading…
    </div>
  );
}

function ProtectedRoute({ user, loading, allow, children }) {
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={routeForUser(user)} replace />;
  return children;
}

function AppRoutes() {
  const { user, loading, refetch } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/login"
          element={
            loading ? (
              <LoadingScreen />
            ) : user ? (
              <Navigate to={routeForUser(user)} replace />
            ) : (
              <LoginPage onAuthed={refetch} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} loading={loading} allow={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderator"
          element={
            <ProtectedRoute user={user} loading={loading} allow={["moderator"]}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute user={user} loading={loading} allow={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian"
          element={
            <ProtectedRoute user={user} loading={loading} allow={["librarian"]}>
              <LibrarianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal"
          element={
            <ProtectedRoute user={user} loading={loading} allow={["student", "parent"]}>
              <StudentParentPortal />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" theme="light" autoClose={3000} />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
