import { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ErrorBoundary } from "./components/feedback/errorboundary";
import { PageSkeleton } from "./components/common/loader";
import ToastViewport from "./components/feedback/toastviewport";
import AppRoutes from "./routes/approutes";
import { bootstrapAuth } from "./features/auth/authslice";
import { initializeTheme } from "./app/themeSlice";

const App = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    dispatch(initializeTheme());
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <AppRoutes />
        <ToastViewport />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
