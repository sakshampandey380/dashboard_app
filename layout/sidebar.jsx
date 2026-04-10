import {
  Activity,
  BarChart3,
  Bell,
  ChevronLeft,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Package,
  Settings,
  UserCircle2,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/authslice";
import { ADMIN_MENU, USER_MENU } from "../units/constants";
import { getInitials } from "../units/helpers";
import { toggleSidebar } from "../app/uiSlice";

const iconMap = {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  ListTodo,
  Activity,
  Bell,
  Settings,
  UserCircle2,
};

const Sidebar = ({ mobile = false }) => {
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const menu = user?.role === "admin" ? ADMIN_MENU : USER_MENU;
  const collapsed = mobile ? false : sidebarCollapsed;

  return (
    <aside
      className={`${mobile ? "flex" : "hidden lg:flex"} h-screen flex-col border-r border-white/40 bg-slate-950/95 text-white transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-5">
        <div className={`overflow-hidden transition-all ${collapsed ? "w-0" : "w-auto"}`}>
          <p className="font-display text-xl font-semibold">PulseBoard</p>
          <p className="text-xs text-slate-400">Premium workspace</p>
        </div>
        {!mobile ? (
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {menu.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10"
                } ${index < 3 ? `[animation-delay:${(index + 1) * 90}ms] animate-fadeUp` : ""}`
              }
            >
              <span className="absolute left-0 top-2 h-8 w-[3px] rounded-r-full bg-cyan-300 opacity-0 transition group-[.active]:opacity-100" />
              <Icon className="h-5 w-5 shrink-0" />
              <span className={`transition ${collapsed ? "w-0 opacity-0" : "opacity-100"}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 font-semibold text-slate-950">
              {getInitials(user?.name)}
            </div>
          )}
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{user?.role}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => dispatch(logoutUser())}
            className="rounded-xl p-2 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
