"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderLookupSchema } from "@/lib/validations";
import { formatPrice } from "@/lib/format";

export default function OrderLookup({ demoMode = true }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(orderLookupSchema),
    defaultValues: { orderNumber: "", phone: "" },
  });

  async function onSubmit(values) {
    if (demoMode) return;
    setOrder(null);
    setStatus("");
    try {
      const response = await fetch("/api/store/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "অর্ডার খুঁজে পাওয়া যায়নি।");
      setOrder(result.order);
    } catch (error) {
      setStatus(error.message || "অর্ডারের তথ্য যাচাই করা যাচ্ছে না।");
    }
  }

  return (
    <div className="order-lookup-wrap">
      <form className="order-lookup-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field-label">অর্ডার নম্বর<input className="store-input" autoComplete="off" {...register("orderNumber")} aria-invalid={Boolean(errors.orderNumber)} />{errors.orderNumber ? <span className="field-error">{errors.orderNumber.message}</span> : null}</label>
        <label className="field-label">অর্ডারে ব্যবহৃত ফোন নম্বর<input className="store-input" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} aria-invalid={Boolean(errors.phone)} />{errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}</label>
        {demoMode ? <div className="demo-notice" role="status">অর্ডার ট্র্যাকিং ডেটাবেস সংযোগের পর চালু হবে। এই ডেমোতে কোনো অর্ডার সংরক্ষিত নেই।</div> : null}
        {status ? <p className="form-error" role="alert">{status}</p> : null}
        <button className="button button--dark" type="submit" disabled={demoMode || isSubmitting}>{isSubmitting ? "খোঁজা হচ্ছে…" : "অর্ডার খুঁজুন"}</button>
      </form>
      {order ? <section className="order-result" aria-live="polite"><span className="eyebrow">অর্ডার পাওয়া গেছে</span><h2>{order.orderNumber}</h2><p>অবস্থা: <strong>{order.statusLabel}</strong></p><p>সর্বমোট: <strong>{formatPrice(order.total)}</strong></p><p>তারিখ: {order.createdAtLabel}</p>{order.statusHistory?.length ? <ol className="order-timeline" aria-label="অর্ডারের অবস্থা পরিবর্তনের ইতিহাস">{order.statusHistory.map((entry, index) => <li key={`${entry.status}-${index}`}><span className="order-timeline__dot" aria-hidden="true" /><div><strong>{entry.statusLabel}</strong><time>{entry.changedAtLabel}</time></div></li>)}</ol> : null}</section> : null}
    </div>
  );
}
