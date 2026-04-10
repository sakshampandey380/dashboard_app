export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const USER_STATUS = ["active", "inactive"];
export const PRODUCT_STATUS = ["active", "inactive"];
export const TASK_STATUS = ["todo", "in-progress", "done"];
export const TASK_PRIORITY = ["low", "medium", "high"];

export const NOTIFICATION_TYPES = {
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
};

export const CHART_COLORS = {
  light: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"],
  dark: ["#60a5fa", "#34d399", "#a78bfa", "#fbbf24", "#22d3ee"],
};

export const ADMIN_MENU = [
  { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  { label: "Analytics", path: "/analytics", icon: "BarChart3" },
  { label: "Users", path: "/users", icon: "Users" },
  { label: "Products", path: "/products", icon: "Package" },
  { label: "Tasks", path: "/tasks", icon: "ListTodo" },
  { label: "Activity", path: "/activity", icon: "Activity" },
  { label: "Notifications", path: "/notifications", icon: "Bell" },
  { label: "Settings", path: "/settings", icon: "Settings" },
  { label: "Profile", path: "/profile", icon: "UserCircle2" },
];

export const USER_MENU = [
  { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  { label: "My Tasks", path: "/tasks", icon: "ListTodo" },
  { label: "My Products", path: "/products", icon: "Package" },
  { label: "Notifications", path: "/notifications", icon: "Bell" },
  { label: "Profile", path: "/profile", icon: "UserCircle2" },
];

export const DATE_RANGES = [
  { label: "Last 7d", value: "7d" },
  { label: "Last 30d", value: "30d" },
  { label: "Last 90d", value: "90d" },
  { label: "Last 1y", value: "1y" },
];
