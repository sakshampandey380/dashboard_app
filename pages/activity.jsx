import { Activity, LogIn, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageWrapper from "../components/layout/pagewrapper";
import Pagination from "../components/layout/pagination";
import { Loader } from "../components/common/loader";
import { getActivities } from "../services/activityService";
import { formatDateTime } from "../units/formatters";

const iconMap = {
  auth: { icon: LogIn, color: "bg-slate-400" },
  create: { icon: PlusCircle, color: "bg-emerald-500" },
  update: { icon: Pencil, color: "bg-blue-500" },
  delete: { icon: Trash2, color: "bg-rose-500" },
};

const groupActivities = (items) => {
  const now = new Date();

  return items.reduce((groups, item) => {
    const created = new Date(item.timestamp);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    let label = "Older";

    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else if (diffDays <= 7) label = "This Week";

    groups[label] = groups[label] || [];
    groups[label].push(item);
    return groups;
  }, {});
};

const ActivityPage = () => {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, data: [], pagination: { page: 1, pages: 1 } });

  const loadActivities = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    const data = await getActivities({ page, limit: 10, action: filter });
    setState({ loading: false, data: data.data, pagination: data.pagination });
  }, [filter, page]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const grouped = useMemo(() => groupActivities(state.data), [state.data]);

  return (
    <PageWrapper
      title="Activity timeline"
      subtitle="Track authentication, creation, updates, deletions, and profile events across the workspace."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "auth", "create", "update", "delete"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setFilter(item);
              setPage(1);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === item
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {state.loading ? (
          <Loader label="Loading activity..." />
        ) : state.data.length ? (
          <div className="space-y-8">
            {Object.entries(grouped).map(([group, items]) => (
              <section key={group}>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {group}
                </h2>
                <div className="space-y-5">
                  {items.map((item) => {
                    const meta = iconMap[item.action] || { icon: Activity, color: "bg-slate-400" };
                    const Icon = meta.icon;

                    return (
                      <div key={item._id} className="relative pl-10">
                        <div className="absolute left-3 top-0 h-full w-px bg-slate-200 dark:bg-slate-700" />
                        <div className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white ${meta.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-medium">
                                {item.userName} {item.targetName}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-300">
                                {item.action} · {item.target}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400">{formatDateTime(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Activity className="h-9 w-9" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">No activity yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Events will appear here as users interact with the workspace.
              </p>
            </div>
          </div>
        )}
      </div>

      <Pagination page={state.pagination.page || 1} pages={state.pagination.pages || 1} onChange={setPage} />
    </PageWrapper>
  );
};

export default ActivityPage;
