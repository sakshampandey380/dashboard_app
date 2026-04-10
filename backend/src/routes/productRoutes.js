const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const activityLogger = require("../middleware/activityLogger");
const {
  productValidators,
  idValidator,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} = require("../controllers/productController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listProducts);
router.post("/", activityLogger(), productValidators, validate, createProduct);
router.post(
  "/bulk-delete",
  activityLogger(),
  body("ids").isArray({ min: 1 }).withMessage("At least one id is required"),
  validate,
  bulkDeleteProducts
);
router.get("/:id", idValidator, validate, getProductById);
router.put("/:id", activityLogger(), idValidator, productValidators, validate, updateProduct);
router.delete("/:id", activityLogger(), idValidator, validate, deleteProduct);

module.exports = router;
