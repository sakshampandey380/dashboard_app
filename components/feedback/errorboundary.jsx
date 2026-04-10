import { AlertTriangle } from "lucide-react";
import { Component } from "react";
import Button from "../common/button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="card max-w-lg space-y-4 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-semibold">Something broke</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              The app hit an unexpected error. Refresh and try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
