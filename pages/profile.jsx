import { Camera, KeyRound, Mail, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageWrapper from "../components/layout/pagewrapper";
import Button from "../components/common/button";
import Input from "../components/common/input";
import { changePasswordRequest, updateProfileRequest } from "../features/user/userapi";
import { setUser } from "../features/auth/authslice";
import { addToast } from "../app/uiSlice";
import { sanitizePayload } from "../units/helpers";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    const data = await updateProfileRequest(sanitizePayload(profileForm));
    dispatch(setUser(data.user));
    dispatch(addToast({ type: "success", title: "Profile updated", message: data.message }));
    setSavingProfile(false);
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    const data = await changePasswordRequest(passwordForm);
    dispatch(addToast({ type: "success", title: "Password updated", message: data.message }));
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSavingPassword(false);
  };

  return (
    <PageWrapper
      title="Profile"
      subtitle="Manage your personal details, avatar, and account password."
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={saveProfile} className="card space-y-5 p-6">
          <div className="flex items-center gap-4">
            {profileForm.avatar ? (
              <img src={profileForm.avatar} alt={profileForm.name} className="h-20 w-20 rounded-3xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <UserCircle2 className="h-10 w-10" />
              </div>
            )}
            <div>
              <h2 className="font-display text-2xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">{user?.role}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full name" icon={UserCircle2} value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
            <Input label="Email" type="email" icon={Mail} value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} />
            <div className="md:col-span-2">
              <Input label="Avatar URL" icon={Camera} value={profileForm.avatar} onChange={(event) => setProfileForm((current) => ({ ...current, avatar: event.target.value }))} />
            </div>
            {profileForm.avatar ? (
              <div className="md:col-span-2 overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <img src={profileForm.avatar} alt="Avatar preview" className="h-48 w-full object-cover" />
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Save Profile
            </Button>
          </div>
        </form>

        <form onSubmit={savePassword} className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Change password</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Use a strong password with uppercase, numbers, and symbols.
            </p>
          </div>
          <Input label="Current password" type="password" icon={KeyRound} value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
          <Input label="New password" type="password" icon={KeyRound} value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
          <Input label="Confirm new password" type="password" icon={KeyRound} value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
          <div className="flex justify-end">
            <Button type="submit" loading={savingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;
