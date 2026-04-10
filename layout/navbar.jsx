import { ChevronRight, Menu, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ThemeToggle from "../components/layout/themetoggle";
import NotificationBell from "../components/notifications/notificationbell";
import { ADMIN_MENU, USER_MENU } from "../units/constants";
import { getInitials } from "../units/helpers";
import { logoutUser } from "../features/auth/authslice";
import { setMobileSidebarOpen } from "../app/uiSlice";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menu = user?.role === "admin" ? ADMIN_MENU : USER_MENU;

  const breadcrumbs = useMemo(
    () =>
      location.pathname
        .split("/")
        .filter(Boolean)
        .map((segment) => segment.replace(/-/g, " ")),
    [location.pathname]
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const target = menu.find((item) =>
      item.label.toLowerCase().includes(search.trim().toLowerCase())
    );
    if (target) {
      navigate(target.path);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/30 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          className="rounded-xl border border-white/50 bg-white/70 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
            <Link to="/dashboard" className="font-medium text-slate-900 dark:text-white">
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="inline-flex items-center gap-2 capitalize">
                <ChevronRight className="h-4 w-4" />
                <span>{crumb}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form
          onSubmit={handleSearch}
          className="hidden items-center rounded-2xl border border-white/50 bg-white/70 px-3 shadow-sm transition-all focus-within:w-72 dark:border-slate-700 dark:bg-slate-800/80 md:flex md:w-56"
        >
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
            placeholder="Search pages..."
          />
        </form>
        <ThemeToggle />
        <NotificationBell />
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((current) => !current)}
            className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold text-white">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{user?.role}</p>
            </div>
          </button>
          <div
            className={`absolute right-0 top-14 w-56 rounded-2xl border border-white/50 bg-white/95 p-3 shadow-2xl backdrop-blur-sm transition ${
              userMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
            } dark:border-slate-700 dark:bg-slate-900/95`}
          >
            <div className="mb-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">{user?.email}</p>
            </div>
            <Link
              to="/profile"
              className="block rounded-xl px-3 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => dispatch(logoutUser())}
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
