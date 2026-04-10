import { Bell, CheckCheck, ChevronDown, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PageWrapper from "../components/layout/pagewrapper";
import Pagination from "../components/layout/pagination";
import Button from "../components/common/button";
import { Loader } from "../components/common/loader";
import {
  bulkDeleteNotifications,
  getNotifications,
  markAllNotificationsRead,
  markManyNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import { addToast } from "../app/uiSlice";
import { timeAgo } from "../units/formatters";

const borderByType = {
  success: "border-emerald-500",
  error: "border-red-500",
  info: "border-blue-500",
  warning: "border-amber-500",
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [state, setState] = useState({ loading: true, data: [], pagination: { page: 1, pages: 1 } });

  const loadNotifications = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    const data = await getNotifications({ page, limit: 10, filter });
    setState({ loading: false, data: data.data, pagination: data.pagination });
  }, [filter, page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <PageWrapper
      title="Notifications"
      subtitle="Review alerts, due-soon reminders, role changes, and operational signals."
      actions={
        <Button
          variant="secondary"
          onClick={async () => {
            await markAllNotificationsRead();
            dispatch(addToast({ type: "success", title: "Notifications updated", message: "All notifications marked as read." }));
            loadNotifications();
          }}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "All", value: "all" },
          { label: "Unread", value: "unread" },
          { label: "Read", value: "read" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setFilter(item.value);
              setPage(1);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === item.value
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {selectedIds.length ? (
        <div className="mb-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={async () => {
              await markManyNotificationsRead(selectedIds);
              dispatch(addToast({ type: "success", title: "Notifications updated", message: "Selected notifications marked as read." }));
              setSelectedIds([]);
              loadNotifications();
            }}
          >
            Mark Selected Read
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await bulkDeleteNotifications(selectedIds);
              dispatch(addToast({ type: "success", title: "Notifications deleted", message: "Selected notifications removed." }));
              setSelectedIds([]);
              loadNotifications();
            }}
          >
            Delete Selected
          </Button>
        </div>
      ) : null}

      <div className="space-y-4">
        {state.loading ? (
          <Loader label="Loading notifications..." />
        ) : state.data.length ? (
          state.data.map((item) => (
            <div
              key={item._id}
              className={`card overflow-hidden border-l-4 ${borderByType[item.type]} ${item.isRead ? "" : "ring-1 ring-blue-500/20"}`}
            >
              <div className="flex items-start gap-4 p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item._id)}
                  onChange={() =>
                    setSelectedIds((current) =>
                      current.includes(item._id)
                        ? current.filter((id) => id !== item._id)
                        : [...current, item._id]
                    )
                  }
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        {item.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{timeAgo(item.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedId((current) => (current === item._id ? null : item._id))}
                        className={`rounded-xl bg-slate-100 p-2 transition dark:bg-slate-800 ${expandedId === item._id ? "rotate-180" : ""}`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`grid transition-all duration-300 ${expandedId === item._id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                        {!item.isRead ? (
                          <Button
                            variant="secondary"
                            onClick={async () => {
                              await markNotificationRead(item._id);
                              loadNotifications();
                            }}
                          >
                            Mark Read
                          </Button>
                        ) : null}
                        <Button
                          variant="danger"
                          onClick={async () => {
                            await bulkDeleteNotifications([item._id]);
                            loadNotifications();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card flex min-h-[360px] flex-col items-center justify-center gap-4 text-center p-8">
            <div className="flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Bell className="h-9 w-9" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">No notifications yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Alerts will appear here when new events happen in your workspace.
              </p>
            </div>
          </div>
        )}
      </div>

      <Pagination page={state.pagination.page || 1} pages={state.pagination.pages || 1} onChange={setPage} />
    </PageWrapper>
  );
};

export default NotificationsPage;
