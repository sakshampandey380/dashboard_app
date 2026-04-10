import { timeAgo } from "../../units/formatters";
import { getInitials } from "../../units/helpers";

const RecentActivity = ({ items = [] }) => (
  <div className="card relative overflow-hidden p-5">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-display text-xl font-semibold">Recent activity</h3>
      <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Last 10</span>
    </div>
    <div className="max-h-[320px] space-y-4 overflow-y-auto pr-2">
      {items.map((item) => (
        <div key={item._id} className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-semibold text-white">
            {getInitials(item.userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              <span className="font-semibold">{item.userName}</span> {item.targetName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300">{timeAgo(item.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-slate-800" />
  </div>
);

export default RecentActivity;
