import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const StatCard = ({ title, value, icon: Icon, gradient, trend = 12, formatter = (count) => count }) => {
  const [count, setCount] = useState(0);
  const isPositive = trend >= 0;

  useEffect(() => {
    let start = 0;
    const increment = Math.max(Math.ceil(value / 24), 1);
    const interval = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="card flex items-start justify-between p-5">
      <div className="space-y-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r text-white ${gradient}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
          <p className="mt-1 font-display text-3xl font-semibold">{formatter(count)}</p>
        </div>
      </div>
      <div
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          isPositive
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
        }`}
      >
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(trend)}%
      </div>
    </div>
  );
};

export default StatCard;
