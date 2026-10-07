"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import ProductTable from "@/app/components/ui/ProductTable";
import ProductForm from "@/app/components/ui/ProductForm";
import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getProduct,
  deleteProduct,
  updateProduct,
  createProduct,
  searchProduct,
  updateProductStatus,
} from "@/apiService/productApi.js";

const SEARCH_DEBOUNCE_MS = 400;

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const n = Number(value);

  return Number.isNaN(n) ? null : n;
}

function toNumberOrDefault(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const n = Number(value);

  return Number.isNaN(n) ? fallback : n;
}

function toStringOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return String(value);
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 20;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const trimmed = searchInput.trim();

      setSearchQuery((prev) => {
        if (prev === trimmed) {
          return prev;
        }

        setPage(1);
        return trimmed;
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  async function fetchProducts() {
    const isSearch = Boolean(searchQuery);

    try {
      setLoading(true);

      if (isSearch) {
        setSearching(true);
      }

      setError(null);

      const data = isSearch
        ? await searchProduct(searchQuery, page, limit)
        : await getProduct(page, limit);

      if (!data?.success) {
        throw new Error(
          data?.message ||
            (isSearch
              ? "Failed to search products"
              : "Failed to load products")
        );
      }

      const productList = Array.isArray(data?.products)
        ? data.products
        : [];

      const pagination = data?.pagination || {};

      const currentPage = Number(pagination.page) || 1;
      const currentTotal = Number(pagination.total) || 0;
      const currentTotalPages =
        Number(pagination.totalPages) || 1;

      const normalizedProducts = productList.map((product) => ({
        ...product,
        id: product.id || product._id,
      }));

      setProducts(normalizedProducts);
      setPage(currentPage);
      setTotal(currentTotal);
      setTotalPages(Math.max(currentTotalPages, 1));

      return normalizedProducts;
    } catch (err) {
      console.error("Failed to fetch products:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        (isSearch
          ? "Failed to search products"
          : "Failed to load products");

      setError(message);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);

      toast.error(message);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  async function handleProductStatusChange(product, newStatus) {
    const productId = product?.id || product?._id;

    if (!productId || product.status === newStatus) {
      return;
    }

    try {
      setUpdatingStatusId(productId);

      const response = await updateProductStatus(
        productId,
        newStatus
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to update product status"
        );
      }

      const updatedStatus =
        response?.product?.status ??
        response?.data?.status ??
        newStatus;

      setProducts((previousProducts) =>
        previousProducts.map((item) => {
          const itemId = item.id || item._id;

          return itemId === productId
            ? {
                ...item,
                status: updatedStatus,
              }
            : item;
        })
      );

      toast.success(
        `Product marked as ${updatedStatus}`
      );
    } catch (error) {
      console.error(
        "Product status update error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update product status"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  function handleSearchChange(e) {
    setSearchInput(e.target.value);
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      const trimmed = searchInput.trim();

      setPage(1);
      setSearchQuery(trimmed);
    }

    if (e.key === "Escape") {
      handleClearSearch();
    }
  }

  function handleClearSearch() {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  }

  function handleAddClick() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  async function handleEditClick(product) {
    const freshList = await fetchProducts();

    const productId = product?.id || product?._id;

    const fresh = Array.isArray(freshList)
      ? freshList.find(
          (item) =>
            (item.id || item._id) === productId
        )
      : null;

    setEditingProduct(fresh || product);
    setFormOpen(true);
  }

  function handleDelete(product) {
    console.log(product)
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    const productId =
      productToDelete?.id || productToDelete?._id;

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    setDeleting(true);

    try {
      const res = await deleteProduct(productId);

      if (!res || res.success !== true) {
        throw new Error(
          res?.message || "Product deletion failed"
        );
      }

      toast.success("Product deleted successfully!");

      setDeleteDialogOpen(false);
      setProductToDelete(null);

      if (products.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Delete product failed:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  }

const handleSave = async (data) => {

  try {
    setSaving(true);

    const productId = data?.id || data?._id || null;

    let response;

    if (productId) {
      response = await updateProduct(
        String(productId),
        data
      );
    } else {
      response = await createProduct(data);
    }

    if (response?.success) {
      setFormOpen(false);
      await fetchProducts();
    } else {
      console.error(
        "Save product failed:",
        response?.message || "Unknown error"
      );
    }
  } catch (error) {
    console.error("Save product failed:", error);
  } finally {
    setSaving(false);
  }
};

  function goToPage(newPage) {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    setPage(newPage);
  }

  function getPageNumbers() {
    const pages = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      page - 1
    );

    const end = Math.min(
      totalPages - 1,
      page + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (page < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }

  const startItem =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const endItem =
    total === 0
      ? 0
      : Math.min(
          page * limit,
          total
        );

  const isSearchActive =
    Boolean(searchQuery);

  if (
    loading &&
    products.length === 0 &&
    !isSearchActive
  ) {
    return (
      <div className="w-full space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>

          <Skeleton className="h-10 w-full rounded-md sm:w-36" />
        </div>

        <TableSkeleton
          rows={6}
          columns={7}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {total} product
            {total === 1
              ? ""
              : "s"} in your catalog.
          </p>
        </div>

        <Button
          onClick={handleAddClick}
          className="w-full sm:w-auto"
          disabled={saving}
        >
          <Plus
            size={16}
            className="mr-1"
          />
          Add Product
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={
            handleSearchKeyDown
          }
          placeholder="Search products..."
          className="pl-9 pr-9"
          aria-label="Search products"
        />

        {searching && (
          <Loader2
            size={16}
            className="absolute right-9 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}

        {searchInput.length > 0 && (
          <button
            type="button"
            onClick={
              handleClearSearch
            }
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="w-full rounded-lg border bg-white p-10 text-center text-sm text-muted-foreground">
          {isSearchActive ? (
            <>
              No products found for{" "}
              <span className="font-medium text-foreground">
                &ldquo;
                {searchQuery}
                &rdquo;
              </span>
              . Try a different
              search term.
            </>
          ) : (
            <>
              No products yet.
              Click "Add Product"
              to create your first
              one.
            </>
          )}
        </div>
      ) : (
        <>
          <div className="relative w-full overflow-hidden rounded-lg border bg-white">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm">
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Loading...
                </div>
              </div>
            )}

            <ProductTable
              products={products}
              onEdit={
                handleEditClick
              }
              onDelete={
                handleDelete
              }
              onStatusChange={
                handleProductStatusChange
              }
              updatingStatusId={
                updatingStatusId
              }
            />
          </div>

          <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startItem}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {endItem}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {total}
              </span>{" "}
              products
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  goToPage(1)
                }
                disabled={
                  page === 1 ||
                  loading
                }
                title="First page"
              >
                <ChevronsLeft
                  size={16}
                />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  goToPage(page - 1)
                }
                disabled={
                  page === 1 ||
                  loading
                }
                title="Previous page"
              >
                <ChevronLeft
                  size={16}
                />
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map(
                  (
                    pageNumber,
                    index
                  ) => {
                    if (
                      pageNumber ===
                      "..."
                    ) {
                      return (
                        <span
                          key={`dots-${index}`}
                          className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <Button
                        key={
                          pageNumber
                        }
                        variant={
                          pageNumber ===
                          page
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        onClick={() =>
                          goToPage(
                            pageNumber
                          )
                        }
                        disabled={
                          loading
                        }
                        className="h-9 w-9"
                      >
                        {
                          pageNumber
                        }
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  goToPage(
                    page + 1
                  )
                }
                disabled={
                  page ===
                    totalPages ||
                  loading
                }
                title="Next page"
              >
                <ChevronRight
                  size={16}
                />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  goToPage(
                    totalPages
                  )
                }
                disabled={
                  page ===
                    totalPages ||
                  loading
                }
                title="Last page"
              >
                <ChevronsRight
                  size={16}
                />
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground lg:text-right">
              Page{" "}
              <span className="font-medium text-foreground">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {totalPages}
              </span>
            </div>
          </div>
        </>
      )}

     <ProductForm
  open={formOpen}
  onOpenChange={setFormOpen}
  product={editingProduct}
  onSave={handleSave}
  saving={saving}
/>

      <DeleteConfirmDialog
        open={
          deleteDialogOpen
        }
        onOpenChange={
          setDeleteDialogOpen
        }
        title="Delete Product"
        description={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={
          confirmDelete
        }
        loading={deleting}
      />
    </div>
  );
}