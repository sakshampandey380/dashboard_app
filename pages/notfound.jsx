import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/button";

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <div className="card max-w-xl space-y-5 p-8 text-center">
      <div className="mx-auto flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <SearchX className="h-9 w-9" />
      </div>
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-300">
        The page you were looking for drifted out of scope.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
