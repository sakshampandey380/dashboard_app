import { ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/button";
import Input from "../../components/common/input";
import { TableSkeleton } from "../../components/common/loader";
import Modal from "../../components/common/modal";
import ConfirmDialog from "../../components/forms/confirmdialog";
import PageWrapper from "../../components/layout/pagewrapper";
import Pagination from "../../components/layout/pagination";
import {
  bulkDeleteUsers,
  createUser,
  deleteUser,
  fetchUsers,
  toggleUserStatus,
  updateUser,
} from "../../features/user/userslice";
import useDebounce from "../../hooks/useDebounce";
import { formatDate } from "../../units/formatters";
import { getInitials, sanitizePayload } from "../../units/helpers";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
  avatar: "",
};

const sortKeys = {
  name: "name",
  email: "email",
  role: "role",
  createdAt: "createdAt",
};

const UsersPage = () => {
  const dispatch = useDispatch();
  const { data, pagination, status } = useSelector((state) => state.users);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [sort, setSort] = useState({ sortBy: "createdAt", sortOrder: "desc" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalState, setModalState] = useState({ open: false, editingUser: null });
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(filters.search);

  const loadUsers = useCallback(() => {
    dispatch(
      fetchUsers({
        page,
        limit: 10,
        search: debouncedSearch,
        role: filters.role,
        status: filters.status,
        ...sort,
      })
    );
  }, [debouncedSearch, dispatch, filters.role, filters.status, page, sort]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  const handleSort = (key) => {
    setSort((current) => ({
      sortBy: sortKeys[key],
      sortOrder: current.sortBy === key && current.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = sanitizePayload(form);

    if (modalState.editingUser) {
      await dispatch(updateUser({ id: modalState.editingUser._id, payload })).unwrap();
    } else {
      await dispatch(createUser(payload)).unwrap();
    }

    setModalState({ open: false, editingUser: null });
    setForm(defaultForm);
    loadUsers();
  };

  const visibleRows = useMemo(() => data, [data]);

  return (
    <PageWrapper
      title="User management"
      subtitle="Search, filter, edit, and organize workspace members with role-aware controls."
      actions={
        <Button
          onClick={() => {
            setModalState({ open: true, editingUser: null });
            setForm(defaultForm);
          }}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      }
    >
      <div className="card space-y-5 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-3 xl:w-3/4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                className="h-12 w-full rounded-xl border bg-white pl-10 pr-3 text-sm dark:bg-slate-900"
                placeholder="Search by name or email"
              />
            </div>
            <select
              value={filters.role}
              onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
              className="h-12 rounded-xl border bg-white px-3 text-sm dark:bg-slate-900"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="h-12 rounded-xl border bg-white px-3 text-sm dark:bg-slate-900"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {selectedIds.length ? (
            <Button variant="danger" onClick={() => dispatch(bulkDeleteUsers(selectedIds)).then(loadUsers)}>
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          ) : null}
        </div>

        {status === "loading" ? (
          <TableSkeleton columns={8} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() =>
                        setSelectedIds(isAllSelected ? [] : visibleRows.map((item) => item._id))
                      }
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Avatar</th>
                  {["name", "email", "role", "createdAt"].map((key) => (
                    <th key={key} className="px-4 py-3 text-left">
                      <button
                        type="button"
                        onClick={() => handleSort(key)}
                        className="inline-flex items-center gap-1"
                      >
                        {key}
                        {sort.sortBy === key && sort.sortOrder === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {visibleRows.map((user) => (
                  <tr
                    key={user._id}
                    className="even:bg-gray-50/50 hover:bg-blue-50 dark:even:bg-slate-800/50 dark:hover:bg-slate-700"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user._id)}
                        onChange={() =>
                          setSelectedIds((current) =>
                            current.includes(user._id)
                              ? current.filter((id) => id !== user._id)
                              : [...current, user._id]
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-semibold text-white">
                          {getInitials(user.name)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => dispatch(toggleUserStatus(user._id))}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({ open: true, editingUser: user });
                            setForm({ ...user, password: "" });
                          }}
                          className="rounded-xl bg-slate-100 p-2 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          className="rounded-xl bg-rose-50 p-2 text-rose-500 transition hover:bg-rose-100 dark:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={pagination.page || 1} pages={pagination.pages || 1} onChange={setPage} />
      </div>

      <Modal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, editingUser: null })}
        title={modalState.editingUser ? "Edit user" : "Add user"}
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <Input label="Password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
          <Input label="Avatar URL" value={form.avatar} onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalState({ open: false, editingUser: null })}>
              Cancel
            </Button>
            <Button type="submit">{modalState.editingUser ? "Update" : "Create"} User</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await dispatch(deleteUser(deleteTarget._id)).unwrap();
          setDeleteTarget(null);
          loadUsers();
        }}
        title="Delete user?"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </PageWrapper>
  );
};

export default UsersPage;
