"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, Plus, Save, Trash2, Upload } from "lucide-react";
import StoreSelect from "@/components/ui/store-select";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/slugify";
import { formatPrice } from "@/lib/format";

function splitNotes(value) {
  return String(value || "").split(",").map((note) => note.trim()).filter(Boolean);
}

export default function ProductEditor({ product, categories }) {
  const router = useRouter();
  const editing = Boolean(product?._id);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(product?.images?.length ? product.images : []);
  const [notes, setNotes] = useState({
    top: (product?.notes?.top || []).join(", "),
    middle: (product?.notes?.middle || []).join(", "),
    base: (product?.notes?.base || []).join(", "),
  });
  const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      tagline: product?.tagline || "",
      description: product?.description || "",
      price: product?.price ?? "",
      compareAtPrice: product?.compareAtPrice ?? null,
      gender: product?.gender || "কেজুর গুর",
      categorySlug: product?.categorySlug || product?.category?.slug || categories?.[0]?.slug || "",
      images: product?.images || [],
      sizes: product?.sizes?.length ? product.sizes : [{ label: "১ কেজি", price: "", stock: 0 }],
      notes: product?.notes || { top: [], middle: [], base: [] },
      isFeatured: Boolean(product?.isFeatured),
      isBestSeller: Boolean(product?.isBestSeller),
      isNewArrival: Boolean(product?.isNewArrival),
      isActive: product ? Boolean(product.isActive) : true,
      seoTitle: product?.seoTitle || "",
      seoDescription: product?.seoDescription || "",
    },
  });
  const { fields: sizeFields, append: addSize, remove: removeSize } = useFieldArray({ control, name: "sizes" });
  const nameField = register("name");

  function updateImage(index, value) {
    const next = [...images];
    next[index] = value;
    setImages(next);
    setValue("images", next.filter(Boolean), { shouldValidate: true, shouldDirty: true });
  }

  function addImage() {
    setImages((current) => [...current, ""]);
  }

  function removeImage(index) {
    const next = images.filter((_, currentIndex) => currentIndex !== index);
    setImages(next);
    setValue("images", next.filter(Boolean), { shouldValidate: true, shouldDirty: true });
  }

  async function uploadImages(event) {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    if (!selectedFiles.length) return;
    if (selectedFiles.length + images.filter(Boolean).length > 8) {
      setMessage("একটি পণ্যে সর্বোচ্চ ৮টি ছবি রাখা যাবে।");
      return;
    }
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    setMessage("");
    setUploading(true);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ছবি আপলোড করা যায়নি।");
      const next = [...images.filter(Boolean), ...(result.urls || [])];
      setImages(next);
      setValue("images", next, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      setMessage(error.message || "ছবি আপলোড করা যায়নি।");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values) {
    setMessage("");
    setSaving(true);
    const payload = {
      ...values,
      images: images.filter(Boolean),
      notes: { top: splitNotes(notes.top), middle: splitNotes(notes.middle), base: splitNotes(notes.base) },
    };
    try {
      const response = await fetch(editing ? `/api/admin/products/${product._id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "পণ্য সংরক্ষণ করা যায়নি।");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error.message || "পণ্য সংরক্ষণ করা যায়নি।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-product-editor">
      <div className="admin-page-heading"><div><span className="eyebrow">ক্যাটালগ ম্যানেজমেন্ট</span><h1>{editing ? "পণ্য সম্পাদনা" : "নতুন পণ্য"}</h1><p>পণ্যের বর্ণনা, সাইজ, স্টক এবং সার্চের তথ্য সম্পাদনা করুন।</p></div><Link className="button button--outline" href="/admin/products"><ArrowLeft aria-hidden="true" />পণ্যে ফিরে যান</Link></div>
      {message ? <div className="form-message form-message--error" role="alert">{message}</div> : null}
      {!categories?.length ? <div className="admin-demo-notice" role="status">পণ্য যোগ করার আগে একটি সক্রিয় ক্যাটাগরি তৈরি করুন। <Link href="/admin/categories">ক্যাটাগরি তৈরি করুন</Link></div> : null}
      <form className="product-editor-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="product-editor-main">
          <section className="admin-panel"><div className="admin-panel__header"><div><h2>পণ্যের পরিচিতি</h2><p>স্টোরফ্রন্টে প্রদর্শিত মৌলিক তথ্য।</p></div></div><div className="admin-form-grid">
            <label className="admin-form-field"><span>পণ্যের নাম</span><input {...nameField} onBlur={(event) => { nameField.onBlur(event); if (!getValues("slug")) setValue("slug", slugify(event.target.value), { shouldValidate: true }); }} aria-invalid={Boolean(errors.name)} />{errors.name ? <small className="field-error">{errors.name.message}</small> : null}</label>
            <label className="admin-form-field"><span>URL স্লাগ</span><input {...register("slug")} placeholder="aronyer-nirobota" aria-invalid={Boolean(errors.slug)} />{errors.slug ? <small className="field-error">{errors.slug.message}</small> : null}</label>
            <label className="admin-form-field"><span>সংক্ষিপ্ত স্বাদ</span><input {...register("tagline")} placeholder="মিষ্টি · আস্ত রস · নরম" /></label>
            <label className="admin-form-field"><span>ক্যাটাগরি</span><Controller name="categorySlug" control={control} render={({ field }) => (
              <StoreSelect value={field.value} onChange={field.onChange} invalid={Boolean(errors.categorySlug)} ariaLabel="ক্যাটাগরি" options={(categories || []).map((category) => ({ value: category.slug, label: category.name }))} />
            )} />{errors.categorySlug ? <small className="field-error">{errors.categorySlug.message}</small> : null}</label>
            <label className="admin-form-field"><span>ধরন</span><Controller name="gender" control={control} render={({ field }) => (
              <StoreSelect value={field.value} onChange={field.onChange} ariaLabel="ধরন" options={[
                { value: "কেজুর গুর", label: "কেজুর গুর" },
                { value: "কেজুর রস", label: "কেজুর রস" },
                { value: "গুরের মিষ্টি", label: "গুরের মিষ্টি" },
              ]} />
            )} /></label>
            <label className="admin-form-field admin-form-field--wide"><span>বিস্তারিত বর্ণনা</span><textarea rows="5" {...register("description")} aria-invalid={Boolean(errors.description)} />{errors.description ? <small className="field-error">{errors.description.message}</small> : null}</label>
          </div></section>

          <section className="admin-panel"><div className="admin-panel__header"><div><h2>ছবি</h2><p>একাধিক পণ্য-ছবি আপলোড বা নিরাপদ URL যোগ করুন।</p></div><div className="admin-editor-inline"><label className="admin-upload-control"><Upload aria-hidden="true" /><span>{uploading ? "আপলোড হচ্ছে…" : "ফাইল আপলোড"}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} onChange={uploadImages} aria-label="একাধিক পণ্য-ছবি আপলোড করুন" /></span></label><button type="button" className="admin-table-action" onClick={addImage}><Plus aria-hidden="true" />URL যোগ করুন</button></div></div>
            <div className="product-image-editor">{images.map((image, index) => <div className="product-image-editor__row" key={`image-${index}`}><input type="url" value={image} onChange={(event) => updateImage(index, event.target.value)} placeholder="/images/your-product.png" aria-label={`পণ্যের ছবির URL ${index + 1}`} />{image.startsWith("/") || image.startsWith("https://images.unsplash.com/") || image.includes(".public.blob.vercel-storage.com/") ? <span className="product-image-editor__preview"><Image src={image} alt={`পণ্যের ছবি ${index + 1}`} fill sizes="64px" /></span> : null}<button type="button" className="admin-table-action admin-table-action--danger" onClick={() => removeImage(index)} aria-label={`ছবি ${index + 1} সরান`}><Trash2 aria-hidden="true" /></button></div>)}{!images.length ? <p className="admin-form-hint">এখনও ছবি যোগ করা হয়নি। অন্তত একটি URL প্রয়োজন।</p> : null}</div>
            {errors.images ? <small className="field-error">{errors.images.message || "কমপক্ষে একটি বৈধ ছবি যোগ করুন।"}</small> : null}
            <p className="admin-form-hint">JPG, PNG বা WebP · প্রতিটি সর্বোচ্চ ৫ MB · এক পণ্যে সর্বোচ্চ ৮টি ছবি। ফাইল MongoDB GridFS-এ সংরক্ষিত হয়।</p>
          </section>

          <section className="admin-panel"><div className="admin-panel__header"><div><h2>স্বাদের স্তর</h2><p>কমা দিয়ে আলাদা করে প্রতিটি স্বাদ লিখুন।</p></div></div><div className="admin-form-grid">{[["top", "শুরুর স্বাদ"], ["middle", "মাঝের স্বাদ"], ["base", "শেষের স্বাদ"]].map(([key, label]) => <label className="admin-form-field" key={key}><span>{label}</span><input value={notes[key]} onChange={(event) => setNotes((current) => ({ ...current, [key]: event.target.value }))} placeholder="খাঁটি মিষ্টি, কড়ার গাঢ়তা" /></label>)}</div></section>

          <section className="admin-panel"><div className="admin-panel__header"><div><h2>সার্চ ইঞ্জিন তথ্য</h2><p>পণ্যের পেজের শিরোনাম ও বর্ণনা।</p></div></div><div className="admin-form-grid"><label className="admin-form-field"><span>SEO শিরোনাম</span><input {...register("seoTitle")} /></label><label className="admin-form-field admin-form-field--wide"><span>SEO বর্ণনা</span><textarea rows="3" {...register("seoDescription")} /></label></div></section>
        </div>

        <aside className="product-editor-side">
          <section className="admin-panel"><div className="admin-panel__header"><div><h2>দাম ও স্টক</h2><p>প্রতিটি সাইজের দাম আলাদাভাবে সেট করুন।</p></div></div><div className="admin-form-grid admin-form-grid--single"><label className="admin-form-field"><span>প্রধান প্রদর্শিত মূল্য (৳)</span><input type="number" min="1" step="1" {...register("price")} aria-invalid={Boolean(errors.price)} />{errors.price ? <small className="field-error">{errors.price.message}</small> : null}</label><label className="admin-form-field"><span>আগের মূল্য (ঐচ্ছিক)</span><input type="number" min="0" step="1" {...register("compareAtPrice")} /></label></div>
            <div className="product-size-editor"><div className="product-size-editor__heading"><strong>সাইজ</strong><strong>দাম</strong><strong>স্টক</strong><span /></div>{sizeFields.map((field, index) => <div className="product-size-editor__row" key={field.id}><input aria-label={`সাইজ ${index + 1}`} placeholder="১ কেজি" {...register(`sizes.${index}.label`)} /><input aria-label={`সাইজ ${index + 1}-এর দাম`} type="number" min="1" {...register(`sizes.${index}.price`)} /><input aria-label={`সাইজ ${index + 1}-এর স্টক`} type="number" min="0" {...register(`sizes.${index}.stock`)} /><button type="button" className="admin-table-action admin-table-action--danger" onClick={() => removeSize(index)} disabled={sizeFields.length <= 1} aria-label={`সাইজ ${index + 1} সরান`}><Trash2 aria-hidden="true" /></button></div>)}<button className="text-link product-size-editor__add" type="button" onClick={() => addSize({ label: "", price: "", stock: 0 })}><Plus aria-hidden="true" />আরেকটি সাইজ যোগ করুন</button></div>
          </section>
          <section className="admin-panel"><div className="admin-panel__header"><div><h2>প্রকাশনা</h2><p>স্টোরফ্রন্টে পণ্যের অবস্থান বেছে নিন।</p></div></div><div className="product-flags">{[["isActive", "পণ্য প্রকাশিত"], ["isFeatured", "নির্বাচিত পণ্য"], ["isBestSeller", "বেস্টসেলার"], ["isNewArrival", "নতুন সংগ্রহ"]].map(([name, label]) => <label className="admin-form-field admin-form-field--checkbox" key={name}><input type="checkbox" {...register(name)} /><span>{label}</span></label>)}</div></section>
          <div className="product-editor-actions"><button className="button button--dark" type="submit" disabled={saving || !categories?.length}>{saving ? "সংরক্ষণ হচ্ছে…" : "পণ্য সংরক্ষণ করুন"}<Save aria-hidden="true" /></button><Link className="button button--outline" href="/admin/products">বাতিল</Link></div>
        </aside>
      </form>
      <p className="admin-form-hint product-editor-price-hint">পূর্বরূপ মূল্য: {formatPrice(Number(getValues("price") || 0))}</p>
    </section>
  );
}
