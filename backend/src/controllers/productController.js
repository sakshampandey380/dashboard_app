const { body, param } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, escapeRegExp } = require("../utils/query");
const { PRODUCT_STATUS, ACTIVITY_ACTIONS, NOTIFICATION_TYPES } = require("../constants");
const { notifyAdmins } = require("../services/notificationService");
const { query } = require("../config/db");
const { mapProduct } = require("../utils/mappers");

const productValidators = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be zero or greater"),
  body("status").optional().isIn(Object.values(PRODUCT_STATUS)).withMessage("Invalid status"),
];

const idValidator = [param("id").isInt({ min: 1 }).withMessage("Invalid record id")];

const SORT_FIELDS = {
  name: "name",
  category: "category",
  price: "price",
  stock: "stock",
  createdAt: "created_at",
  created_at: "created_at",
};

const maybeNotifyLowStock = async (product) => {
  if (Number(product.stock) < 5) {
    await notifyAdmins({
      title: "Low stock alert",
      message: `${product.name} stock is running low (${product.stock} left).`,
      type: NOTIFICATION_TYPES.WARNING,
    });
  }
};

const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const sortField = SORT_FIELDS[req.query.sortBy] || "created_at";
  const sortOrder = req.query.sortOrder === "asc" ? "ASC" : "DESC";
  const conditions = [];
  const params = [];

  if (req.query.category) {
    conditions.push("category = ?");
    params.push(req.query.category);
  }

  if (req.query.status) {
    conditions.push("status = ?");
    params.push(req.query.status);
  }

  if (req.query.search) {
    conditions.push("name LIKE ?");
    params.push(`%${escapeRegExp(req.query.search)}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT * FROM products ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, limit, skip]
  );
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM products ${whereClause}`, params);

  res.json({
    data: rows.map(mapProduct),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
  const product = rows[0] ? mapProduct(rows[0]) : null;

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ product });
});

const createProduct = asyncHandler(async (req, res) => {
  const result = await query(
    `INSERT INTO products (name, category, price, stock, description, image_url, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      req.body.name.trim(),
      req.body.category.trim(),
      req.body.price,
      req.body.stock,
      req.body.description?.trim() || "",
      req.body.imageUrl?.trim() || "",
      req.body.status || PRODUCT_STATUS.ACTIVE,
    ]
  );
  const rows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [result.insertId]);
  const product = mapProduct(rows[0]);

  await maybeNotifyLowStock(product);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.CREATE,
    target: "product",
    targetId: String(product._id),
    targetName: product.name,
  };

  res.status(201).json({ message: "Product created successfully", product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
  const product = rows[0] ? mapProduct(rows[0]) : null;

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await query(
    `UPDATE products
     SET name = ?, category = ?, price = ?, stock = ?, description = ?, image_url = ?, status = ?
     WHERE id = ?`,
    [
      req.body.name?.trim() || product.name,
      req.body.category?.trim() || product.category,
      req.body.price ?? product.price,
      req.body.stock ?? product.stock,
      req.body.description?.trim() ?? product.description,
      req.body.imageUrl?.trim() ?? product.imageUrl,
      req.body.status || product.status,
      req.params.id,
    ]
  );

  const updatedRows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
  const updatedProduct = mapProduct(updatedRows[0]);
  await maybeNotifyLowStock(updatedProduct);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "product",
    targetId: String(updatedProduct._id),
    targetName: updatedProduct.name,
  };

  res.json({ message: "Product updated successfully", product: updatedProduct });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
  const product = rows[0] ? mapProduct(rows[0]) : null;

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await query("DELETE FROM products WHERE id = ?", [req.params.id]);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.DELETE,
    target: "product",
    targetId: String(req.params.id),
    targetName: product.name,
  };

  res.json({ message: "Product deleted successfully" });
});

const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const ids = req.body.ids || [];
  if (!ids.length) {
    return res.json({ message: "No products selected" });
  }

  const placeholders = ids.map(() => "?").join(", ");
  await query(`DELETE FROM products WHERE id IN (${placeholders})`, ids);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.DELETE,
    target: "product",
    targetId: ids.join(","),
    targetName: `${ids.length} products removed`,
  };

  res.json({ message: "Selected products deleted successfully" });
});

module.exports = {
  productValidators,
  idValidator,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
};
