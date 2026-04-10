import { MoonStar, SunMedium } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../app/themeSlice";

const ThemeToggle = () => {
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80"
      aria-label="Toggle theme"
    >
      <SunMedium
        className={`absolute h-5 w-5 text-amber-500 transition duration-300 ${
          mode === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
      />
      <MoonStar
        className={`absolute h-5 w-5 text-blue-400 transition duration-300 ${
          mode === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
