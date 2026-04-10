import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ListChecks,
  Plus,
  Search,
  SquareKanban,
  Trash2,
} from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../components/common/button";
import Input from "../components/common/input";
import { TableSkeleton } from "../components/common/loader";
import Modal from "../components/common/modal";
import ConfirmDialog from "../components/forms/confirmdialog";
import PageWrapper from "../components/layout/pagewrapper";
import Pagination from "../components/layout/pagination";
import useDebounce from "../hooks/useDebounce";
import {
  bulkDeleteTasks,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../services/taskService";
import { fetchUsersRequest } from "../features/user/userapi";
import { addToast } from "../app/uiSlice";
import { formatDate, timeAgo } from "../units/formatters";
import { getInitials, sanitizePayload } from "../units/helpers";

const defaultForm = {
  title: "",
  description: "",
  assignedTo: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
};

const priorityStyles = {
  low: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const taskColumns = [
  { id: "todo", title: "Todo" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const TasksPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ priority: "", assignedTo: "", status: "" });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ sortBy: "createdAt", sortOrder: "desc" });
  const [view, setView] = useState("kanban");
  const [selectedIds, setSelectedIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalState, setModalState] = useState({ open: false, editingTask: null });
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const data = await getTasks({
      page,
      limit: 10,
      search: debouncedSearch,
      priority: filters.priority,
      assignedTo: filters.assignedTo,
      status: filters.status,
      ...sort,
    });
    setTasks(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [debouncedSearch, filters.assignedTo, filters.priority, filters.status, page, sort]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    fetchUsersRequest({ limit: 50 }).then((data) => setUsers(data.data));
  }, []);

  const groupedTasks = useMemo(
    () =>
      taskColumns.reduce((accumulator, column) => {
        accumulator[column.id] = tasks.filter((task) => task.status === column.id);
        return accumulator;
      }, {}),
    [tasks]
  );

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    setTasks((current) =>
      current.map((task) =>
        task._id === draggableId ? { ...task, status: destination.droppableId } : task
      )
    );
    await updateTaskStatus(draggableId, destination.droppableId);
    dispatch(addToast({ type: "success", title: "Task moved", message: "Status updated." }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = sanitizePayload(form);

    if (modalState.editingTask) {
      await updateTask(modalState.editingTask._id, payload);
      dispatch(addToast({ type: "success", title: "Task updated", message: "Task saved." }));
    } else {
      await createTask(payload);
      dispatch(addToast({ type: "success", title: "Task created", message: "Task added." }));
    }

    setModalState({ open: false, editingTask: null });
    setForm(defaultForm);
    loadTasks();
  };

  const selectionToggle = (id) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  return (
    <PageWrapper
      title="Tasks"
      subtitle="Switch between kanban and list views to coordinate work, due dates, and assignees."
      actions={
        <div className="flex gap-3">
          <div className="flex rounded-2xl border border-white/50 bg-white/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={`rounded-xl p-2 ${view === "kanban" ? "bg-blue-500 text-white" : ""}`}
            >
              <SquareKanban className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-xl p-2 ${view === "list" ? "bg-blue-500 text-white" : ""}`}
            >
              <ListChecks className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={() => {
              setModalState({ open: true, editingTask: null });
              setForm({ ...defaultForm, assignedTo: currentUser?._id || "" });
            }}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      }
    >
      <div className="card space-y-5 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-4 xl:w-4/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-xl border bg-white pl-10 pr-3 text-sm dark:bg-slate-900"
                placeholder="Search tasks"
              />
            </div>
            <select
              value={filters.priority}
              onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
              className="h-12 rounded-xl border bg-white px-3 text-sm dark:bg-slate-900"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={filters.assignedTo}
              onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}
              className="h-12 rounded-xl border bg-white px-3 text-sm dark:bg-slate-900"
            >
              <option value="">All assignees</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="h-12 rounded-xl border bg-white px-3 text-sm dark:bg-slate-900"
            >
              <option value="">All statuses</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          {selectedIds.length ? (
            <Button
              variant="danger"
              onClick={async () => {
                await bulkDeleteTasks(selectedIds);
                setSelectedIds([]);
                dispatch(addToast({ type: "success", title: "Tasks deleted", message: "Selected tasks were removed." }));
                loadTasks();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          ) : null}
        </div>

        {loading ? (
          <TableSkeleton columns={8} />
        ) : view === "kanban" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid gap-4 xl:grid-cols-3">
              {taskColumns.map((column) => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold">{column.title}</h3>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold dark:bg-slate-800">
                          {groupedTasks[column.id]?.length || 0}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {(groupedTasks[column.id] || []).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                className="card p-4"
                              >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">{task.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-300">
                                      {task.description || "No description provided"}
                                    </p>
                                  </div>
                                  <div {...dragProvided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-slate-400" />
                                  </div>
                                </div>
                                <div className="mb-3 flex items-center gap-2">
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-700">
                                    {task.status}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                                    {task.assignedTo?.avatar ? (
                                      <img
                                        src={task.assignedTo.avatar}
                                        alt={task.assignedTo.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-[11px] font-semibold text-white">
                                        {getInitials(task.assignedTo?.name)}
                                      </div>
                                    )}
                                    <span>{task.assignedTo?.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(task)}
                                    className="rounded-xl bg-rose-50 p-2 text-rose-500 dark:bg-rose-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                                  <span>{timeAgo(task.createdAt)}</span>
                                  <span>{formatDate(task.dueDate)}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={tasks.length > 0 && selectedIds.length === tasks.length}
                      onChange={() =>
                        setSelectedIds(selectedIds.length === tasks.length ? [] : tasks.map((item) => item._id))
                      }
                    />
                  </th>
                  {["title", "priority", "status", "dueDate"].map((key) => (
                    <th key={key} className="px-4 py-3 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          setSort((current) => ({
                            sortBy: key,
                            sortOrder:
                              current.sortBy === key && current.sortOrder === "asc" ? "desc" : "asc",
                          }))
                        }
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
                  <th className="px-4 py-3 text-left">Assignee</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="even:bg-gray-50/50 hover:bg-blue-50 dark:even:bg-slate-800/50 dark:hover:bg-slate-700"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(task._id)}
                        onChange={() => selectionToggle(task._id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">{task.status}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-300">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">{task.assignedTo?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({ open: true, editingTask: task });
                            setForm({
                              title: task.title,
                              description: task.description,
                              assignedTo: task.assignedTo?._id,
                              priority: task.priority,
                              status: task.status,
                              dueDate: task.dueDate?.slice(0, 10),
                            });
                          }}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold dark:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(task)}
                          className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 dark:bg-rose-500/10"
                        >
                          Delete
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
        onClose={() => setModalState({ open: false, editingTask: null })}
        title={modalState.editingTask ? "Edit task" : "Add task"}
        className="w-full max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <Input label="Due date" type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned to</label>
            <select
              value={form.assignedTo}
              onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
              className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900"
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Input label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalState({ open: false, editingTask: null })}>
              Cancel
            </Button>
            <Button type="submit">{modalState.editingTask ? "Update" : "Create"} Task</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteTask(deleteTarget._id);
          dispatch(addToast({ type: "success", title: "Task deleted", message: "Task removed." }));
          setDeleteTarget(null);
          loadTasks();
        }}
        title="Delete task?"
        description={`Are you sure you want to delete ${deleteTarget?.title}?`}
        confirmLabel="Delete"
      />
    </PageWrapper>
  );
};

export default TasksPage;
