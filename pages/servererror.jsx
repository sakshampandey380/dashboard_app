import { RotateCcw, TriangleAlert } from "lucide-react";
import Button from "../components/common/button";

const ServerErrorPage = () => (
  <div className="flex min-h-[80vh] items-center justify-center p-6">
    <div className="card max-w-xl space-y-5 p-8 text-center">
      <div className="mx-auto flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-gradient-to-r from-rose-500 to-orange-500 text-white">
        <TriangleAlert className="h-9 w-9" />
      </div>
      <h1 className="font-display text-3xl font-semibold">Server error</h1>
      <p className="text-sm text-slate-500 dark:text-slate-300">
        The backend hit an unexpected issue. Try again and we’ll reconnect everything.
      </p>
      <Button onClick={() => window.location.reload()}>
        <RotateCcw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  </div>
);

export default ServerErrorPage;
