"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/lib/validations";
import { formatPrice } from "@/lib/format";
import { useStorefront } from "@/components/store/storefront-provider";

export default function CheckoutForm({ demoMode = true, deliveryDhaka = 0, deliveryOutside = 0, freeDeliveryThreshold = 0 }) {
  const router = useRouter();
  const { cartItems, cartSubtotal } = useStorefront();
  const [status, setStatus] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: "", phone: "", email: "", district: "", address: "", notes: "", couponCode: "", deliveryZone: "inside" },
  });
  const zone = watch("deliveryZone");
  const freeShipping = freeDeliveryThreshold > 0 && cartSubtotal >= freeDeliveryThreshold;
  const zoneFee = freeShipping ? 0 : (zone === "outside" ? deliveryOutside : deliveryDhaka);

  function autoZone(event) {
    if (/ঢাকা|dhaka/i.test(event.target.value || "")) setValue("deliveryZone", "inside", { shouldValidate: true });
  }

  async function onSubmit(values) {
    if (demoMode) return;
    setStatus("");
    try {
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "অর্ডার সম্পন্ন করা যায়নি।");
      router.push(`/orders/success?order=${encodeURIComponent(result.order.orderNumber)}`);
    } catch (error) {
      setStatus(error.message || "অর্ডার পাঠানো যাচ্ছে না। আবার চেষ্টা করুন।");
    }
  }

  if (!cartItems.length) {
    return <div className="quiet-empty">চেকআউট শুরু করার আগে কার্টে অন্তত একটি পণ্য যোগ করুন।</div>;
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-section-title"><span>০১</span><div><h2>আপনার তথ্য</h2><p>ডেলিভারি নিশ্চিত করতে যোগাযোগের তথ্য দিন।</p></div></div>
      <div className="form-grid form-grid--two">
        <label className="field-label">পূর্ণ নাম<input className="store-input" autoComplete="name" {...register("fullName")} aria-invalid={Boolean(errors.fullName)} />{errors.fullName ? <span className="field-error">{errors.fullName.message}</span> : null}</label>
        <label className="field-label">মোবাইল নম্বর<input className="store-input" type="tel" autoComplete="tel" inputMode="tel" {...register("phone")} aria-invalid={Boolean(errors.phone)} />{errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}</label>
        <label className="field-label">ইমেইল <span className="field-optional">ঐচ্ছিক</span><input className="store-input" type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />{errors.email ? <span className="field-error">{errors.email.message}</span> : null}</label>
        <label className="field-label">জেলা<input className="store-input" autoComplete="address-level1" {...register("district", { onChange: autoZone })} aria-invalid={Boolean(errors.district)} />{errors.district ? <span className="field-error">{errors.district.message}</span> : null}</label>
        <label className="field-label field-label--full">সম্পূর্ণ ঠিকানা<textarea className="store-textarea" rows="3" autoComplete="street-address" {...register("address")} aria-invalid={Boolean(errors.address)} />{errors.address ? <span className="field-error">{errors.address.message}</span> : null}</label>
        <fieldset className="delivery-zone field-label--full">
          <legend>ডেলিভারি এলাকা <span className="field-optional">চার্জ নির্বাচন করুন</span></legend>
          <div className="delivery-zone__options">
            <label className={`delivery-zone__option${zone === "inside" ? " is-active" : ""}`}>
              <input type="radio" value="inside" {...register("deliveryZone")} />
              <span className="delivery-zone__dot" aria-hidden="true" />
              <span className="delivery-zone__text"><strong>ঢাকার ভিতরে</strong><em>{freeShipping ? "বিনামূল্যে" : formatPrice(deliveryDhaka)}</em></span>
            </label>
            <label className={`delivery-zone__option${zone === "outside" ? " is-active" : ""}`}>
              <input type="radio" value="outside" {...register("deliveryZone")} />
              <span className="delivery-zone__dot" aria-hidden="true" />
              <span className="delivery-zone__text"><strong>ঢাকার বাইরে</strong><em>{freeShipping ? "বিনামূল্যে" : formatPrice(deliveryOutside)}</em></span>
            </label>
          </div>
          <p className="delivery-zone__note">{freeShipping ? "অর্ডার মূল্য পূর্ণ হওয়ায় ডেলিভারি চার্জ প্রযোজ্য নয়।" : `নির্বাচিত এলাকার ডেলিভারি চার্জ: ${formatPrice(zoneFee)}`}</p>
        </fieldset>
        <label className="field-label field-label--full">অর্ডার সংক্রান্ত নোট <span className="field-optional">ঐচ্ছিক</span><textarea className="store-textarea" rows="2" {...register("notes")} /></label>
      </div>
      <div className="form-section-title form-section-title--spaced"><span>০২</span><div><h2>পেমেন্ট</h2><p>ডেলিভারির সময় পেমেন্ট।</p></div></div>
      <div className="payment-option"><span className="payment-option__radio" aria-hidden="true" /><div><strong>ক্যাশ অন ডেলিভারি</strong><p>পণ্য হাতে পেয়ে পরিশোধ করুন।</p></div></div>
      <label className="field-label checkout-coupon">কুপন কোড <span className="field-optional">ঐচ্ছিক</span><input className="store-input" {...register("couponCode")} /></label>
      {demoMode ? <div className="demo-notice" role="status">এটি JSON ডেমো ডেটা। অর্ডার বা কুপন যাচাই এখনই সংরক্ষণ হচ্ছে না; ডেটাবেস সংযোগের পর চেকআউট সক্রিয় হবে।</div> : null}
      {status ? <p className="form-error" role="alert">{status}</p> : null}
      <button className="button button--dark checkout-submit" type="submit" disabled={demoMode || isSubmitting}>{isSubmitting ? "অর্ডার পাঠানো হচ্ছে…" : "অর্ডার নিশ্চিত করুন"}</button>
      <p className="checkout-privacy">আপনার তথ্য শুধুমাত্র অর্ডার প্রক্রিয়ার জন্য ব্যবহৃত হবে।</p>
    </form>
  );
}
