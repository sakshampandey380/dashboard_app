import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../../app/uiSlice";

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
};

const colorMap = {
  success: "border-emerald-500",
  error: "border-red-500",
  info: "border-blue-500",
  warning: "border-amber-500",
};

const ToastViewport = () => {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();

  useEffect(() => {
    const timeouts = toasts.map((toast) =>
      setTimeout(() => dispatch(removeToast(toast.id)), toast.duration)
    );

    return () => timeouts.forEach((timeout) => clearTimeout(timeout));
  }, [dispatch, toasts]);

  return (
    <div className="fixed right-4 top-4 z-[60] space-y-3">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || Info;

        return (
          <div
            key={toast.id}
            className={`animate-slideDown overflow-hidden rounded-2xl border-l-4 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:bg-slate-900/95 ${colorMap[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 text-slate-600 dark:text-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(removeToast(toast.id))}
                className="rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full animate-[fadeUp_4s_linear] rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastViewport;
