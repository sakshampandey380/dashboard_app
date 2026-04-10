import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markAllNotificationsRead } from "../../services/notificationService";
import { timeAgo } from "../../units/formatters";

const borderByType = {
  success: "border-emerald-500",
  error: "border-red-500",
  info: "border-blue-500",
  warning: "border-amber-500",
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  const loadNotifications = async () => {
    const data = await getNotifications({ limit: 5 });
    setNotifications(data.data);
    setUnreadCount(data.unreadCount);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (unreadCount > 0) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 700);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [unreadCount]);

  const preview = useMemo(() => notifications.slice(0, 5), [notifications]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80"
      >
        <Bell className={`h-5 w-5 ${animate ? "animate-wiggle" : ""}`} />
        {unreadCount ? (
          <span className="absolute right-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>
      <div
        className={`absolute right-0 top-14 z-40 w-80 origin-top-right overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-2xl backdrop-blur-sm transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/95 ${
          isOpen ? "max-h-[420px] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/50 px-4 py-3 dark:border-slate-700">
          <div>
            <p className="font-display text-lg font-semibold">Notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Latest alerts and updates
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await markAllNotificationsRead();
              await loadNotifications();
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-500 transition hover:bg-blue-50 dark:hover:bg-slate-800"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto p-3">
          {preview.length ? (
            preview.map((item) => (
              <div
                key={item._id}
                className={`rounded-2xl border-l-4 p-3 ${borderByType[item.type]} ${
                  item.isRead
                    ? "bg-slate-50 dark:bg-slate-800/60"
                    : "bg-blue-50/70 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-300">
                      {item.message}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">{timeAgo(item.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
              No notifications yet.
            </div>
          )}
        </div>
        <Link
          to="/notifications"
          className="block border-t border-white/50 px-4 py-3 text-sm font-semibold text-blue-500 transition hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
};

export default NotificationBell;
