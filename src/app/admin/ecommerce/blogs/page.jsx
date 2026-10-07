"use client";

import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@/apiService/blogApi";
import { getBlogCategory } from "@/apiService/blogCategory";
import { useEffect, useState } from "react";
import BlogModal from "@/app/components/Blog/BlogModal";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const [form, setForm] = useState(getInitialForm());

  function getInitialForm(blog = null) {
    return {
      title: blog?.title || "",
      slug: blog?.slug || "",
      author: blog?.author || "",
      description: blog?.description || "",
      content: blog?.content || "",
      categoryId: blog?.categoryId?._id || "",
      image: blog?.image || "",
      status: blog?.status ?? true,

      seo: {
        metaTitle: blog?.seo?.metaTitle || "",
        metaDescription: blog?.seo?.metaDescription || "",
        keywords: blog?.seo?.keywords || [],
        canonicalUrl: blog?.seo?.canonicalUrl || "",

        ogTitle: blog?.seo?.ogTitle || "",
        ogDescription: blog?.seo?.ogDescription || "",
        ogImage: blog?.seo?.ogImage || "",

        twitterTitle: blog?.seo?.twitterTitle || "",
        twitterDescription: blog?.seo?.twitterDescription || "",
        twitterImage: blog?.seo?.twitterImage || "",

        facebookTitle: blog?.seo?.facebookTitle || "",
        facebookDescription: blog?.seo?.facebookDescription || "",
        facebookImage: blog?.seo?.facebookImage || "",
      },
    };
  }

  const handleGetBlog = async () => {
    try {
      setLoading(true);

      const [blogResponse, categoryResponse] = await Promise.all([
        getBlogs(),
        getBlogCategory(),
      ]);

      const blogData = blogResponse?.data || blogResponse;
      const categoryData =
        categoryResponse?.data || categoryResponse;

      setBlogs(blogData?.blogs || []);
      setCategories(categoryData?.categories || []);
    } catch (error) {
      console.error("Get blogs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetBlog();
  }, []);

  const handleCreate = () => {
    setEditingBlog(null);
    setForm(getInitialForm());
    setShowModal(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setForm(getInitialForm(blog));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingBlog(null);
    setForm(getInitialForm());
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await deleteBlog(id);

      setBlogs((prev) =>
        prev.filter((blog) => blog._id !== id)
      );
    } catch (error) {
      console.error("Delete blog error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete blog"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleInputChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSeoChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleKeywordsChange = (value) => {
    const keywords = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter blog title.");
      return;
    }

    if (!form.slug.trim()) {
      alert("Please enter blog slug.");
      return;
    }

    if (!form.categoryId) {
      alert("Please select category.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("author", form.author);
      formData.append("description", form.description);
      formData.append("content", form.content);
      formData.append("categoryId", form.categoryId);
      formData.append("status", String(form.status));

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      formData.append(
        "seo",
        JSON.stringify({
          metaTitle: form.seo.metaTitle,
          metaDescription: form.seo.metaDescription,
          keywords: form.seo.keywords,
          canonicalUrl: form.seo.canonicalUrl,

          ogTitle: form.seo.ogTitle,
          ogDescription: form.seo.ogDescription,
          ogImage: form.seo.ogImage,

          twitterTitle: form.seo.twitterTitle,
          twitterDescription: form.seo.twitterDescription,
          twitterImage: form.seo.twitterImage,

          facebookTitle: form.seo.facebookTitle,
          facebookDescription: form.seo.facebookDescription,
          facebookImage: form.seo.facebookImage,
        })
      );

      let response;

      if (editingBlog?._id) {
        response = await updateBlog(
          editingBlog._id,
          formData
        );
      } else {
        response = await createBlog(formData);
      }

      const responseData =
        response?.data?.blog ||
        response?.blog ||
        response?.data;

      if (editingBlog?._id) {
        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === editingBlog._id
              ? {
                  ...blog,
                  ...(responseData || {}),
                }
              : blog
          )
        );
      } else if (responseData) {
        setBlogs((prev) => [
          responseData,
          ...prev,
        ]);
      }

      setShowModal(false);
      setEditingBlog(null);
      setForm(getInitialForm());
    } catch (error) {
      console.error("Save blog error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to save blog."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-6">
      <div className="mx-auto max-w-[1600px]">

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Blog Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your blogs, categories and SEO
              information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <span className="text-xl leading-none">
              +
            </span>

            Create Blog
          </button>

        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Blogs"
            value={blogs.length}
            icon="📝"
          />

          <StatCard
            title="Published"
            value={
              blogs.filter(
                (blog) => blog.status === true
              ).length
            }
            icon="✓"
          />

          <StatCard
            title="Draft"
            value={
              blogs.filter(
                (blog) => blog.status === false
              ).length
            }
            icon="◷"
          />

          <StatCard
            title="Categories"
            value={categories.length}
            icon="▦"
          />

        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Blogs
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {blogs.length} blog
                {blogs.length === 1 ? "" : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetBlog}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <LoadingState />
          ) : blogs.length === 0 ? (
            <EmptyState
              onCreate={handleCreate}
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Blog
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Author
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Updated
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {blogs.map((blog) => (

                    <tr
                      key={blog._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">

                            {blog.image ? (
                              <img
                                src={blog.image}
                                alt={
                                  blog.title ||
                                  "Blog"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                                📝
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <h3 className="max-w-[360px] truncate text-sm font-semibold text-gray-900">
                              {blog.title}
                            </h3>

                            <p className="mt-1 max-w-[360px] truncate text-xs text-gray-500">
                              {blog.description}
                            </p>

                            <p className="mt-1 max-w-[360px] truncate text-[11px] text-gray-400">
                              /{blog.slug}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        {blog.categoryId ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {blog.categoryId.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No Category
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-sm text-gray-700">
                          {blog.author || "-"}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        {blog.status ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            Draft
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-sm text-gray-700">
                          {formatDate(
                            blog.updatedAt
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatTime(
                            blog.updatedAt
                          )}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(blog)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                blog._id
                              )
                            }
                            disabled={
                              deleteLoading ===
                              blog._id
                            }
                            className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteLoading ===
                            blog._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {showModal && (
        <BlogModal
          form={form}
          categories={categories}
          editingBlog={editingBlog}
          saving={saving}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onSeoChange={handleSeoChange}
          onImageChange={handleImageChange}
          onKeywordsChange={handleKeywordsChange}
        />
      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[350px] items-center justify-center">

      <div className="text-center">

        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

        <p className="text-sm text-gray-500">
          Loading blogs...
        </p>

      </div>

    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
        📝
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        No blogs found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Create your first blog to get started.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Create Blog
      </button>

    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}