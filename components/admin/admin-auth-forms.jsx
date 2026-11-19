"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { adminLoginSchema, adminSetupSchema } from "@/lib/validations";

export function AdminLoginForm({ demoMode, authEnabled }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(adminLoginSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values) {
    setMessage("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "লগইন করা যায়নি।");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error.message || "লগইন করা যায়নি।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {demoMode || !authEnabled ? <div className="admin-demo-notice" role="status">ডেমো মোডে লগইন বন্ধ আছে। MongoDB সংযোগ ও JWT_SECRET যোগ হলে অ্যাডমিন লগইন চালু হবে।</div> : null}
      {message ? <div className="form-message form-message--error" role="alert">{message}</div> : null}
      <label className="form-field"><span>ইমেইল ঠিকানা</span><span className="form-input-wrap"><Mail aria-hidden="true" /><input type="email" autoComplete="username" placeholder="admin@example.com" {...register("email")} aria-invalid={Boolean(errors.email)} /></span>{errors.email ? <small className="field-error">{errors.email.message}</small> : null}</label>
      <label className="form-field"><span>পাসওয়ার্ড</span><span className="form-input-wrap"><LockKeyhole aria-hidden="true" /><input type="password" autoComplete="current-password" placeholder="আপনার পাসওয়ার্ড" {...register("password")} aria-invalid={Boolean(errors.password)} /></span>{errors.password ? <small className="field-error">{errors.password.message}</small> : null}</label>
      <button className="button button--dark admin-auth-submit" type="submit" disabled={submitting || demoMode || !authEnabled}>{submitting ? "যাচাই হচ্ছে…" : "নিরাপদে লগইন করুন"}<ArrowRight aria-hidden="true" /></button>
      <Link className="admin-auth-link" href="/admin/setup">প্রথম অ্যাডমিন অ্যাকাউন্ট তৈরি করুন</Link>
    </form>
  );
}

export function AdminSetupForm({ setupEnabled }) {
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(adminSetupSchema), defaultValues: { name: "", email: "", password: "", setupToken: "" } });

  async function onSubmit(values) {
    setMessage("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "সেটআপ সম্পন্ন করা যায়নি।");
      setComplete(true);
      setMessage(result.message || "অ্যাকাউন্ট তৈরি হয়েছে।");
    } catch (error) {
      setMessage(error.message || "সেটআপ সম্পন্ন করা যায়নি।");
    } finally {
      setSubmitting(false);
    }
  }

  if (!setupEnabled) {
    return <div className="admin-demo-notice" role="status">প্রথম অ্যাডমিন তৈরির জন্য MongoDB, JWT_SECRET এবং ADMIN_SETUP_TOKEN কনফিগার করতে হবে। এই ডেমো মোডে কোনো অ্যাকাউন্ট তৈরি করা হচ্ছে না।</div>;
  }

  if (complete) return <div className="form-message form-message--success" role="status">{message} <Link href="/admin/login">লগইন পেজে যান</Link></div>;

  return (
    <form className="admin-auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {message ? <div className="form-message form-message--error" role="alert">{message}</div> : null}
      <label className="form-field"><span>নাম</span><input autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} />{errors.name ? <small className="field-error">{errors.name.message}</small> : null}</label>
      <label className="form-field"><span>ইমেইল ঠিকানা</span><input type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />{errors.email ? <small className="field-error">{errors.email.message}</small> : null}</label>
      <label className="form-field"><span>পাসওয়ার্ড</span><input type="password" autoComplete="new-password" {...register("password")} aria-invalid={Boolean(errors.password)} />{errors.password ? <small className="field-error">{errors.password.message}</small> : <small>কমপক্ষে ১২ অক্ষর ব্যবহার করুন।</small>}</label>
      <label className="form-field"><span>একবারের সেটআপ কোড</span><span className="form-input-wrap"><KeyRound aria-hidden="true" /><input type="password" autoComplete="off" {...register("setupToken")} aria-invalid={Boolean(errors.setupToken)} /></span>{errors.setupToken ? <small className="field-error">{errors.setupToken.message}</small> : null}</label>
      <button className="button button--dark admin-auth-submit" type="submit" disabled={submitting}>{submitting ? "তৈরি হচ্ছে…" : "প্রথম অ্যাডমিন তৈরি করুন"}<ShieldCheck aria-hidden="true" /></button>
    </form>
  );
}
