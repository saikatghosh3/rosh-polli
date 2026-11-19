"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw, Home, ArrowLeft, Mail } from "lucide-react";

export function ErrorState({ title, description, fixes, onRetry, retryLabel = "পুনরায় চেষ্টা করুন", primaryAction, secondaryAction, className = "" }) {
  return (
    <section className={`error-state ${className || ""}`} aria-labelledby="error-state-title" aria-describedby="error-state-desc">
      <AlertCircle className="error-state__icon" aria-hidden="true" />
      <h2 id="error-state-title" className="error-state__title">{title}</h2>
      <p id="error-state-desc" className="error-state__description">{description}</p>
      {fixes && fixes.length > 0 ? (
        <div className="error-state__fixes">
          <span className="error-state__fixes-label">কীভাবে ঠিক করবেন</span>
          <ul className="error-state__fixes-list">
            {fixes.map((fix, index) => <li key={index}>{fix}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="error-state__actions">
        {onRetry ? <button type="button" className="button button--gold error-state__retry" onClick={onRetry}><RefreshCw aria-hidden="true" />{retryLabel || "পুনরায় চেষ্টা করুন"}</button> : null}
        {primaryAction ? <Link className="button button--dark" {...primaryAction} /> : null}
        {secondaryAction ? <Link className="button button--outline" {...secondaryAction} /> : null}
      </div>
    </section>
  );
}

export function LoadError({ error, onRetry, fallbackTitle }) {
  const message = error?.message || "কিছু একটা সমস্যা হয়েছে।";
  return (
    <ErrorState
      title={fallbackTitle || "পণ্য লোড করা যায়নি"}
      description={message}
      fixes={[
        "ইন্টারনেট সংযোগ পরীক্ষা করুন।",
        "কয়েক সেকেন্ড অপেক্ষা করুন এবং পেজটি রিফ্রেশ করুন।",
        "সಮস্যা থাকলে আমাদের সাথে যোগাযোগ করুন।"
      ]}
      onRetry={onRetry}
      primaryAction={{ href: "/support", children: "সহায়তার জন্য লিখুন" }}
      secondaryAction={{ href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}

export function NotFoundState({ entity = "পণ্য", onRetry }) {
  return (
    <ErrorState
      title={`${entity} পাওয়া যায়নি`}
      description="আপনি যা খুঁজছেন সেটি এখন উপলব্ধ নেই বা লিঙ্কটি কাজ করছে না।"
      fixes={[
        "URL ঠিকভাবে লিখেছেন কিনা নিশ্চিত করুন।",
        "নিচ থেকে সংগ্রহ বা হোম পেজে ফিরে আবার খুঁজুন।"
      ]}
      onRetry={onRetry}
      primaryAction={{ href: "/products", children: "সব পণ্য দেখুন" }}
      secondaryAction={{ href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}

export function PermissionDeniedState({ reason, onRetry, primaryAction, secondaryAction }) {
  return (
    <ErrorState
      title="অনুমতি নেই"
      description={
        reason || "আপনার এই পেজে আসার অনুমতি নেই। এটি লগইন প্রয়োজনীয় পেজ হতে পারে বা আপনার অ্যাকাউন্টে এই কাজ করার অনুমতি নাও থাকতে পারে।"
      }
      fixes={[
        "লগইন করুন এবং আবার চেষ্টা করুন।",
        "আপনার অ্যাকাউন্টে এই টাস্কের অনুমতি আছে কিনা নিশ্চিত করুন।",
        "অনুমতি পেয়নি হলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।"
      ]}
      onRetry={onRetry}
      retryLabel="লগইন পেজে যান"
      primaryAction={primaryAction || { href: "/admin/login", children: "লগইন করুন" }}
      secondaryAction={secondaryAction || { href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}
