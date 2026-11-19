"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { newsletterSchema } from "@/lib/validations";

export default function NewsletterForm({ demoMode = true }) {
  const [notice, setNotice] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values) {
    if (demoMode) {
      setNotice("ডেমো মোডে ইমেইল সংরক্ষণ করা হচ্ছে না।");
      return;
    }
    setNotice("");
    try {
      const response = await fetch("/api/store/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "সাবস্ক্রিপশন সম্পন্ন হয়নি।");
      setNotice(result.message || "আপনাকে আমাদের মিষ্টির গল্পে স্বাগতম।");
    } catch (error) {
      setNotice(error.message || "আবার চেষ্টা করুন।");
    }
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="sr-only" htmlFor="newsletter-email">আপনার ইমেইল ঠিকানা</label>
      <input id="newsletter-email" type="email" autoComplete="email" placeholder="আপনার ইমেইল ঠিকানা" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "newsletter-error" : undefined} {...register("email")} disabled={demoMode} />
      <button className="newsletter-submit" type="submit" disabled={demoMode || isSubmitting} aria-label="সাবস্ক্রাইব করুন"><Send aria-hidden="true" /></button>
      {errors.email ? <span className="form-error" id="newsletter-error">{errors.email.message}</span> : null}
      <span className="form-status" role="status" aria-live="polite">{notice || (demoMode ? "ডেমো মোডে সাবস্ক্রিপশন বন্ধ আছে।" : "")}</span>
    </form>
  );
}
