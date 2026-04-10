import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./protectedroute";
import DashboardLayout from "../layout/dashboardlayout";
import { ROLES } from "../units/constants";

const LoginPage = lazy(() => import("../pages/auth/login"));
const RegisterPage = lazy(() => import("../pages/auth/register"));
const DashboardPage = lazy(() => import("../pages/dashboard/dashboard"));
const AnalyticsPage = lazy(() => import("../pages/dashboard/analytics"));
const UsersPage = lazy(() => import("../pages/users/user"));
const ProductsPage = lazy(() => import("../pages/products"));
const TasksPage = lazy(() => import("../pages/tasks"));
const ActivityPage = lazy(() => import("../pages/activity"));
const NotificationsPage = lazy(() => import("../pages/notifications"));
const ProfilePage = lazy(() => import("../pages/profile"));
const SettingsPage = lazy(() => import("../pages/settings/settings"));
const NotFoundPage = lazy(() => import("../pages/notfound"));
const ServerErrorPage = lazy(() => import("../pages/servererror"));

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
