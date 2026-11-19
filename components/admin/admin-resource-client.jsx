"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check, Edit3, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import StoreSelect from "@/components/ui/store-select";
import AdminPagination from "@/components/admin/admin-pagination";
import { formatDate, formatPrice } from "@/lib/format";

function canPreviewImage(value) {
  if (typeof value !== "string" || !value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return value.startsWith("https://images.unsplash.com/") || value.includes(".public.blob.vercel-storage.com/");
}

const fieldSets = {
  customers: [
    { name: "customer.name", label: "গ্রাহকের নাম", type: "text", required: true },
    { name: "customer.phone", label: "ফোন নম্বর", type: "tel", required: true },
    { name: "customer.email", label: "ইমেইল", type: "email" },
  ],
  categories: [
    { name: "name", label: "ক্যাটাগরির নাম", type: "text", required: true },
    { name: "slug", label: "স্লাগ", type: "text", required: true },
    { name: "eyebrow", label: "ছোট শিরোনাম", type: "text" },
    { name: "description", label: "বর্ণনা", type: "textarea", wide: true },
    { name: "image", label: "কভার ছবি", type: "image", required: true, wide: true },
    { name: "sortOrder", label: "ক্রম", type: "number" },
    { name: "isActive", label: "প্রকাশিত", type: "checkbox" },
  ],
  orders: [{ name: "status", label: "অর্ডারের অবস্থা", type: "select", options: [["new", "নতুন"], ["confirmed", "নিশ্চিত"], ["processing", "প্রক্রিয়াধীন"], ["shipped", "পাঠানো হয়েছে"], ["delivered", "সম্পন্ন"], ["cancelled", "বাতিল"]] }],
  reviews: [
    { name: "orderProduct", label: "অর্ডার ও পণ্য", type: "orderProduct", required: true },
    { name: "rating", label: "রেটিং বেছে নিন", type: "rating", required: true },
    { name: "comment", label: "রিভিউ", type: "textarea", required: true, wide: true },
    { name: "status", label: "প্রকাশনার অবস্থা", type: "select", options: [["pending", "পর্যালোচনাধীন"], ["approved", "অনুমোদিত"], ["rejected", "প্রত্যাখ্যাত"]] },
  ],
  coupons: [
    { name: "code", label: "কুপন কোড", type: "text", required: true },
    { name: "type", label: "ছাড়ের ধরন", type: "select", options: [["percent", "শতাংশ"], ["fixed", "নির্দিষ্ট টাকা"]] },
    { name: "value", label: "ছাড়ের পরিমাণ", type: "number", required: true },
    { name: "minOrderAmount", label: "সর্বনিম্ন অর্ডার", type: "number" },
    { name: "maxDiscount", label: "সর্বোচ্চ ছাড়", type: "number" },
    { name: "startsAt", label: "শুরু", type: "datetime-local" },
    { name: "endsAt", label: "শেষ", type: "datetime-local" },
    { name: "usageLimit", label: "ব্যবহারের সীমা", type: "number" },
    { name: "isActive", label: "সক্রিয়", type: "checkbox" },
  ],
  hero: [
    { name: "eyebrow", label: "ছোট পরিচিতি", type: "text" },
    { name: "title", label: "প্রধান শিরোনাম", type: "textarea", required: true, wide: true },
    { name: "subtitle", label: "সাবটাইটেল", type: "textarea", wide: true },
    { name: "image", label: "হিরো ছবি", type: "image", required: true, wide: true },
    { name: "primaryLabel", label: "প্রধান বাটনের লেখা", type: "text", required: true },
    { name: "primaryHref", label: "প্রধান বাটনের লিংক", type: "text", required: true },
    { name: "secondaryLabel", label: "দ্বিতীয় বাটনের লেখা", type: "text" },
    { name: "secondaryHref", label: "দ্বিতীয় বাটনের লিংক", type: "text" },
  ],
  banners: [
    { name: "title", label: "ব্যানারের শিরোনাম", type: "text", required: true },
    { name: "subtitle", label: "বর্ণনা", type: "textarea", wide: true },
    { name: "image", label: "ছবি", type: "image", required: true, wide: true },
    { name: "ctaLabel", label: "বাটনের লেখা", type: "text" },
    { name: "ctaHref", label: "বাটনের লিংক", type: "text", required: true },
    { name: "sortOrder", label: "ক্রম", type: "number" },
    { name: "startsAt", label: "শুরু", type: "datetime-local" },
    { name: "endsAt", label: "শেষ", type: "datetime-local" },
    { name: "isActive", label: "সক্রিয়", type: "checkbox" },
  ],
  testimonials: [
    { name: "name", label: "নাম", type: "text", required: true },
    { name: "location", label: "শহর", type: "text" },
    { name: "quote", label: "মন্তব্য", type: "textarea", required: true, wide: true },
    { name: "rating", label: "রেটিং (১–৫)", type: "number", required: true },
    { name: "sortOrder", label: "ক্রম", type: "number" },
    { name: "isPublished", label: "প্রকাশিত", type: "checkbox" },
  ],
  newsletter: [{ name: "isSubscribed", label: "সাবস্ক্রাইব করা", type: "checkbox" }],
  settings: [
    { name: "brandName", label: "ব্র্যান্ডের নাম", type: "text", required: true },
    { name: "brandDescriptor", label: "ব্র্যান্ড পরিচিতি", type: "text" },
    { name: "tagline", label: "ট্যাগলাইন", type: "text", wide: true },
    { name: "logoUrl", label: "লোগো", type: "image", wide: true },
    { name: "supportPhone", label: "ফোন", type: "text" },
    { name: "supportEmail", label: "ইমেইল", type: "email" },
    { name: "address", label: "ঠিকানা", type: "text", wide: true },
    { name: "deliveryChargeDhaka", label: "ডেলিভারি চার্জ — ঢাকার ভিতরে (৳, ০ = ফ্রি)", type: "number" },
    { name: "deliveryChargeOutsideDhaka", label: "ডেলিভারি চার্জ — ঢাকার বাইরে (৳, ০ = ফ্রি)", type: "number" },
    { name: "freeDeliveryThreshold", label: "ফ্রি ডেলিভারির ন্যূনতম অর্ডার", type: "number" },
    { name: "announcementText", label: "উপরের ঘোষণা", type: "text", wide: true },
    { name: "announcementActive", label: "ঘোষণা দেখান", type: "checkbox" },
    { name: "seoTitle", label: "SEO শিরোনাম", type: "text", wide: true },
    { name: "seoDescription", label: "SEO বর্ণনা", type: "textarea", wide: true },
    { name: "brandStory.eyebrow", label: "ব্র্যান্ড স্টোরি · ছোট শিরোনাম", type: "text" },
    { name: "brandStory.title", label: "ব্র্যান্ড স্টোরি · শিরোনাম", type: "text", wide: true },
    { name: "brandStory.body", label: "ব্র্যান্ড স্টোরি · বর্ণনা", type: "textarea", wide: true },
    { name: "brandStory.image", label: "ব্র্যান্ড স্টোরি · ছবি", type: "image", wide: true },
    { name: "brandStory.linkLabel", label: "ব্র্যান্ড স্টোরি · বাটনের লেখা", type: "text" },
    { name: "brandStory.linkHref", label: "ব্র্যান্ড স্টোরি · বাটনের লিংক", type: "text" },
    { name: "socialLinks.instagram", label: "Instagram লিংক", type: "url" },
    { name: "socialLinks.facebook", label: "Facebook লিংক", type: "url" },
    { name: "socialLinks.twitter", label: "Twitter / X লিংক", type: "url" },
    { name: "socialGallery", label: "সোশ্যাল গ্যালারি JSON", type: "json", wide: true },
  ],
};

const resourceMeta = {
  categories: { title: "ক্যাটাগরি", subtitle: "সংগ্রহ তৈরি করুন এবং স্টোরফ্রন্টে প্রকাশ নিয়ন্ত্রণ করুন।", create: "নতুন ক্যাটাগরি", columns: ["name", "slug", "isActive", "updatedAt"], deletable: true },
  orders: { title: "অর্ডার", subtitle: "অর্ডারের অবস্থা ও গ্রাহকের ডেলিভারি তথ্য দেখুন।", columns: ["orderNumber", "customer", "total", "status", "createdAt"], deletable: true },
  customers: { title: "গ্রাহক", subtitle: "অর্ডার থেকে সংগৃহীত গ্রাহক তালিকা।", columns: ["customer", "phone", "email", "orderCount", "totalSpent", "lastOrderAt"], deletable: true },
  reviews: { title: "রিভিউ", subtitle: "অর্ডার থেকে রিভিউ যোগ করুন, সুন্দরভাবে সম্পাদনা করুন এবং প্রকাশনা নিয়ন্ত্রণ করুন।", create: "নতুন রিভিউ যোগ করুন", columns: ["product", "order", "name", "rating", "comment", "status", "createdAt"], deletable: true },
  coupons: { title: "কুপন", subtitle: "ছাড়ের নিয়ম এবং ব্যবহারের সীমা পরিচালনা করুন।", create: "নতুন কুপন", columns: ["code", "type", "value", "isActive", "endsAt"], deletable: true },
  hero: { title: "হোম হিরো", subtitle: "হোমপেজের প্রধান ভিজ্যুয়াল ও কল-টু-অ্যাকশন সম্পাদনা করুন।", singleton: true, columns: ["title", "image", "updatedAt"], deletable: true },
  banners: { title: "ব্যানার", subtitle: "হোমপেজের প্রচারমূলক ব্যানার তৈরি ও সময়সূচি দিন।", create: "নতুন ব্যানার", columns: ["title", "isActive", "startsAt", "endsAt"], deletable: true },
  testimonials: { title: "প্রশংসাপত্র", subtitle: "যাচাইকৃত গ্রাহক মন্তব্য প্রকাশ করুন।", create: "নতুন প্রশংসাপত্র", columns: ["name", "location", "rating", "isPublished", "sortOrder"], deletable: true },
  newsletter: { title: "নিউজলেটার", subtitle: "সাবস্ক্রাইবার তালিকা ও সম্মতি অবস্থা পরিচালনা করুন।", columns: ["email", "isSubscribed", "createdAt"] },
  settings: { title: "সাইট সেটিংস", subtitle: "ব্র্যান্ড, যোগাযোগ, SEO, ডেলিভারি ও সামাজিক লিংক সম্পাদনা করুন।", singleton: true, columns: ["brandName", "supportEmail", "supportPhone"] },
};

const statusLabel = { new: "নতুন", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াধীন", shipped: "পাঠানো হয়েছে", delivered: "সম্পন্ন", cancelled: "বাতিল", pending: "পর্যালোচনাধীন", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" };
const reviewEditFields = [
  { name: "name", label: "গ্রাহকের নাম", type: "text", required: true },
  { name: "email", label: "ইমেইল", type: "email" },
  { name: "rating", label: "রেটিং বেছে নিন", type: "rating", required: true },
  { name: "comment", label: "রিভিউ", type: "textarea", required: true, wide: true },
  { name: "status", label: "প্রকাশনার অবস্থা", type: "select", options: [["pending", "পর্যালোচনাধীন"], ["approved", "অনুমোদিত"], ["rejected", "প্রত্যাখ্যাত"]] },
];

function readPath(item, path) {
  return path.split(".").reduce((value, key) => value?.[key], item);
}

function writePath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  parts.slice(0, -1).forEach((part) => { current[part] ||= {}; current = current[part]; });
  current[parts.at(-1)] = value;
}

function getFormValues(resource, item, fields) {
  const values = {};
  fields.forEach((field) => {
    let value = readPath(item, field.name);
    if (field.type === "checkbox") value = Boolean(value);
    else if (field.type === "datetime-local") value = value ? new Date(value).toISOString().slice(0, 16) : "";
    else if (field.type === "json") value = JSON.stringify(value || [], null, 2);
    else value = value ?? (field.type === "number" ? "" : "");
    values[field.name] = value;
  });
  if (resource === "orders" && !values.status) values.status = "new";
  if (resource === "reviews" && !values.status) values.status = "pending";
  if (resource === "reviews" && !values.rating) values.rating = 0;
  if (resource === "newsletter" && values.isSubscribed === undefined) values.isSubscribed = true;
  return values;
}

function createPayload(resource, values, fields) {
  const payload = {};
  fields.forEach((field) => {
    let value = values[field.name];
    if (field.type === "number" || field.type === "rating") value = value === "" ? null : Number(value);
    if (field.type === "datetime-local") value = value ? new Date(value).toISOString() : "";
    if (field.type === "json") value = JSON.parse(value || "[]");
    writePath(payload, field.name, value);
  });
  if (resource === "reviews" && payload.orderProduct) {
    const [order, product] = payload.orderProduct.split("::");
    delete payload.orderProduct;
    payload.order = order;
    payload.product = product;
  }
  return payload;
}

function displayValue(resource, key, item) {
  if (key === "customer") return item.customer?.name || item.name || "—";
  if (key === "order") return item.order?.orderNumber || item.orderNumber || "—";
  if (key === "phone") return item.customer?.phone || item.phone || "—";
  if (key === "email") return item.customer?.email || item.email || "—";
  if (key === "product") return item.product?.name || item.name || "—";
  if (key === "total" || key === "totalSpent") return formatPrice(item[key] || 0);
  if (key === "value") return resource === "coupons" ? `${new Intl.NumberFormat("bn-BD").format(item.value || 0)}${item.type === "percent" ? "%" : " ৳"}` : item[key];
  if (key === "createdAt" || key === "updatedAt" || key === "lastOrderAt" || key === "startsAt" || key === "endsAt") return item[key] ? formatDate(item[key]) : "—";
  if (key === "isActive" || key === "isPublished" || key === "isSubscribed") return item[key] ? "সক্রিয়" : "বন্ধ";
  if (key === "status") return statusLabel[item.status] || item.status || "—";
  if (key === "orderCount") return new Intl.NumberFormat("bn-BD").format(item.orderCount || 0);
  if (key === "rating") return `${new Intl.NumberFormat("bn-BD").format(item.rating || 0)} / ৫`;
  if (key === "type") return item.type === "percent" ? "শতাংশ" : "নির্দিষ্ট টাকা";
  if (key === "sortOrder") return new Intl.NumberFormat("bn-BD").format(item.sortOrder || 0);
  return readPath(item, key) || "—";
}

export default function AdminResourceClient({ resource, result, relatedOptions = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const meta = resourceMeta[resource];
  const fields = fieldSets[resource] || [];
  const [modalItem, setModalItem] = useState(null);
  const [values, setValues] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const items = result.items || [];
  const columns = useMemo(() => meta.columns, [meta.columns]);
  const pageCount = Math.max(1, Math.ceil((result.total || 0) / (result.pageSize || 8)));

  function openEditor(item = null) {
    const activeFields = resource === "reviews" && item?._id ? reviewEditFields : fields;
    setModalItem(item || {});
    setValues(getFormValues(resource, item || {}, activeFields));
    setFormMessage("");
  }

  async function saveItem(event) {
    event.preventDefault();
    setFormMessage("");
    let payload;
    const activeFields = resource === "reviews" && modalItem?._id ? reviewEditFields : fields;
    if (resource === "reviews" && !modalItem?._id && !values.orderProduct) {
      setFormMessage("সম্পন্ন অর্ডার থেকে একটি পণ্য বেছে নিন।");
      return;
    }
    if (resource === "reviews" && Number(values.rating) < 1) {
      setFormMessage("১ থেকে ৫ স্টারের মধ্যে একটি রেটিং বেছে নিন।");
      return;
    }
    try {
      payload = createPayload(resource, values, activeFields);
    } catch {
      setFormMessage("সোশ্যাল গ্যালারির JSON সঠিক নয়।");
      return;
    }
    setSaving(true);
    try {
      const singleton = resource === "hero" || resource === "settings";
      const editing = Boolean(modalItem?._id) || singleton;
      const id = resource === "hero" ? "home" : resource === "settings" ? "site" : modalItem?._id;
      const url = `/api/admin/${resource}${editing ? `/${id}` : ""}`;
      const response = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "তথ্য সংরক্ষণ করা যায়নি।");
      setModalItem(null);
      router.refresh();
    } catch (error) {
      setFormMessage(error.message || "তথ্য সংরক্ষণ করা যায়নি।");
    } finally {
      setSaving(false);
    }
  }

  async function uploadFieldImage(event, fieldName) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setFormMessage("");
    setUploadingField(fieldName);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ছবি আপলোড করা যায়নি।");
      const url = data.urls?.[0];
      if (!url) throw new Error("ছবি আপলোড করা যায়নি।");
      setValues((current) => ({ ...current, [fieldName]: url }));
    } catch (error) {
      setFormMessage(error.message || "ছবি আপলোড করা যায়নি।");
    } finally {
      setUploadingField(null);
    }
  }

  async function removeItem(item) {
    const confirmMessage = resource === "customers"
      ? "এই গ্রাহকের ব্যক্তিগত তথ্য ও ঠিকানা সব সংশ্লিষ্ট অর্ডার থেকে মুছে যাবে। অর্ডার ও বিক্রির ইতিহাস থাকবে। এগোবেন?"
      : resource === "orders"
        ? "এই অর্ডারটি মুছে যাবে। এখনো পাঠানো হয়নি—এমন অর্ডারের পণ্য স্টকে ফেরত যাবে। এগোবেন?"
        : resource === "hero"
      ? "হিরো কনটেন্ট মুছে ফেললে সাইট ডিফল্ট হিরোতে ফিরে যাবে। আপনি কি নিশ্চিত?"
      : "এই তথ্যটি মুছে ফেলতে চান?";
    if (!window.confirm(confirmMessage)) return;
    setSaving(true);
    setFormMessage("");
    try {
      const id = resource === "hero" ? "home" : resource === "settings" ? "site" : item._id;
      const response = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "তথ্য মুছে ফেলা যায়নি।");
      if (items.length === 1 && (result.page || 1) > 1) router.push(pageHref((result.page || 1) - 1));
      else router.refresh();
    } catch (error) {
      setFormMessage(error.message || "তথ্য মুছে ফেলা যায়নি।");
    } finally {
      setSaving(false);
    }
  }

  function searchItems(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  }

  function pageHref(page) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const serialized = params.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }

  return (
    <section className="admin-resource-page">
      <div className="admin-page-heading">
        <div><span className="eyebrow">কনটেন্ট ম্যানেজমেন্ট</span><h1>{meta.title}</h1><p>{meta.subtitle}</p></div>
        {meta.create ? <button className="button button--dark" type="button" onClick={() => openEditor()}><Plus aria-hidden="true" />{meta.create}</button> : meta.singleton ? <button className="button button--dark" type="button" onClick={() => openEditor(items[0] || {})}><Edit3 aria-hidden="true" />সম্পাদনা</button> : null}
      </div>
      {formMessage ? <div className="form-message form-message--error admin-inline-message" role="alert">{formMessage}</div> : null}
      <div className="admin-table-toolbar"><form className="admin-search" onSubmit={searchItems}><Search aria-hidden="true" /><input type="search" placeholder="নাম, ইমেইল বা কোড খুঁজুন" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit">খুঁজুন</button></form><span>{new Intl.NumberFormat("bn-BD").format(result.total || 0)}টি রেকর্ড</span></div>
      <div className="admin-table-wrap"><table className={`admin-table${resource === "reviews" ? " admin-table--reviews" : ""}`}><thead><tr>{columns.map((column) => <th key={column}>{({ orderNumber: "অর্ডার", order: "অর্ডার", customer: "গ্রাহক", phone: "ফোন", email: "ইমেইল", total: "মোট", status: "অবস্থা", createdAt: "তারিখ", lastOrderAt: "সর্বশেষ অর্ডার", orderCount: "অর্ডার সংখ্যা", totalSpent: "মোট ব্যয়", product: "পণ্য", comment: "রিভিউ", name: "নাম", slug: "স্লাগ", title: "শিরোনাম", image: "ছবি", brandName: "ব্র্যান্ডের নাম", isActive: "অবস্থা", updatedAt: "হালনাগাদ", code: "কোড", type: "ধরন", value: "মূল্য", endsAt: "শেষ তারিখ", startsAt: "শুরুর তারিখ", rating: "রেটিং", location: "অবস্থান", isPublished: "প্রকাশনা", sortOrder: "ক্রম", isSubscribed: "সাবস্ক্রিপশন", supportEmail: "ইমেইল", supportPhone: "ফোন" })[column] || column}</th>)}{!meta.readOnly ? <th>কাজ</th> : null}</tr></thead><tbody>
        {items.length ? items.map((item, index) => <tr className={resource === "reviews" ? "admin-review-row" : undefined} key={item._id || item.key || item.email || index}>{columns.map((column) => <td key={column}>{resource === "reviews" && column === "rating" ? <span className="admin-review-rating" aria-label={`${item.rating} এর মধ্যে ৫`}><span>{Array.from({ length: 5 }, (_, starIndex) => <Star key={starIndex} aria-hidden="true" className={starIndex < item.rating ? "is-filled" : ""} />)}</span><em>{item.rating}.0</em></span> : resource === "reviews" && column === "comment" ? <span className="admin-review-comment" title={item.comment}>{item.comment}</span> : resource === "reviews" && column === "status" ? <span className={`admin-review-status admin-review-status--${item.status}`}>{displayValue(resource, column, item)}</span> : column === "image" && canPreviewImage(readPath(item, column)) ? <span className="admin-product-cell__image"><Image src={readPath(item, column)} alt="" fill sizes="36px" /></span> : displayValue(resource, column, item)}</td>)}{!meta.readOnly ? <td><div className="admin-row-actions">{resource === "newsletter" ? <button className="admin-table-action" type="button" onClick={() => openEditor(item)} aria-label={`${item.email} সাবস্ক্রিপশন সম্পাদনা করুন`}><Edit3 aria-hidden="true" />অবস্থা</button> : resource === "orders" ? <button className="admin-table-action" type="button" onClick={() => openEditor(item)}><Edit3 aria-hidden="true" />অবস্থা</button> : <button className="admin-table-action" type="button" onClick={() => openEditor(item)} aria-label={resource === "reviews" ? "রিভিউ সম্পাদনা" : "সম্পাদনা"}><Edit3 aria-hidden="true" />{resource === "reviews" ? "সম্পাদনা" : null}</button>}{meta.deletable ? <button className="admin-table-action admin-table-action--danger" type="button" onClick={() => removeItem(item)} disabled={saving} aria-label="মুছে ফেলুন"><Trash2 aria-hidden="true" /></button> : null}</div></td> : null}</tr>) : <tr><td colSpan={columns.length + (meta.readOnly ? 0 : 1)}><div className="admin-table-empty"><span>{resource === "reviews" ? "এখনও কোনো রিভিউ নেই" : "এখানে এখনো কোনো তথ্য নেই"}</span><small>{resource === "reviews" ? "অর্ডার থেকে প্রথম রিভিউটি যোগ করে প্রকাশনা নিয়ন্ত্রণ করুন।" : "নতুন তথ্য যোগ করলে এই তালিকায় দেখা যাবে।"}</small></div></td></tr>}
        </tbody></table></div>
      <AdminPagination page={result.page || 1} pageCount={pageCount} hrefFor={pageHref} label="তালিকার পৃষ্ঠা" />
      {modalItem !== null ? <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalItem(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="resource-editor-title"><div className="admin-modal__header"><div><span className="eyebrow">{meta.title}</span><h2 id="resource-editor-title">{modalItem?._id || meta.singleton ? "তথ্য সম্পাদনা" : "নতুন তথ্য"}</h2></div><button className="icon-button" type="button" onClick={() => setModalItem(null)} aria-label="বন্ধ করুন"><X aria-hidden="true" /></button></div><form className="admin-edit-form" onSubmit={saveItem} noValidate>
        {resource === "orders" && modalItem?.statusHistory?.length ? <div className="admin-order-history"><strong>অবস্থা পরিবর্তনের ইতিহাস</strong><ol>{modalItem.statusHistory.map((entry, index) => <li key={`${entry.status}-${index}`}><span>{statusLabel[entry.status] || entry.status}</span><time>{formatDate(entry.changedAt)}</time></li>)}</ol></div> : null}
        {resource === "reviews" && modalItem?._id ? <div className="admin-review-context"><span><small>পণ্য</small><strong>{modalItem.product?.name || "পণ্য"}</strong></span><span><small>অর্ডার</small><strong>{modalItem.order?.orderNumber || "অর্ডার"}</strong></span></div> : null}
        {resource === "reviews" && !modalItem?._id ? <p className="admin-review-hint">শুধু সম্পন্ন অর্ডারের পণ্য বেছে রিভিউ যোগ করা যাবে। নতুন রিভিউ প্রথমে পর্যালোচনাধীন থাকবে।</p> : null}
        <div className="admin-form-grid">{(resource === "reviews" && modalItem?._id ? reviewEditFields : fields).map((field) => {
          const className = `admin-form-field${field.wide ? " admin-form-field--wide" : ""}${field.type === "checkbox" ? " admin-form-field--checkbox" : ""}`;
          if (field.type === "checkbox") {
            return (
              <label className={className} key={field.name}>
                <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))} />
                <span>{field.label}</span>
              </label>
            );
          }
          if (field.type === "image") {
            const value = values[field.name] ?? "";
            return (
              <div className={className} key={field.name}>
                <span>{field.label}</span>
                <div className="admin-image-field">
                  <input type="text" required={field.required} value={value} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} placeholder="/images/your-image.jpg" aria-label={field.label} />
                  <label className="admin-upload-control">
                    <Upload aria-hidden="true" />
                    <span>{uploadingField === field.name ? "আপলোড হচ্ছে…" : "ফাইল আপলোড"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingField !== null} onChange={(event) => uploadFieldImage(event, field.name)} aria-label={`${field.label} ফাইল আপলোড করুন`} />
                    </span>
                  </label>
                  {canPreviewImage(value) ? <span className="admin-image-field__preview"><Image src={value} alt={`${field.label} প্রিভিউ`} fill sizes="56px" /></span> : null}
                  {value ? <button type="button" className="admin-table-action admin-table-action--danger" onClick={() => setValues((current) => ({ ...current, [field.name]: "" }))} aria-label="ছবি মুছুন" title="ছবি মুছুন"><X aria-hidden="true" /></button> : null}
                </div>
              </div>
            );
          }
          return (
            <label className={className} key={field.name}>
              <span>{field.label}</span>
              {field.type === "textarea" || field.type === "json" ? <textarea rows={field.type === "json" ? 7 : 4} required={field.required} value={values[field.name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} /> : field.type === "select" || field.type === "orderProduct" ? <StoreSelect value={values[field.name] ?? ""} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} ariaLabel={field.label} placeholder={field.type === "orderProduct" ? "অর্ডার থেকে পণ্য বেছে নিন" : undefined} options={field.type === "orderProduct" ? relatedOptions : field.options.map(([value, label]) => ({ value, label }))} /> : field.type === "rating" ? <div className="admin-rating-picker" role="radiogroup" aria-label={field.label}>{[1, 2, 3, 4, 5].map((rating) => <button className={rating <= Number(values.rating) ? "is-selected" : ""} type="button" role="radio" aria-checked={Number(values.rating) === rating} aria-label={`${rating} স্টার`} key={rating} onClick={() => setValues((current) => ({ ...current, rating }))}><Star aria-hidden="true" /></button>)}<small>{Number(values.rating) ? `${values.rating} / ৫` : "রেটিং নির্বাচন করুন"}</small></div> : <input type={field.type === "url" ? "text" : field.type} required={field.required} value={values[field.name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />}
              {field.type === "orderProduct" && relatedOptions.length === 0 ? <small className="admin-form-hint">রিভিউ যোগ করতে আগে অন্তত একটি অর্ডার সম্পন্ন করুন।</small> : null}
            </label>
          );
        })}</div>
        {resource === "hero" || resource === "banners" || resource === "categories" || resource === "settings" ? <p className="admin-form-hint">JPG, PNG বা WebP · সর্বোচ্চ ৫ MB। ফাইল আপলোড করুন অথবা সাইটের ভেতরের পথ / Unsplash / পাবলিক Blob URL লিখুন। আপলোডকৃত ফাইল MongoDB GridFS-এ সংরক্ষিত হয়।</p> : null}
        {formMessage ? <div className="form-message form-message--error" role="alert">{formMessage}</div> : null}
        <div className="admin-modal__actions"><button type="button" className="button button--outline" onClick={() => setModalItem(null)}>বাতিল</button><button className="button button--dark" type="submit" disabled={saving}>{saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}<Check aria-hidden="true" /></button></div>
      </form></section></div> : null}
    </section>
  );
}
