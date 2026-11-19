"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import StoreSelect from "@/components/ui/store-select";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন।").max(100),
  phone: z.string().trim().regex(/^(?:\+?880|0)?1[3-9]\d{8}$/, "বাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।"),
  email: z.union([z.literal(""), z.string().trim().email("সঠিক ইমেইল ঠিকানা লিখুন।").max(254)]).optional().default(""),
  subject: z.string().trim().min(2, "বিষয় লিখুন।").max(120),
  message: z.string().trim().min(12, "বার্তা কমপক্ষে ১২ অক্ষরের হতে হবে।").max(2000),
});

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values) {
    setStatus("");
    setIsSuccess(false);
    try {
      const response = await fetch("/api/store/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "বার্তা পাঠানো যায়নি।");
      reset();
      setIsSuccess(true);
      setStatus(result.message || "আপনার বার্তা সংরক্ষিত হয়েছে। শীঘ্রই যোগাযোগ করা হবে।");
    } catch (error) {
      setStatus(error.message || "বার্তা পাঠানো যাচ্ছে না। আবার চেষ্টা করুন।");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid form-grid--two">
        <label className="field-label">নাম<input className="store-input" autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} />{errors.name ? <span className="field-error">{errors.name.message}</span> : null}</label>
        <label className="field-label">মোবাইল নম্বর<input className="store-input" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} aria-invalid={Boolean(errors.phone)} />{errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}</label>
        <label className="field-label">ইমেইল <span className="field-optional">ঐচ্ছিক</span><input className="store-input" type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />{errors.email ? <span className="field-error">{errors.email.message}</span> : null}</label>
        <label className="field-label">বিষয়<Controller name="subject" control={control} render={({ field }) => (
          <StoreSelect value={field.value} onChange={field.onChange} invalid={Boolean(errors.subject)} ariaLabel="বিষয়" placeholder="বিষয় বেছে নিন" options={[
            { value: "product", label: "পণ্য সংক্রান্ত" },
            { value: "order", label: "অর্ডার সংক্রান্ত" },
            { value: "gift", label: "উপহার" },
            { value: "other", label: "অন্যান্য" },
          ]} />
        )} />{errors.subject ? <span className="field-error">{errors.subject.message}</span> : null}</label>
      </div>
      <label className="field-label field-label--full">বার্তা<textarea className="store-textarea" rows="5" {...register("message")} aria-invalid={Boolean(errors.message)} />{errors.message ? <span className="field-error">{errors.message.message}</span> : null}</label>
      {status ? <p className={isSuccess ? "form-status" : "form-error"} role={isSuccess ? "status" : "alert"}>{status}</p> : null}
      <button className="button button--dark" type="submit" disabled={isSubmitting}>{isSubmitting ? "পাঠানো হচ্ছে…" : "বার্তা পাঠান"}</button>
    </form>
  );
}