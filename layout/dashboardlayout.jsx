import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { ADMIN_MENU, USER_MENU } from "../units/constants";
import { setMobileSidebarOpen } from "../app/uiSlice";
import { NavLink } from "react-router-dom";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { mobileSidebarOpen } = useSelector((state) => state.ui);
  const user = useSelector((state) => state.auth.user);
  const menu = user?.role === "admin" ? ADMIN_MENU : USER_MENU;

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />

      <div
        className={`fixed inset-0 z-40 transition lg:hidden ${
          mobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-950/60 transition ${
            mobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => dispatch(setMobileSidebarOpen(false))}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[280px] transform bg-slate-950 text-white transition ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar mobile />
        </div>
      </div>

      <main className="flex min-h-screen flex-1 flex-col lg:ml-0">
        <Navbar />
        <div className="flex-1 pb-24 lg:pb-6">
          <Outlet />
        </div>
        <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center justify-around rounded-2xl border border-white/50 bg-white/85 p-2 shadow-2xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90 lg:hidden">
          {menu.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-xs font-semibold ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "text-slate-600 dark:text-slate-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default DashboardLayout;
