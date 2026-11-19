"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  PanelsTopLeft,
  Quote,
  Settings2,
  Shapes,
  TicketPercent,
  UsersRound,
  X,
} from "lucide-react";

const navigation = [
  { href: "/admin/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/products", label: "পণ্য", icon: Boxes },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: Shapes },
  { href: "/admin/orders", label: "অর্ডার", icon: ClipboardList },
  { href: "/admin/customers", label: "গ্রাহক", icon: UsersRound },
  { href: "/admin/reviews", label: "রিভিউ", icon: MessageSquareText },
  { href: "/admin/coupons", label: "কুপন", icon: TicketPercent },
  { href: "/admin/hero", label: "হোম হিরো", icon: PanelsTopLeft },
  { href: "/admin/banners", label: "ব্যানার", icon: BarChart3 },
  { href: "/admin/testimonials", label: "প্রশংসাপত্র", icon: Quote },
  { href: "/admin/newsletter", label: "নিউজলেটার", icon: Mail },
  { href: "/admin/settings", label: "সাইট সেটিংস", icon: Settings2 },
];

export default function AdminShell({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function signOut() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${mobileOpen ? " admin-sidebar--open" : ""}`} aria-label="অ্যাডমিন নেভিগেশন">
        <Link className="admin-brand" href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
          <span className="admin-brand__mark">র</span>
          <span><strong>রসপল্লী</strong><small>অ্যাডমিন স্টুডিও</small></span>
        </Link>
        <nav className="admin-nav">
          <span className="admin-nav__label">ব্যবস্থাপনা</span>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={`admin-nav__link${active ? " admin-nav__link--active" : ""}`}
                href={item.href}
                key={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {active ? <ChevronRight className="admin-nav__chevron" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar__bottom">
          <Link href="/" className="admin-sidebar__store-link">স্টোরফ্রন্ট দেখুন</Link>
          <div className="admin-user-chip"><span className="admin-user-chip__avatar">{user.name?.slice(0, 1) || "অ"}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div>
        </div>
      </aside>
      {mobileOpen ? <button className="admin-mobile-scrim" type="button" aria-label="নেভিগেশন বন্ধ করুন" onClick={() => setMobileOpen(false)} /> : null}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen} aria-label={mobileOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}>
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div className="admin-topbar__crumb"><span>রসপল্লী</span><span aria-hidden="true">/</span><strong>{navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label || "অ্যাডমিন"}</strong></div>
          <button className="admin-logout-button" type="button" onClick={signOut} disabled={loggingOut}>
            <LogOut aria-hidden="true" />{loggingOut ? "লগআউট হচ্ছে…" : "লগআউট"}
          </button>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
