const mapUser = (row) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  avatar: row.avatar || "",
  createdAt: row.created_at || row.createdAt,
  updatedAt: row.updated_at || row.updatedAt || row.created_at || row.createdAt,
  password: row.password,
});

const mapProduct = (row) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  stock: Number(row.stock),
  description: row.description || "",
  imageUrl: row.image_url || row.imageUrl || "",
  status: row.status,
  createdAt: row.created_at || row.createdAt,
});

const mapNotification = (row) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  title: row.title,
  message: row.message,
  type: row.type,
  isRead: Boolean(row.is_read),
  createdAt: row.created_at || row.createdAt,
});

const mapActivity = (row) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  action: row.action,
  target: row.target,
  targetId: row.target_id,
  targetName: row.target_name,
  ip: row.ip,
  timestamp: row.created_at || row.timestamp,
  createdAt: row.created_at,
});

const mapTask = (row) => ({
  _id: row.id,
  id: row.id,
  title: row.title,
  description: row.description || "",
  assignedTo: row.assigned_user_id
    ? {
        _id: row.assigned_user_id,
        id: row.assigned_user_id,
        name: row.assigned_user_name,
        email: row.assigned_user_email,
        avatar: row.assigned_user_avatar || "",
      }
    : row.assigned_to
      ? { _id: row.assigned_to, id: row.assigned_to }
      : null,
  createdBy: row.created_by ? { _id: row.created_by, id: row.created_by } : null,
  priority: row.priority,
  status: row.status,
  dueDate: row.due_date || row.dueDate,
  createdAt: row.created_at || row.createdAt,
});

const mapSettings = (row) => ({
  _id: row.id,
  id: row.id,
  appName: row.app_name,
  logoUrl: row.logo_url || "",
  defaultRole: row.default_role,
  notificationsEnabled: Boolean(row.notifications_enabled),
  activityTrackingEnabled: Boolean(row.activity_tracking_enabled),
});

module.exports = {
  mapUser,
  mapProduct,
  mapNotification,
  mapActivity,
  mapTask,
  mapSettings,
};
