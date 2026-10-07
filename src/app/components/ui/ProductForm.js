"use client";

import { useEffect, useState } from "react";
import {
  Package,
  CircleDollarSign,
  Images,
  ImagePlus,
  Upload,
  X,
  MessageCircle,
  Plus,
  Trash2,
  Search,
  FileText,
  Check,
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


export const emptyForm = {
  id: null,
  name: "",
  slug: "",
  des: "",
  shortDes: "",
  overView: "",
  price: "",
  discountedPrice: "",
  featureImage: null,
  image: [],
  faq: [],
  seo: {
    title: "",
    description: "",
    keywords: [],
    author: "",
    canonicalUrl: "",
    robotsMeta: "index, follow",
  },
  status: true,
};

function normalizeProduct(product) {
  if (!product) {
    return { ...emptyForm };
  }

  return {
    id: product.id || product._id || null,
    name: product.name || "",
    slug: product.slug || "",
    des: product.des || "",
    shortDes: product.shortDes || "",
    overView: product.overView || "",
    price: product.price != null ? String(product.price) : "",
    discountedPrice:
      product.discountedPrice != null ? String(product.discountedPrice) : "",

    featureImage: product.featureImage || null,
    image: Array.isArray(product.image)
      ? product.image.map((item, index) => {
        if (typeof item === "string") {
          return { id: `existing-${index}`, url: item, file: null };
        }

        return {
          id: item.id || `existing-${index}`,
          url: item.url || null,
          file: null,
        };
      })
      : [],
    faq: Array.isArray(product.faq)
      ? product.faq.map((item) => ({
        id: item.id,
        question: item.question || "",
        answer: item.answer || "",
      }))
      : [],
    seo: {
      title: product.seo?.title || "",
      description: product.seo?.description || "",
      keywords: Array.isArray(product.seo?.keywords) ? product.seo.keywords : [],
      author: product.seo?.author || "",
      canonicalUrl: product.seo?.canonicalUrl || "",
      robotsMeta: product.seo?.robotsMeta || "index, follow",
    },
    status: product.status != null ? Boolean(product.status) : true,
  };
}

function validateForm(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Product name is required.";
  }

  if (!form.slug?.trim()) {
    errors.slug = "Slug is required.";
  }

  if (!form.shortDes?.trim()) {
    errors.shortDes = "Short description is required.";
  }

  if (!form.des?.trim()) {
    errors.des = "Description is required.";
  }

  if (!form.overView?.trim()) {
    errors.overView = "Overview is required.";
  }

  if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) <= 0) {
    errors.price = "A valid price is required.";
  }

  if (
    form.discountedPrice !== "" &&
    form.discountedPrice != null &&
    (Number.isNaN(Number(form.discountedPrice)) ||
      Number(form.discountedPrice) < 0 ||
      Number(form.discountedPrice) >= Number(form.price))
  ) {
    errors.discountedPrice = "Discounted price must be lower than the regular price.";
  }

  if (!form.featureImage) {
    errors.featureImage = "A featured image is required.";
  }

  return errors;
}

function getImagePreview(input) {
  if (!input) {
    return null;
  }

  if (typeof File !== "undefined" && input instanceof File) {
    return URL.createObjectURL(input);
  }

  if (typeof input === "string") {
    return input;
  }

  if (typeof input === "object") {
    if (input.file) {
      return URL.createObjectURL(input.file);
    }

    if (input.url) {
      return input.url;
    }
  }

  return null;
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon size={18} />
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold">{title}</h3>

        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-red-500">{message}</p>;
}

function ImagePreview({ src, alt, large, onRemove }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-muted ${large ? "h-48 w-48" : "h-24 w-24"
        }`}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function FormDialogHeader({ isEditMode }) {
  return (
    <DialogHeader className="shrink-0 border-b bg-background px-5 py-5 sm:px-7">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <Package size={20} />
        </div>

        <div className="min-w-0">
          <DialogTitle className="text-xl sm:text-2xl">
            {isEditMode ? "Edit Product" : "Create Product"}
          </DialogTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product information, pricing, images and SEO.
          </p>
        </div>
      </div>
    </DialogHeader>
  );
}

function BasicInformationSection({ form, errors, onChange }) {
  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={Package}
        title="Basic Information"
        description="Add the main information for your product."
      />

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label>
            Product Name <span className="text-red-500">*</span>
          </Label>

          <Input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Whey Protein Powder"
            className={errors.name ? "border-red-400" : ""}
          />

          <FieldError message={errors.name} />
        </div>

        <div className="grid gap-2">
          <Label>
            Slug <span className="text-red-500">*</span>
          </Label>

          <Input
            value={form.slug}
            onChange={(event) =>
              onChange("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))
            }
            placeholder="whey-protein-powder"
            className={errors.slug ? "border-red-400" : ""}
          />

          <FieldError message={errors.slug} />
        </div>

        <div className="grid gap-2">
          <Label>
            Short Description <span className="text-red-500">*</span>
          </Label>

          <Textarea
            value={form.shortDes}
            onChange={(event) => onChange("shortDes", event.target.value)}
            placeholder="Premium whey protein for your daily fitness routine."
            rows={3}
            className={errors.shortDes ? "border-red-400" : ""}
          />

          <FieldError message={errors.shortDes} />
        </div>

        <div className="grid gap-2">
          <Label>
            Description <span className="text-red-500">*</span>
          </Label>

          <Textarea
            value={form.des}
            onChange={(event) => onChange("des", event.target.value)}
            placeholder="Premium whey protein powder designed to support your daily fitness and protein intake."
            rows={5}
            className={errors.des ? "border-red-400" : ""}
          />

          <FieldError message={errors.des} />
        </div>

        <div className="grid gap-2">
          <Label>
            Overview <span className="text-red-500">*</span>
          </Label>

          <Textarea
            value={form.overView}
            onChange={(event) => onChange("overView", event.target.value)}
            placeholder="High-quality whey protein with a smooth texture and great taste."
            rows={4}
            className={errors.overView ? "border-red-400" : ""}
          />

          <FieldError message={errors.overView} />
        </div>
      </div>
    </section>
  );
}

function PricingSection({ form, errors, onChange }) {
  const hasDiscount =
    form.price && form.discountedPrice && Number(form.discountedPrice) < Number(form.price);

  const discountPercent = hasDiscount
    ? Math.round(((Number(form.price) - Number(form.discountedPrice)) / Number(form.price)) * 100)
    : 0;

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={CircleDollarSign}
        title="Pricing"
        description="Set your regular and discounted product price."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>
            Price <span className="text-red-500">*</span>
          </Label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              ₹
            </span>

            <Input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) => onChange("price", event.target.value)}
              placeholder="4000"
              className={`pl-8 ${errors.price ? "border-red-400" : ""}`}
            />
          </div>

          <FieldError message={errors.price} />
        </div>

        <div className="grid gap-2">
          <Label>Discounted Price</Label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              ₹
            </span>

            <Input
              type="number"
              min="0"
              value={form.discountedPrice}
              onChange={(event) => onChange("discountedPrice", event.target.value)}
              placeholder="3500"
              className={`pl-8 ${errors.discountedPrice ? "border-red-400" : ""}`}
            />
          </div>

          <FieldError message={errors.discountedPrice} />
        </div>
      </div>

      {hasDiscount && (
        <div className="mt-5 grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Discount</p>
            <p className="mt-1 text-xl font-bold">{discountPercent}% OFF</p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground">Selling Price</p>
            <p className="mt-1 text-xl font-bold">
              ₹{Number(form.discountedPrice).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function FeaturedImageField({ form, errors, onFeatureImage, onRemoveFeatureImage }) {
  const featureImagePreview = getImagePreview(form.featureImage);

  return (
    <div>
      <div className="mb-4">
        <Label>
          Featured Image <span className="text-red-500">*</span>
        </Label>

        <p className="mt-1 text-xs text-muted-foreground">
          This image will be used as the main product image.
        </p>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {featureImagePreview ? (
          <ImagePreview
            src={featureImagePreview}
            alt="Featured product"
            large
            onRemove={onRemoveFeatureImage}
          />
        ) : (
          <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 text-center transition hover:bg-muted/40">
            <ImagePlus size={30} className="mb-3 text-muted-foreground" />

            <span className="text-sm font-semibold">Add Image</span>

            <span className="mt-1 px-4 text-xs text-muted-foreground">
              JPG, PNG, WEBP
              <br />
              Maximum 5MB
            </span>

            <input type="file" accept="image/*" className="hidden" onChange={onFeatureImage} />
          </label>
        )}

        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted">
          <Upload size={16} />
          {featureImagePreview ? "Change Image" : "Upload Image"}

          <input type="file" accept="image/*" className="hidden" onChange={onFeatureImage} />
        </label>
      </div>

      <FieldError message={errors.featureImage} />
    </div>
  );
}

function GalleryImageCard({ item, index, onRemove }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-muted">
      <div className="aspect-square">
        <img
          src={getImagePreview(item)}
          alt={`Product image ${index + 1}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
        <span className="text-xs font-semibold text-white">Image {index + 1}</span>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function GalleryImagesField({ form, onGalleryImages, onRemoveGalleryImage }) {
  return (
    <div className="border-t pt-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>Gallery Images</Label>
          <p className="mt-1 text-xs text-muted-foreground">Add additional product images.</p>
        </div>

        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted">
          <Upload size={15} />
          Add Images

          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onGalleryImages}
          />
        </label>
      </div>

      {form.image?.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {form.image.map((item, index) => (
            <GalleryImageCard
              key={item.id || index}
              item={item}
              index={index}
              onRemove={onRemoveGalleryImage}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 px-5 py-12 text-center">
          <Images size={30} className="mb-3 text-muted-foreground" />
          <p className="text-sm font-semibold">No gallery images</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add additional images using the button above.
          </p>
        </div>
      )}
    </div>
  );
}

function ImagesSection({
  form,
  errors,
  onFeatureImage,
  onRemoveFeatureImage,
  onGalleryImages,
  onRemoveGalleryImage,
}) {
  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={Images}
        title="Product Images"
        description="Add the main product image and additional gallery images."
      />

      <div className="space-y-7">
        <FeaturedImageField
          form={form}
          errors={errors}
          onFeatureImage={onFeatureImage}
          onRemoveFeatureImage={onRemoveFeatureImage}
        />

        <GalleryImagesField
          form={form}
          onGalleryImages={onGalleryImages}
          onRemoveGalleryImage={onRemoveGalleryImage}
        />
      </div>
    </section>
  );
}

function FaqItem({ item, index, onUpdate, onRemove }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
            {index + 1}
          </div>

          <div>
            <p className="text-sm font-semibold">FAQ {index + 1}</p>
            <p className="text-xs text-muted-foreground">Question and answer</p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label>Question</Label>

          <Input
            value={item.question || ""}
            onChange={(event) => onUpdate(index, "question", event.target.value)}
            placeholder="What are the key benefits of this product?"
          />
        </div>

        <div className="grid gap-2">
          <Label>Answer</Label>

          <Textarea
            value={item.answer || ""}
            onChange={(event) => onUpdate(index, "answer", event.target.value)}
            placeholder="Write a clear and helpful answer..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

function FaqSection({ form, onAddFaq, onUpdateFaq, onRemoveFaq }) {
  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={MessageCircle}
        title="Frequently Asked Questions"
        description="Add questions and answers customers may have about this product."
      />

      <div className="mb-5 flex justify-end">
        <Button type="button" variant="outline" onClick={onAddFaq} className="rounded-xl">
          <Plus size={16} className="mr-2" />
          Add Question
        </Button>
      </div>

      {form.faq?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 px-5 py-12 text-center">
          <MessageCircle size={30} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-semibold">No FAQs added</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add frequently asked questions for your customers.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {form.faq.map((item, index) => (
            <FaqItem
              key={item.id || `faq-${index}`}
              item={item}
              index={index}
              onUpdate={onUpdateFaq}
              onRemove={onRemoveFaq}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SeoSection({ form, onChange }) {
  const [keywordInput, setKeywordInput] = useState("");
  const seo = form.seo || {};
  const seoLength = seo.description?.length || 0;
  const keywords = seo.keywords || [];

  const updateSeo = (field, value) => {
    onChange("seo", { ...seo, [field]: value });
  };

  const addKeyword = (raw) => {
    const value = raw.trim().replace(/,$/, "");
    if (!value) return;
    if (keywords.includes(value)) {
      setKeywordInput("");
      return;
    }
    updateSeo("keywords", [...keywords, value]);
    setKeywordInput("");
  };

  const removeKeyword = (index) => {
    updateSeo("keywords", keywords.filter((_, i) => i !== index));
  };

  const handleKeywordKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword(keywordInput);
    } else if (event.key === "Backspace" && !keywordInput && keywords.length) {
      removeKeyword(keywords.length - 1);
    }
  };

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={Search}
        title="SEO"
        description="Configure the SEO metadata for this product."
      />

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label>SEO Title</Label>
          <Input
            value={seo.title || ""}
            onChange={(event) => updateSeo("title", event.target.value)}
            placeholder="SEO title"
          />
        </div>

        <div className="grid gap-2">
          <Label>SEO Description</Label>
          <Textarea
            value={seo.description || ""}
            onChange={(event) => updateSeo("description", event.target.value)}
            placeholder="SEO description"
            rows={4}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Recommended: 120–160 characters</span>
            <span
              className={
                seoLength > 160
                  ? "font-medium text-orange-500"
                  : seoLength >= 120
                    ? "font-medium text-emerald-600"
                    : ""
              }
            >
              {seoLength} characters
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>SEO Keywords</Label>
            <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
              {keywords.map((keyword, index) => (
                <span
                  key={`${keyword}-${index}`}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    aria-label={`Remove ${keyword}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={handleKeywordKeyDown}
                onBlur={() => addKeyword(keywordInput)}
                placeholder={keywords.length ? "" : "Type keyword and press Enter"}
                className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Type a keyword and press Enter or comma to add it.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Author</Label>
            <Input
              value={seo.author || ""}
              onChange={(event) => updateSeo("author", event.target.value)}
              placeholder="Author"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Canonical URL</Label>
          <Input
            value={seo.canonicalUrl || ""}
            onChange={(event) => updateSeo("canonicalUrl", event.target.value)}
            placeholder="https://example.com/product/..."
          />
        </div>

        <div className="grid gap-2">
          <Label>Robots Meta Tag</Label>
          <select
            value={seo.robotsMeta || "index, follow"}
            onChange={(event) => updateSeo("robotsMeta", event.target.value)}
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="index, follow">index, follow</option>
            <option value="index, nofollow">index, nofollow</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </div>
      </div>
    </section>
  );
}

function StatusSection({ form, onChange }) {
  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={FileText}
        title="Product Status"
        description="Control whether this product is active or inactive."
      />

      <div className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${form.status ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              }`}
          >
            {form.status ? <Check size={18} /> : <X size={18} />}
          </div>

          <div>
            <p className="text-sm font-semibold">{form.status ? "Active" : "Inactive"}</p>
            <p className="text-xs text-muted-foreground">
              {form.status ? "Product is visible to customers." : "Product is hidden from customers."}
            </p>
          </div>
        </div>

        <Switch
          checked={Boolean(form.status)}
          onCheckedChange={(checked) => onChange("status", checked)}
        />
      </div>
    </section>
  );
}

function SummarySection({ form }) {
  const galleryCount = form.image?.length || 0;
  const faqCount = form.faq?.length || 0;

  return (
    <div className="rounded-2xl border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check size={17} className="text-emerald-600" />
        </div>

        <div>
          <p className="text-sm font-semibold">Product Summary</p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {form.name || "Product name"} will be saved with {galleryCount} gallery image
            {galleryCount === 1 ? "" : "s"} and {faqCount} FAQ{faqCount === 1 ? "" : "s"}.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormFooter({ isEditMode, saving, onCancel, onSubmit }) {
  return (
    <DialogFooter className="shrink-0 border-t bg-background px-5 py-4 sm:px-7">
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl"
        >
          Cancel
        </Button>

        <Button type="button" onClick={onSubmit} disabled={saving} className="rounded-xl">
          {saving ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </DialogFooter>
  );
}

export default function ProductForm({ open, onOpenChange, product, onSave, saving }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(normalizeProduct(product));
    setErrors({});
  }, [open, product]);

  function handleChange(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function handleFeatureImage(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setForm((previous) => ({
      ...previous,
      featureImage: file,
    }));

    setErrors((previous) => ({
      ...previous,
      featureImage: undefined,
    }));

    event.target.value = "";
  }

  function removeFeatureImage() {
    setForm((previous) => ({
      ...previous,
      featureImage: null,
    }));
  }

  function handleGalleryImages(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        return false;
      }

      return true;
    });

    if (!validFiles.length) {
      alert("Please select valid images under 5MB.");
      event.target.value = "";
      return;
    }

    const newImages = validFiles.map((file, index) => ({
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `new-${Date.now()}-${index}`,
      url: null,
      file,
    }));

    setForm((previous) => ({
      ...previous,
      image: [...(previous.image || []), ...newImages],
    }));

    event.target.value = "";
  }

  function removeGalleryImage(index) {
    setForm((previous) => ({
      ...previous,
      image: (previous.image || []).filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  function addFaq() {
    setForm((previous) => ({
      ...previous,
      faq: [...(previous.faq || []), { question: "", answer: "" }],
    }));
  }

  function updateFaq(index, field, value) {
    setForm((previous) => {
      const faq = [...(previous.faq || [])];

      faq[index] = {
        ...faq[index],
        [field]: value,
      };

      return {
        ...previous,
        faq,
      };
    });
  }

  function removeFaq(index) {
    setForm((previous) => ({
      ...previous,
      faq: (previous.faq || []).filter((_, faqIndex) => faqIndex !== index),
    }));
  }

  function handleSubmit() {
    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const productId = form.id || product?.id || product?._id || null;

    const payload = {
      ...(productId ? { id: String(productId) } : {}),
      name: form.name.trim(),
      slug: form.slug.trim(),
      des: form.des.trim(),
      shortDes: form.shortDes.trim(),
      overView: form.overView.trim(),
      price: String(form.price),
      discountedPrice:
        form.discountedPrice === "" || form.discountedPrice === null
          ? ""
          : String(form.discountedPrice),
      featureImage: form.featureImage || null,
      image: Array.isArray(form.image) ? form.image : [],
      faq: Array.isArray(form.faq)
        ? form.faq
          .filter((item) => item?.question?.trim() || item?.answer?.trim())
          .map((item) => ({
            ...(item?.id ? { id: item.id } : {}),
            question: item?.question?.trim() || "",
            answer: item?.answer?.trim() || "",
          }))
        : [],
      seo: {
        title: form.seo?.title?.trim() || "",
        description: form.seo?.description?.trim() || "",
        keywords: Array.isArray(form.seo?.keywords) ? form.seo.keywords : [],
        author: form.seo?.author?.trim() || "",
        canonicalUrl: form.seo?.canonicalUrl?.trim() || "",
        robotsMeta: form.seo?.robotsMeta || "index, follow",
      },
      status: Boolean(form.status),
    };

    if (typeof onSave !== "function") {
      console.error("onSave is not passed to ProductForm");
      return;
    }

    onSave(payload);
  }

  const isEditMode = Boolean(form.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex
          h-[100dvh]
          max-h-[100dvh]
          w-full
          flex-col
          gap-0
          overflow-hidden
          rounded-none
          p-0
          sm:h-[95vh]
          sm:max-h-[95vh]
          sm:w-[calc(100%-2rem)]
          sm:rounded-2xl
          sm:max-w-5xl
        "
      >
        <FormDialogHeader isEditMode={isEditMode} />

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
          <div className="space-y-6 px-4 py-5 sm:px-7 sm:py-7">
            <BasicInformationSection form={form} errors={errors} onChange={handleChange} />

            <PricingSection form={form} errors={errors} onChange={handleChange} />

            <ImagesSection
              form={form}
              errors={errors}
              onFeatureImage={handleFeatureImage}
              onRemoveFeatureImage={removeFeatureImage}
              onGalleryImages={handleGalleryImages}
              onRemoveGalleryImage={removeGalleryImage}
            />

            <FaqSection
              form={form}
              onAddFaq={addFaq}
              onUpdateFaq={updateFaq}
              onRemoveFaq={removeFaq}
            />

            <SeoSection form={form} onChange={handleChange} />

            <StatusSection form={form} onChange={handleChange} />

            <SummarySection form={form} />
          </div>
        </div>

        <FormFooter
          isEditMode={isEditMode}
          saving={saving}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}