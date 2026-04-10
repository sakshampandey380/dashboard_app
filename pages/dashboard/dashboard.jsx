import { DollarSign, Package, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageWrapper from "../../components/layout/pagewrapper";
import StatCard from "../../components/dashboard/statcard";
import AreaChartCard from "../../charts/areachart";
import BarChartCard from "../../charts/barchart";
import LineChartCard from "../../charts/linechart";
import PieChartCard from "../../charts/piechart";
import RecentActivity from "../../components/dashboard/recentactivity";
import QuickActions from "../../components/dashboard/quickactions";
import { Loader } from "../../components/common/loader";
import Modal from "../../components/common/modal";
import Input from "../../components/common/input";
import Button from "../../components/common/button";
import { fetchDashboardCharts, fetchDashboardSummary } from "../../features/dashboard/dashboardslice";
import { createUserRequest, fetchUsersRequest } from "../../features/user/userapi";
import { createProduct } from "../../services/productService";
import { createTask } from "../../services/taskService";
import { formatCurrency } from "../../units/formatters";
import { addToast } from "../../app/uiSlice";

const emptyForms = {
  user: { name: "", email: "", password: "", role: "user", status: "active" },
  product: {
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
    status: "active",
  },
  task: {
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
  },
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { summary, charts, recentActivities, status } = useSelector((state) => state.dashboard);
  const user = useSelector((state) => state.auth.user);
  const [activeModal, setActiveModal] = useState(null);
  const [formState, setFormState] = useState(emptyForms);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchDashboardCharts("1y"));
  }, [dispatch]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsersRequest({ limit: 50 }).then((data) => setUsers(data.data));
    } else if (user?._id) {
      setUsers([user]);
      setFormState((current) => ({
        ...current,
        task: { ...current.task, assignedTo: user._id },
      }));
    }
  }, [user]);

  const stats = useMemo(
    () => [
      {
        title: "Total Users",
        value: summary?.totalUsers || 0,
        icon: Users,
        gradient: "from-blue-500 to-sky-500",
        trend: 12,
      },
      {
        title: "Total Products",
        value: summary?.totalProducts || 0,
        icon: Package,
        gradient: "from-emerald-500 to-cyan-500",
        trend: 9,
      },
      {
        title: "Active Tasks",
        value: summary?.activeTasks || 0,
        icon: UserPlus,
        gradient: "from-purple-500 to-fuchsia-500",
        trend: 6,
      },
      {
        title: "Total Revenue",
        value: summary?.totalRevenue || 0,
        icon: DollarSign,
        gradient: "from-orange-500 to-amber-500",
        trend: 18,
        formatter: formatCurrency,
      },
    ],
    [summary]
  );

  const handleFormChange = (type, field) => (event) => {
    setFormState((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [field]: event.target.value,
      },
    }));
  };

  const submitModal = async () => {
    const currentForm = formState[activeModal];
    setSubmitting(true);

    try {
      if (activeModal === "user") {
        await createUserRequest(currentForm);
      }
      if (activeModal === "product") {
        await createProduct({
          ...currentForm,
          price: Number(currentForm.price),
          stock: Number(currentForm.stock),
        });
      }
      if (activeModal === "task") {
        await createTask(currentForm);
      }

      dispatch(
        addToast({
          type: "success",
          title: "Saved",
          message: `${activeModal} created successfully.`,
        })
      );
      setActiveModal(null);
      setFormState(emptyForms);
      dispatch(fetchDashboardSummary());
      dispatch(fetchDashboardCharts("1y"));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" && !summary) {
    return <Loader label="Loading dashboard..." />;
  }

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Track your workspace health at a glance with live metrics, activity, and quick actions."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.title} className={`[animation-delay:${(index + 1) * 80}ms] animate-fadeUp`}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="card p-5">
            <h3 className="mb-4 font-display text-xl font-semibold">Monthly revenue</h3>
            <AreaChartCard data={charts?.monthlyRevenue || []} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 font-display text-xl font-semibold">Products by category</h3>
              <BarChartCard data={charts?.productsByCategory || []} />
            </div>
            <div className="card p-5">
              <h3 className="mb-4 font-display text-xl font-semibold">Task status distribution</h3>
              <PieChartCard data={charts?.taskStatus || []} />
            </div>
          </div>
          <div className="card p-5">
            <h3 className="mb-4 font-display text-xl font-semibold">User registrations over time</h3>
            <LineChartCard data={charts?.userRegistrations || []} />
          </div>
        </div>

        <div className="space-y-6">
          <QuickActions
            isAdmin={user?.role === "admin"}
            onAddUser={() => setActiveModal("user")}
            onAddProduct={() => setActiveModal("product")}
            onAddTask={() => setActiveModal("task")}
          />
          <RecentActivity items={recentActivities} />
        </div>
      </div>

      <Modal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        title={`Add ${activeModal || ""}`}
        className="w-full max-w-2xl"
      >
        {activeModal === "user" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full name" value={formState.user.name} onChange={handleFormChange("user", "name")} />
            <Input label="Email" type="email" value={formState.user.email} onChange={handleFormChange("user", "email")} />
            <Input label="Password" type="password" value={formState.user.password} onChange={handleFormChange("user", "password")} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900" value={formState.user.role} onChange={handleFormChange("user", "role")}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        ) : null}
        {activeModal === "product" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={formState.product.name} onChange={handleFormChange("product", "name")} />
            <Input label="Category" value={formState.product.category} onChange={handleFormChange("product", "category")} />
            <Input label="Price" type="number" value={formState.product.price} onChange={handleFormChange("product", "price")} />
            <Input label="Stock" type="number" value={formState.product.stock} onChange={handleFormChange("product", "stock")} />
            <Input label="Image URL" value={formState.product.imageUrl} onChange={handleFormChange("product", "imageUrl")} />
            <Input label="Description" value={formState.product.description} onChange={handleFormChange("product", "description")} className="md:col-span-2" />
          </div>
        ) : null}
        {activeModal === "task" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Title" value={formState.task.title} onChange={handleFormChange("task", "title")} />
            <Input label="Due date" type="date" value={formState.task.dueDate} onChange={handleFormChange("task", "dueDate")} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to</label>
              <select className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900" value={formState.task.assignedTo} onChange={handleFormChange("task", "assignedTo")}>
                <option value="">Select user</option>
                {users.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select className="h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900" value={formState.task.priority} onChange={handleFormChange("task", "priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input label="Description" value={formState.task.description} onChange={handleFormChange("task", "description")} className="md:col-span-2" />
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setActiveModal(null)}>
            Cancel
          </Button>
          <Button loading={submitting} onClick={submitModal}>
            Save
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default DashboardPage;
