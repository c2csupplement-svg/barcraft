"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function formatPrice(price) {
  if (
    price === null ||
    price === undefined ||
    price === "" ||
    !Number.isFinite(Number(price))
  ) {
    return "—";
  }

  return Number(price).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function getPriceInfo(product) {
  const price = Number(product?.price);
  const discountedPrice = Number(
    product?.discountedPrice
  );

  const validPrice = Number.isFinite(price);
  const validDiscountedPrice =
    Number.isFinite(discountedPrice);

  const hasDiscount =
    validPrice &&
    validDiscountedPrice &&
    discountedPrice < price;

  if (!validPrice) {
    return {
      type: "empty",
    };
  }

  if (hasDiscount) {
    const discount =
      price > 0
        ? Math.round(
            ((price - discountedPrice) / price) *
              100
          )
        : 0;

    return {
      type: "discount",
      price: discountedPrice,
      originalPrice: price,
      discount,
    };
  }

  return {
    type: "single",
    price,
  };
}

function getProductImage(product) {
  if (
    typeof product?.featureImage === "string" &&
    product.featureImage.trim()
  ) {
    return product.featureImage.trim();
  }

  if (
    Array.isArray(product?.image) &&
    product.image.length > 0
  ) {
    const firstImage = product.image[0];

    if (
      typeof firstImage === "string" &&
      firstImage.trim()
    ) {
      return firstImage.trim();
    }

    if (
      firstImage &&
      typeof firstImage === "object"
    ) {
      return (
        firstImage.url ||
        firstImage.src ||
        firstImage.path ||
        null
      );
    }
  }

  return null;
}

function formatCreatedDate(date) {
  if (!date) {
    return {
      date: "—",
      weekday: "",
    };
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      date: "—",
      weekday: "",
    };
  }

  return {
    date: parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ),

    weekday: parsedDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
      }
    ),
  };
}

export default function ProductTable({
  products = [],
  onEdit,
  onDelete,
  onStatusChange,
  updatingStatusId = null,
}) {
  const safeProducts = Array.isArray(products)
    ? products
    : [];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[950px]">
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90">
              <TableHead className="h-14 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Product
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pricing
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Created
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Status
              </TableHead>

              <TableHead className="h-14 pr-5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {safeProducts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-64"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <Package
                        size={25}
                        strokeWidth={1.7}
                        className="text-slate-400"
                      />
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Add your first product to
                      start building your catalog.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {safeProducts.map((product) => {
              const productId =
                product?._id || product?.id;

              const image =
                getProductImage(product);

              const price =
                getPriceInfo(product);

              const created =
                formatCreatedDate(
                  product?.createdAt
                );

              const isActive =
                product?.status === true ||
                String(
                  product?.status
                ).toLowerCase() ===
                  "active" ||
                String(
                  product?.status
                ).toLowerCase() ===
                  "true";

              const productStatus = isActive
                ? "active"
                : "inactive";

              return (
                <TableRow
                  key={productId}
                  className="group border-b border-slate-100 bg-white transition-all duration-200 hover:bg-slate-50/70"
                >
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {image ? (
                          <img
                            src={image}
                            alt={
                              product?.name ||
                              "Product"
                            }
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";

                              const fallback =
                                e.currentTarget
                                  .nextElementSibling;

                              if (fallback) {
                                fallback.classList.remove(
                                  "hidden"
                                );

                                fallback.classList.add(
                                  "flex"
                                );
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className={
                            image
                              ? "hidden h-full w-full items-center justify-center"
                              : "flex h-full w-full items-center justify-center"
                          }
                        >
                          <Package
                            size={20}
                            strokeWidth={1.7}
                            className="text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p
                          title={
                            product?.name || ""
                          }
                          className="max-w-[420px] truncate text-[13px] font-semibold leading-5 text-slate-800 group-hover:text-slate-950"
                        >
                          {product?.name ||
                            "Unnamed Product"}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            ID #
                            {productId || "—"}
                          </span>

                          {product?.slug && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />

                              <span
                                title={
                                  product.slug
                                }
                                className="max-w-[180px] truncate text-[10px] font-medium text-slate-400"
                              >
                                {product.slug}
                              </span>
                            </>
                          )}
                        </div>

                        {product?.shortDes && (
                          <p
                            title={
                              product.shortDes
                            }
                            className="mt-1 max-w-[400px] truncate text-[10px] text-slate-400"
                          >
                            {product.shortDes}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {price.type ===
                      "empty" && (
                      <span className="text-sm text-slate-300">
                        —
                      </span>
                    )}

                    {price.type ===
                      "single" && (
                      <span className="text-[14px] font-bold text-slate-900">
                        ₹
                        {formatPrice(
                          price.price
                        )}
                      </span>
                    )}

                    {price.type ===
                      "discount" && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-slate-900">
                            ₹
                            {formatPrice(
                              price.price
                            )}
                          </span>

                          <Badge className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50">
                            -{price.discount}%
                          </Badge>
                        </div>

                        <span className="mt-0.5 text-[10px] text-slate-400 line-through">
                          ₹
                          {formatPrice(
                            price.originalPrice
                          )}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap text-xs font-medium text-slate-600">
                        {created.date}
                      </span>

                      {created.weekday && (
                        <span className="mt-0.5 text-[10px] text-slate-400">
                          {created.weekday}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Select
                      value={productStatus}
                      disabled={
                        updatingStatusId ===
                        productId
                      }
                      onValueChange={(
                        newStatus
                      ) => {
                        if (
                          newStatus !==
                          productStatus
                        ) {
                          onStatusChange?.(
                            product,
                            newStatus ===
                              "active"
                          );
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`h-9 w-[125px] rounded-full px-3 text-xs font-bold ${
                          productStatus ===
                          "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-200"
                            : "border-red-200 bg-red-50 text-red-700 focus:ring-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              productStatus ===
                              "active"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />

                          <SelectValue />
                        </div>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Active
                          </div>
                        </SelectItem>

                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="pr-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          onEdit?.(
                            product
                          )
                        }
                        aria-label={`Edit ${
                          product?.name ||
                          "product"
                        }`}
                        className="h-9 w-9 rounded-lg border border-transparent text-slate-400 transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil
                          size={15}
                          strokeWidth={2}
                        />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          onDelete?.(
                            product
                          )
                        }
                        aria-label={`Delete ${
                          product?.name ||
                          "product"
                        }`}
                        className="h-9 w-9 rounded-lg border border-transparent text-slate-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2
                          size={15}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}