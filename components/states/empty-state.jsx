"use client";

import Link from "next/link";
import { PackageSearch, Search, Heart, ShoppingBag, ArrowRight } from "lucide-react";

const icons = {
  products: <PackageSearch aria-hidden="true" size={40} strokeWidth={1.6} />,
  wishlist: <Heart aria-hidden="true" size={40} strokeWidth={1.6} />,
  cart: <ShoppingBag aria-hidden="true" size={40} strokeWidth={1.6} />,
  search: <Search aria-hidden="true" size={40} strokeWidth={1.6} />,
  default: <PackageSearch aria-hidden="true" size={40} strokeWidth={1.6} />,
};

export function EmptyState({ kind = "default", title, description, primaryAction, secondaryAction, className, icon }) {
  return (
    <section className={`empty-state ${className || ""}`} aria-labelledby="empty-state-title">
      <div className="empty-state__icon-wrap">{icon || icons[kind] || icons.default}</div>
      <h2 id="empty-state-title" className="empty-state__title">{title}</h2>
      {description ? <p className="empty-state__description">{description}</p> : null}
      <div className="empty-state__actions">
        {primaryAction ? <Link className="button button--dark" {...primaryAction} /> : null}
        {secondaryAction ? <Link className="button button--outline" {...secondaryAction} /> : null}
      </div>
    </section>
  );
}

export function EmptyProducts({ query, category }) {
  const searchUrl = category ? `/products?category=${category}` : "/products";
  const clearUrl = query ? "/products" : null;

  return (
    <EmptyState
      kind="products"
      title={query ? `“${query}” খুঁজে পাওয়া যায়নি` : "এখনো কোনো পণ্য নেই"}
      description={
        query
          ? `আমাদের সংগ্রহে “${query}” কথায় মেলে না। অন্য কোনো শব্দ, সংগ্রহ বা দামের ছাঁটি দিয়ে আবার খুঁজে দেখুন।`
          : "রসপল্লী-র নির্বাচিত পণ্যের সংগ্রহ শীঘ্রই এখানে উপলব্ধ হবে। ততক্ষণে শেষ হওয়া সংগ্রহগুলো দেখে নিন।"
      }
      primaryAction={{ href: searchUrl, children: "পণ্য আবিষ্কার করুন" }}
      secondaryAction={clearUrl ? { href: clearUrl, children: "সার্চ মুছুন" } : null}
    />
  );
}

export function EmptyWishlist() {
  return (
    <EmptyState
      kind="wishlist"
      title="এখনো কোনো পণ্য সংরক্ষণ করা হয়নি"
      description="পছন্দের পণ্যের হৃদয় চিহ্নে চাপ দিলে সেটি এখানে থাকবে। ডেমো মোডে এই তালিকা পেজ সেশনে থাকে।"
      primaryAction={{ href: "/products", children: "পণ্য দেখুন" }}
      secondaryAction={{ href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}

export function EmptyCart() {
  return (
    <EmptyState
      kind="cart"
      title="আপনার কার্ট এখনো খালি"
      description="আপনার গল্পের সঙ্গে মানানসই পণ্যটি খুঁজে নিন।"
      primaryAction={{ href: "/products", children: "পণ্য আবিষ্কার করুন" }}
      secondaryAction={{ href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}

export function EmptySearch({ query, suggestions }) {
  return (
    <EmptyState
      kind="search"
      title={`“${query}” এর কোনো ফলাফল পাওয়া যায়নি`}
      description="অন্য কোনো শব্দ দিয়ে খুঁজে দিন অথবা নিচের সংগ্রহগুলো দেখুন।"
      primaryAction={{ href: "/products", children: "সব পণ্য দেখুন" }}
      secondaryAction={{ href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}
