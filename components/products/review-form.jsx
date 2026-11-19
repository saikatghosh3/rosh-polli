"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import StoreSelect from "@/components/ui/store-select";
import { reviewFormSchema } from "@/lib/validations";

export default function ReviewForm({ productId, demoMode }) {
  const [status, setStatus] = useState("");
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { orderNumber: "", phone: "", rating: "5", comment: "" },
  });

  async function onSubmit(values) {
    if (demoMode) return;
    setStatus("");
    try {
      const response = await fetch("/api/store/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, productId, rating: Number(values.rating) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "রিভিউ পাঠানো যায়নি।");
      reset();
      setStatus("আপনার রিভিউটি যাচাইয়ের জন্য পাঠানো হয়েছে।");
    } catch (error) {
      setStatus(error.message || "এই মুহূর্তে রিভিউ পাঠানো যাচ্ছে না।");
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid form-grid--two">
        <label className="field-label">অর্ডার নম্বর<input className="store-input" autoComplete="off" {...register("orderNumber")} aria-invalid={Boolean(errors.orderNumber)} />{errors.orderNumber ? <span className="field-error">{errors.orderNumber.message}</span> : null}</label>
        <label className="field-label">অর্ডারের ফোন নম্বর<input className="store-input" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} aria-invalid={Boolean(errors.phone)} />{errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}</label>
      </div>
      <label className="field-label">আপনার রেটিং<Controller name="rating" control={control} render={({ field }) => (
        <StoreSelect value={field.value} onChange={field.onChange} invalid={Boolean(errors.rating)} ariaLabel="আপনার রেটিং" options={[
          { value: "5", label: "৫ — অসাধারণ" },
          { value: "4", label: "৪ — খুব ভালো" },
          { value: "3", label: "৩ — ভালো" },
          { value: "2", label: "২ — মোটামুটি" },
          { value: "1", label: "১ — উন্নতির সুযোগ আছে" },
        ]} />
      )} /></label>
      <label className="field-label">আপনার অভিজ্ঞতা<textarea className="store-textarea" rows="4" {...register("comment")} aria-invalid={Boolean(errors.comment)} />{errors.comment ? <span className="field-error">{errors.comment.message}</span> : null}</label>
      <p className="form-status" role="status">{demoMode ? "ডেমো মোডে রিভিউ সংরক্ষণ করা হচ্ছে না। ডেটাবেস সংযোগের পর চালু হবে।" : status}</p>
      <p className="form-hint">শুধু ডেলিভারি সম্পন্ন হওয়া অর্ডারের ক্রেতারা রিভিউ দিতে পারবেন।</p>
      <button className="button button--dark" type="submit" disabled={demoMode || isSubmitting}>{isSubmitting ? "পাঠানো হচ্ছে…" : "রিভিউ পাঠান"}</button>
    </form>
  );
}
