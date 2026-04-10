import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUserRole } from "../features/auth/authslice";

const useAuth = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  return {
    user,
    role,
    isAuthenticated,
    isAdmin: role === "admin",
  };
};

export default useAuth;
