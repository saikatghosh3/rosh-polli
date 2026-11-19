"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useStorefront } from "@/components/store/storefront-provider";

const navItems = [
  { href: "/", label: "হোম" },
  { href: "/products", label: "সকল পণ্য" },
  { href: "/collections/khejur-gur", label: "কেজুর গুর" },
  { href: "/collections/khejur-rosh", label: "কেজুর রস" },
  { href: "/collections/gur-misti", label: "গুরের মিষ্টি" },
  { href: "/about", label: "আমাদের গল্প" },
  { href: "/faq", label: "প্রশ্নোত্তর" },
];

export default function StoreHeader({ brandName = "রসপল্লী" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, wishlistIds } = useStorefront();

  return (
    <header className="store-header">
      <div className="store-header__inner site-container">
        <button
          className="icon-button mobile-menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <Link className="brand-mark" href="/" aria-label={`${brandName} — হোম`} onClick={() => setMenuOpen(false)}>
          <span className="brand-mark__name">{brandName}</span>
          <span className="brand-mark__caption">কেজুর গুর ও রস</span>
        </Link>

        <nav id="primary-navigation" className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="প্রধান নেভিগেশন">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={isActive ? "is-active" : undefined} aria-current={isActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            );
          })}
          <Link className="mobile-nav-contact" href="/contact" onClick={() => setMenuOpen(false)}>যোগাযোগ</Link>
        </nav>

        <form className="header-search" action="/products" role="search">
          <label className="sr-only" htmlFor="site-search">পণ্য খুঁজুন</label>
          <input id="site-search" name="q" type="search" placeholder="গুর, রস বা মিষ্টি খুঁজুন" />
          <button type="submit" aria-label="খুঁজুন"><Search aria-hidden="true" /></button>
        </form>

        <div className="header-actions">
          <Link className="icon-button header-action-link" href="/wishlist" aria-label={`ইচ্ছেতালিকা, ${wishlistIds.length}টি পণ্য`}>
            <Heart aria-hidden="true" />
            {wishlistIds.length > 0 ? <span className="icon-count">{wishlistIds.length}</span> : null}
          </Link>
          <Link className="icon-button header-action-link" href="/orders" aria-label="অর্ডার দেখুন">
            <UserRound aria-hidden="true" />
          </Link>
          <Link className="icon-button header-action-link cart-action" href="/cart" aria-label={`শপিং ব্যাগ, ${cartCount}টি পণ্য`}>
            <ShoppingBag aria-hidden="true" />
            {cartCount > 0 ? <span className="icon-count">{cartCount}</span> : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
