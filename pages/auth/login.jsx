import { Mail, LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/button";
import Input from "../../components/common/input";
import { loginUser } from "../../features/auth/authslice";
import { sanitizePayload } from "../../units/helpers";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => location.state?.from?.pathname || "/dashboard", [location]);

  const handleChange = (field) => (event) => {
    setError("");
    const value = field === "rememberMe" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await dispatch(loginUser(sanitizePayload(form))).unwrap();
      navigate(redirectTo, { replace: true });
    } catch (message) {
      setError(message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-grid bg-[size:22px_22px] opacity-20" />
      <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

      <div className={`relative w-full max-w-md rounded-[28px] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl ${error ? "animate-shake" : ""}`}>
        <div className="mb-8 text-center text-white">
          <p className="font-display text-3xl font-semibold">Welcome back</p>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to manage users, products, tasks, and analytics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            value={form.email}
            onChange={handleChange("email")}
            className="text-white"
          />
          <Input
            label="Password"
            type="password"
            icon={LockKeyhole}
            value={form.password}
            onChange={handleChange("password")}
            className="text-white"
          />
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={handleChange("rememberMe")}
              className="h-4 w-4 rounded border-white/30 bg-transparent text-blue-500 focus:ring-blue-500"
            />
            Remember me
          </label>

          {error ? (
            <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p>
          ) : null}

          <Button type="submit" className="w-full py-3" loading={status === "loading"}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          New here?{" "}
          <Link to="/register" className="font-semibold text-cyan-300 transition hover:text-white">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
