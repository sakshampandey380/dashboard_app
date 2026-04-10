import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../common/button";

const AccessDenied = () => (
  <div className="flex min-h-[70vh] items-center justify-center p-6">
    <div className="card max-w-xl space-y-5 p-8 text-center">
      <div className="mx-auto flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow">
        <Lock className="h-9 w-9" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Access denied</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          This route is restricted for your role. Head back to the dashboard to continue.
        </p>
      </div>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  </div>
);

export default AccessDenied;
