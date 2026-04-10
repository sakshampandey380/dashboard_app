import { useEffect, useState } from "react";
import PageWrapper from "../../components/layout/pagewrapper";
import Button from "../../components/common/button";
import Input from "../../components/common/input";
import { getSettings, updateSettings } from "../../services/settingsService";
import { useDispatch } from "react-redux";
import { addToast } from "../../app/uiSlice";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    appName: "",
    logoUrl: "",
    defaultRole: "user",
    notificationsEnabled: true,
    activityTrackingEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      setForm(data.settings);
      setLoading(false);
    });
  }, []);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    const data = await updateSettings(form);
    dispatch(addToast({ type: "success", title: "Settings updated", message: data.message }));
    setSaving(false);
  };

  if (loading) {
    return (
      <PageWrapper title="Settings" subtitle="Manage workspace defaults and system toggles.">
        <div className="card p-6">Loading settings...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Settings"
      subtitle="Customize application branding, defaults, and operational switches."
    >
      <form onSubmit={saveSettings} className="card space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="App name" value={form.appName} onChange={(event) => setForm((current) => ({ ...current, appName: event.target.value }))} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(event) => setForm((current) => ({ ...current, logoUrl: event.target.value }))} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Default role</label>
            <select
              value={form.defaultRole}
              onChange={(event) => setForm((current) => ({ ...current, defaultRole: event.target.value }))}
              className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.logoUrl ? (
            <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <img src={form.logoUrl} alt="Logo preview" className="h-32 w-full object-cover" />
            </div>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <span>
              <p className="font-semibold">Notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Enable automated notifications across the workspace.
              </p>
            </span>
            <input
              type="checkbox"
              checked={form.notificationsEnabled}
              onChange={(event) => setForm((current) => ({ ...current, notificationsEnabled: event.target.checked }))}
              className="h-5 w-5 rounded"
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <span>
              <p className="font-semibold">Activity tracking</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Log successful mutations and authentication events.
              </p>
            </span>
            <input
              type="checkbox"
              checked={form.activityTrackingEnabled}
              onChange={(event) => setForm((current) => ({ ...current, activityTrackingEnabled: event.target.checked }))}
              className="h-5 w-5 rounded"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save Settings
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default SettingsPage;
