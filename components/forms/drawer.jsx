import { X } from "lucide-react";

const Drawer = ({ isOpen, title, children, onClose }) => (
  <div
    className={`fixed inset-0 z-40 transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
  >
    <div
      onClick={onClose}
      className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    />
    <aside
      className={`absolute right-0 top-0 h-full w-full max-w-xl transform border-l border-white/30 bg-white/95 p-6 shadow-2xl transition duration-300 dark:border-slate-700 dark:bg-slate-900/95 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-[calc(100%-4rem)] overflow-y-auto">{children}</div>
    </aside>
  </div>
);

export default Drawer;
