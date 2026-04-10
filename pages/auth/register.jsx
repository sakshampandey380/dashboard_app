import { CheckCircle2, Mail, ShieldCheck, User, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/button";
import Input from "../../components/common/input";
import { registerUser } from "../../features/auth/authslice";
import { sanitizePayload } from "../../units/helpers";

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
  if (score <= 3) return { label: "Medium", color: "bg-amber-500", width: "w-2/3" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
};

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validate = (nextForm = form) => {
    const nextErrors = {};
    if (!nextForm.name.trim()) nextErrors.name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(nextForm.email)) nextErrors.email = "A valid email is required";
    if (nextForm.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (nextForm.confirmPassword !== nextForm.password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (!nextForm.termsAccepted) nextErrors.termsAccepted = "Please accept the terms";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = field === "termsAccepted" ? event.target.checked : event.target.value;
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    validate(nextForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    await dispatch(registerUser(sanitizePayload(form))).unwrap();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-grid bg-[size:22px_22px] opacity-20" />
      <div className="relative w-full max-w-lg rounded-[30px] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center text-white">
          <h1 className="font-display text-3xl font-semibold">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-300">
            Build your team dashboard with secure access and role-based tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" icon={User} value={form.name} onChange={handleChange("name")} error={errors.name} className="text-white" />
          <Input label="Email" type="email" icon={Mail} value={form.email} onChange={handleChange("email")} error={errors.email} className="text-white" />
          <Input label="Password" type="password" icon={ShieldCheck} value={form.password} onChange={handleChange("password")} error={errors.password} className="text-white" />
          <Input label="Confirm password" type="password" icon={ShieldCheck} value={form.confirmPassword} onChange={handleChange("confirmPassword")} error={errors.confirmPassword} className="text-white" />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-300">Password strength</span>
              <span className="text-sm font-semibold text-white">{strength.label}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={handleChange("termsAccepted")}
              className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-blue-500 focus:ring-blue-500"
            />
            <span className="flex-1">
              I agree to the terms and understand this workspace controls production-like data.
              {errors.termsAccepted ? (
                <span className="mt-1 block text-red-300">{errors.termsAccepted}</span>
              ) : null}
            </span>
            {form.termsAccepted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            ) : (
              <XCircle className="h-5 w-5 text-slate-500" />
            )}
          </label>

          <Button type="submit" className="w-full py-3" loading={status === "loading"}>
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-cyan-300 hover:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
