import {
  Eye,
  LayoutGrid,
  List,
  PackagePlus,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Button from "../components/common/button";
import Input from "../components/common/input";
import { TableSkeleton } from "../components/common/loader";
import Modal from "../components/common/modal";
import ConfirmDialog from "../components/forms/confirmdialog";
import Drawer from "../components/forms/drawer";
import PageWrapper from "../components/layout/pagewrapper";
import Pagination from "../components/layout/pagination";
import useDebounce from "../hooks/useDebounce";
import {
  bulkDeleteProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/productService";
import { addToast } from "../app/uiSlice";
import { formatCurrency } from "../units/formatters";
import { sanitizePayload } from "../units/helpers";

const defaultForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  imageUrl: "",
  status: "active",
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [sort, setSort] = useState({ sortBy: "createdAt", sortOrder: "desc" });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalState, setModalState] = useState({ open: false, editingProduct: null });
  const [form, setForm] = useState(defaultForm);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await getProducts({
      page,
      limit: 10,
      search: debouncedSearch,
      category: filters.category,
      status: filters.status,
      ...sort,
    });
    setProducts(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [debouncedSearch, filters.category, filters.status, page, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const toggleSelection = (id) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const submitProduct = async (event) => {
    event.preventDefault();
    const payload = sanitizePayload({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    });

    if (modalState.editingProduct) {
      await updateProduct(modalState.editingProduct._id, payload);
      dispatch(addToast({ type: "success", title: "Product updated", message: "Changes saved." }));
    } else {
      await createProduct(payload);
      dispatch(addToast({ type: "success", title: "Product created", message: "Product added." }));
    }

    setModalState({ open: false, editingProduct: null });
    setForm(defaultForm);
    loadProducts();
  };

  return (
    <PageWrapper
      title="Products"
      subtitle="Manage inventory with flexible table and grid views, detail drawers, and stock alerts."
      actions={
        <div className="flex gap-3">
          <div className="flex rounded-2xl border border-white/50 bg-white/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-xl p-2 ${viewMode === "table" ? "bg-blue-500 text-white" : ""}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-xl p-2 ${viewMode === "grid" ? "bg-blue-500 text-white" : ""}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={() => {
              setModalState({ open: true, editingProduct: null });
              setForm(defaultForm);
            }}
          >
            <PackagePlus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      }
    >
      <div className="card space-y-5 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-3 xl:w-3/4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-xl border bg-white pl-10 pr-3 text-sm dark:bg-slate-900"
                placeholder="Search products"
              />
            </div>
            <select
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              className="h-12 rounded-xl border bg-white px-3 text-sm dark:bg-slate-900"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
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
            <Button
              variant="danger"
              onClick={async () => {
                await bulkDeleteProducts(selectedIds);
                setSelectedIds([]);
                dispatch(addToast({ type: "success", title: "Products deleted", message: "Selected products were removed." }));
                loadProducts();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          ) : null}
        </div>

        {loading ? (
          <TableSkeleton columns={8} />
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={() =>
                        setSelectedIds(
                          selectedIds.length === products.length ? [] : products.map((item) => item._id)
                        )
                      }
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Image</th>
                  {["name", "category", "price", "stock"].map((key) => (
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
                      >
                        {key}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="even:bg-gray-50/50 hover:bg-blue-50 dark:even:bg-slate-800/50 dark:hover:bg-slate-700"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product._id)}
                        onChange={() => toggleSelection(product._id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={product.imageUrl || "https://placehold.co/64x64?text=Item"}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const data = await getProductById(product._id);
                            setDrawerProduct(data.product);
                          }}
                          className="rounded-xl bg-slate-100 p-2 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({ open: true, editingProduct: product });
                            setForm(product);
                          }}
                          className="rounded-xl bg-slate-100 p-2 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product._id} className="group card overflow-hidden">
                <div className="relative">
                  <img
                    src={product.imageUrl || "https://placehold.co/640x360?text=Product"}
                    alt={product.name}
                    className="h-52 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-slate-950/80 via-slate-950/0 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={async () => {
                        const data = await getProductById(product._id);
                        setDrawerProduct(data.product);
                      }}
                      className="rounded-xl bg-white/15 p-2 text-white backdrop-blur-sm"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setModalState({ open: true, editingProduct: product });
                          setForm(product);
                        }}
                        className="rounded-xl bg-white/15 p-2 text-white backdrop-blur-sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        className="rounded-xl bg-rose-500/80 p-2 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{product.category}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-700">
                      {product.stock} in stock
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={pagination.page || 1} pages={pagination.pages || 1} onChange={setPage} />
      </div>

      <Modal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, editingProduct: null })}
        title={modalState.editingProduct ? "Edit product" : "Add product"}
        className="w-full max-w-3xl"
      >
        <form onSubmit={submitProduct} className="grid gap-4 md:grid-cols-2">
          <Input label="Product name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
          <Input label="Price" type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
          <Input label="Stock" type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} />
          <Input label="Image URL" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
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
          <div className="md:col-span-2">
            <Input label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </div>
          {form.imageUrl ? (
            <div className="md:col-span-2 overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <img src={form.imageUrl} alt="Preview" className="h-52 w-full object-cover" />
            </div>
          ) : null}
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalState({ open: false, editingProduct: null })}>
              Cancel
            </Button>
            <Button type="submit">{modalState.editingProduct ? "Update" : "Create"} Product</Button>
          </div>
        </form>
      </Modal>

      <Drawer isOpen={Boolean(drawerProduct)} title={drawerProduct?.name || "Product detail"} onClose={() => setDrawerProduct(null)}>
        {drawerProduct ? (
          <div className="space-y-5">
            <img
              src={drawerProduct.imageUrl || "https://placehold.co/640x360?text=Product"}
              alt={drawerProduct.name}
              className="h-64 w-full rounded-2xl object-cover"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Category</p>
                <p className="mt-1 text-lg font-semibold">{drawerProduct.category}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Price</p>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(drawerProduct.price)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Stock</p>
                <p className="mt-1 text-lg font-semibold">{drawerProduct.stock}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
                <p className="mt-1 text-lg font-semibold">{drawerProduct.status}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Description</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{drawerProduct.description}</p>
            </div>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteProduct(deleteTarget._id);
          dispatch(addToast({ type: "success", title: "Product deleted", message: "Product removed." }));
          setDeleteTarget(null);
          loadProducts();
        }}
        title="Delete product?"
        description={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmLabel="Delete"
      />
    </PageWrapper>
  );
};

export default ProductsPage;
