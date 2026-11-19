"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export function OfflineBanner({ onRetry }) {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const handleRetry = onRetry || (() => window.location.reload());

  useEffect(() => {
    const syncOnline = () => setOffline(!navigator.onLine);
    const onOnline = () => { setOffline(false); setDismissed(false); };
    const onOffline = () => setOffline(true);
    syncOnline();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <div className="offline-banner__wrap site-container">
        <WifiOff className="offline-banner__icon" aria-hidden="true" />
        <div className="offline-banner__copy">
          <strong>ইন্টারনেট সংযোগ নেই</strong>
          <p>রসপল্লী-র পণ্য ও অর্ডার লোড করার জন্য ইন্টারনেটের প্রয়োজন। সংযোগ ফিরে এলে পেজটি রিফ্রেশ করুন।</p>
        </div>
        <button type="button" className="button button--gold offline-banner__retry" onClick={handleRetry}><RefreshCw aria-hidden="true" />পুনরায় চেষ্টা করুন</button>
        <button type="button" className="offline-banner__close" aria-label="বার্তা বন্ধ করুন" onClick={() => setDismissed(true)}>×</button>
      </div>
    </div>
  );
}

export function OfflinePage({ onRetry }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const syncOnline = () => setOffline(!navigator.onLine);
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    syncOnline();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof navigator !== "undefined" && navigator.onLine) window.location.reload();
    else if (onRetry) onRetry();
  };

  return (
    <section className="site-container page-shell offline-page">
      <div className="offline-icon-wrap"><WifiOff size={56} strokeWidth={2} className="offline-icon" /><span className="offline-icon__ring" aria-hidden="true" /></div>
      <span className="eyebrow">সংযোগ ছাইনাও</span>
      <h1>ইন্টারনেট সংযোগের প্রয়োজন</h1>
      <p>রসপল্লী-র পণ্য সংগ্রহ, কার্ট ও অর্ডার লোড করতে অক্টিভ ইন্টারনেট সংযোগ প্রয়োজন। আপনার ডিভাইসের ওয়াই-ফাই বা মোবাইল ডাটা চেক করুন এবং পেজটি reload করুন।</p>
      <div className="offline-actions">
        <button type="button" className="button button--gold" onClick={handleRetry}><RefreshCw aria-hidden="true" />সংযোগ যাচাই করে রিলোড করুন</button>
        <Link className="button button--outline" href="/"><Home aria-hidden="true" />হোমে ফিরে যান</Link>
      </div>
      <p className="offline-hint">সংযোগ ফিরে এলে পেজটি স্বয়ংক্রিয়ভাবে রিলোড হবে।</p>
    </section>
  );
}
