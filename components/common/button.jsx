import { Loader2 } from "lucide-react";
import { cn } from "../../units/helpers";

const variantClasses = {
  primary:
    "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-[1.03] hover:shadow-lg",
  danger:
    "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:scale-[1.03] hover:shadow-lg",
  secondary:
    "border-2 border-blue-200 bg-white/70 text-slate-700 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-600 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700",
};

const Button = ({
  children,
  className,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cn(
      "button-ripple inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    <span>{children}</span>
  </button>
);

export default Button;
