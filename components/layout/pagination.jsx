import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../common/button";

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="secondary" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: pages }).map((_, index) => {
          const current = index + 1;
          return (
            <button
              key={current}
              type="button"
              onClick={() => onChange(current)}
              className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                current === page
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {current}
            </button>
          );
        })}
      </div>
      <Button variant="secondary" onClick={() => onChange(page + 1)} disabled={page >= pages}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
