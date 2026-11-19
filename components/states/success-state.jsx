"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, Gift } from "lucide-react";

export function SuccessState({ title, description, icon, primaryAction, secondaryAction, celebration = true, className, children }) {
  return (
    <section className={`success-state ${celebration ? "success-state--celebrate" : ""} ${className || ""}`} aria-labelledby="success-state-title" aria-describedby="success-state-desc">
      <div className="success-state__celebration" aria-hidden="true">
        {celebration ? (
          <>
            <Sparkles className="success-state__sparkle" />
            <Sparkles className="success-state__sparkle success-state__sparkle--two" />
            <Sparkles className="success-state__sparkle success-state__sparkle--three" />
          </>
        ) : null}
      </div>
      <div className="success-state__icon-wrap">{icon || <CheckCircle2 className="success-state__icon" aria-hidden="true" />}</div>
      <h2 id="success-state-title" className="success-state__title">{title}</h2>
      <p id="success-state-desc" className="success-state__description">{description}</p>
      {children ? <div className="success-state__receipt">{children}</div> : null}
      <div className="success-state__actions">
        {primaryAction ? <Link className="button button--gold" {...primaryAction} /> : null}
        {secondaryAction ? <Link className="button button--outline" {...secondaryAction} /> : null}
      </div>
    </section>
  );
}

export function OrderSuccessState({ orderNumber, total }) {
  return (
    <SuccessState
      title="অর্ডারটি গ্রহণ করা হয়েছে"
      description="রসপল্লী-র দল আপনার অর্ডার প্রসেস করছে। ডেলিভারির তারিখ ও ট্র্যাকিং নম্বর আপনার ইমেইলে পাঠানো হবে।"
      icon={<CheckCircle2 className="success-state__icon" aria-hidden="true" />}
      primaryAction={{ href: "/orders", children: "অর্ডার ট্র্যাক করুন" }}
      secondaryAction={{ href: "/products", children: "আরও পণ্য দেখুন" }}
      className="success-state--order"
    >
      <div className="success-state__receipt">
        <div className="receipt-line"><span>অর্ডার নম্বর</span><strong>{orderNumber}</strong></div>
        <div className="receipt-line"><span>সর্বমোট</span><strong>{total}</strong></div>
      </div>
    </SuccessState>
  );
}

export function ActionSuccessState({ verb, noun, nextStep }) {
  return (
    <SuccessState
      title={`${verb} সম্পন্ন হয়েছে`}
      description={`আপনার {noun} সফলভাবে সম্পন্ন হয়েছে।`}
      icon={<Gift className="success-state__icon" aria-hidden="true" />}
      primaryAction={{ href: nextStep.href, children: nextStep.label }}
      secondaryAction={{ href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}
