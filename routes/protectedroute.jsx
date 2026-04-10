import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AccessDenied from "../components/feedback/accessdenied";
import { Loader } from "../components/common/loader";
import { selectIsAuthenticated, selectUserRole } from "../features/auth/authslice";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const isBootstrapped = useSelector((state) => state.auth.isBootstrapped);

  if (!isBootstrapped) {
    return <Loader label="Restoring your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <AccessDenied />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
