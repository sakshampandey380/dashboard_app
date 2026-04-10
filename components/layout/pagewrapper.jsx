import { useLocation } from "react-router-dom";

const PageWrapper = ({ title, subtitle, actions, children }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fadeUp space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-300">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
};

export default PageWrapper;
