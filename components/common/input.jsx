import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "../../units/helpers";

const Input = ({
  label,
  error,
  type = "text",
  className,
  icon: Icon,
  value,
  onChange,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && isVisible ? "text" : type;

  return (
    <div className="relative">
      <div
        className={cn(
          "group relative flex items-center rounded-xl border bg-white/80 px-3 pt-5 shadow-sm backdrop-blur-sm transition-all duration-200 dark:bg-slate-900/70",
          error
            ? "border-red-400 ring-1 ring-red-400"
            : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 dark:border-slate-700"
        )}
      >
        {Icon ? <Icon className="mr-2 h-4 w-4 text-slate-400" /> : null}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={cn(
            "peer h-12 w-full bg-transparent pb-1 text-sm text-slate-900 outline-none placeholder:text-transparent dark:text-white",
            isPassword ? "pr-9" : "",
            className
          )}
          {...props}
        />
        <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-transparent px-1 text-sm text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs dark:text-slate-500">
          {label}
        </label>
        {isPassword ? (
          <button
            type="button"
            onClick={() => setIsVisible((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:scale-110 hover:text-blue-500"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 animate-slideDown text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

export default Input;
