"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import AdminPagination from "@/components/admin/admin-pagination";

export default function AdminProductsClient({ result, search = "" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const items = result.items || [];
  const total = result.total || 0;
  const pageSize = result.pageSize || 8;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const buildPageHref = (page) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (page > 1) params.set("page", String(page));
    return `/admin/products?${params.toString()}`;
  };

  async function removeProduct(product) {
    if (!window.confirm(`“${product.name}” পণ্যটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজ ফিরিয়ে আনা যাবে না।`)) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "পণ্য মুছে ফেলা যায়নি।");
      setMessage(`“${product.name}” মুছে ফেলা হয়েছে।`);
      router.refresh();
    } catch (error) {
      setMessage(error.message || "পণ্য মুছে ফেলা যায়নি।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-resource-page">
      <div className="admin-page-heading"><div><span className="eyebrow">ক্যাটালগ ম্যানেজমেন্ট</span><h1>পণ্য</h1><p>পণ্যের তথ্য, ছবি, সাইজ ও স্টক পরিচালনা করুন।</p></div><Link className="button button--dark" href="/admin/products/create"><Plus aria-hidden="true" />নতুন পণ্য</Link></div>
      {message ? <div className="form-message admin-inline-message" role="status">{message}</div> : null}
      <div className="admin-table-toolbar"><form className="admin-search" action="/admin/products"><input type="search" name="q" defaultValue={search} placeholder="পণ্যের নাম বা স্লাগ খুঁজুন" /><button type="submit">খুঁজুন</button></form><span>{new Intl.NumberFormat("bn-BD").format(total)}টি পণ্য</span></div>
      <div className="admin-table-wrap"><table className="admin-table admin-product-table"><thead><tr><th>পণ্য</th><th>ক্যাটাগরি</th><th>মূল্য</th><th>সাইজ ও স্টক</th><th>অবস্থা</th><th>হালনাগাদ</th><th>কাজ</th></tr></thead><tbody>
        {items.length ? items.map((product) => <tr key={product._id}><td><span className="admin-product-cell"><span className="admin-product-cell__image">{product.images?.[0] ? <Image src={product.images[0]} alt="" width={44} height={56} sizes="44px" /> : null}</span><span><strong>{product.name}</strong><small>{product.slug}</small></span></span></td><td>{product.category?.name || product.categoryName || "—"}</td><td>{formatPrice(product.price)}</td><td>{(product.sizes || []).map((size) => <small className="admin-size-stock" key={size.label}>{size.label} · {new Intl.NumberFormat("bn-BD").format(size.stock)}টি</small>)}</td><td><span className={`admin-status-pill ${product.isActive ? "is-active" : "is-inactive"}`}>{product.isActive ? "প্রকাশিত" : "খসড়া"}</span></td><td>{formatDate(product.updatedAt)}</td><td><div className="admin-row-actions"><Link className="admin-icon-button" href={`/admin/products/${product._id}/edit`} aria-label={`${product.name} সম্পাদনা করুন`}><Pencil aria-hidden="true" /></Link><button className="admin-icon-button admin-icon-button--danger" type="button" onClick={() => removeProduct(product)} disabled={saving} aria-label={`${product.name} মুছে ফেলুন`}><Trash2 aria-hidden="true" /></button></div></td></tr>) : <tr><td colSpan="7"><div className="admin-table-empty"><span>ক্যাটালগে এখনো পণ্য নেই</span><p>প্রথম পণ্য যোগ করে স্টোরফ্রন্টে প্রকাশ করুন।</p></div></td></tr>}
      </tbody></table></div>
      <AdminPagination page={result.page || 1} pageCount={pageCount} hrefFor={buildPageHref} label="পণ্যের পৃষ্ঠা" />
    </section>
  );
}
