import { z } from "zod";

const safeImageUrl = z.string().trim().min(1).max(2048).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "images.unsplash.com" || url.hostname === "public.blob.vercel-storage.com" || url.hostname.endsWith(".public.blob.vercel-storage.com"));
  } catch {
    return false;
  }
}, "ছবির URL HTTPS Unsplash বা পাবলিক Blob ঠিকানা হতে হবে, অথবা সাইটের ভেতরের পথ হতে হবে।");

const safeHref = z.string().trim().max(300).refine(
  (value) => (value.startsWith("/") && !value.startsWith("//")) || value.startsWith("https://"),
  "লিংকটি সাইটের ভেতরের পথ অথবা HTTPS ঠিকানা হতে হবে।",
);

const optionalNumber = (maximum = 100000000) => z.preprocess(
  (value) => value === "" || value === null || value === undefined ? null : Number(value),
  z.number().min(0).max(maximum).nullable(),
);

const productSizeSchema = z.object({
  label: z.string().trim().min(1, "সাইজ লিখুন।").max(40),
  price: z.coerce.number().int().positive().max(10000000),
  stock: z.coerce.number().int().min(0).max(100000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("সঠিক ইমেইল ঠিকানা লিখুন।").max(254),
});

export const reviewFormSchema = z.object({
  orderNumber: z.string().trim().min(5, "অর্ডার নম্বর লিখুন।").max(60),
  phone: z.string().trim().regex(/^(?:\+?880|0)?1[3-9]\d{8}$/, "বাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।"),
  rating: z.string().regex(/^[1-5]$/, "১ থেকে ৫-এর মধ্যে রেটিং নির্বাচন করুন।"),
  comment: z.string().trim().min(12, "রিভিউ কমপক্ষে ১২ অক্ষরের হতে হবে।").max(1200),
});

export const reviewSchema = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i, "পণ্যটি পাওয়া যায়নি।"),
  orderNumber: z.string().trim().min(5).max(60).transform((value) => value.toUpperCase()),
  phone: z.string().trim().regex(/^(?:\+?880|0)?1[3-9]\d{8}$/, "বাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(12).max(1200),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "নাম লিখুন।").max(100),
  phone: z.string().trim().regex(/^(?:\+?880|0)?1[3-9]\d{8}$/, "বাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।"),
  email: z.union([z.literal(""), z.string().trim().email("সঠিক ইমেইল ঠিকানা লিখুন।").max(254)]).optional().default(""),
  district: z.string().trim().min(2, "জেলা বা শহরের নাম লিখুন।").max(80),
  deliveryZone: z.enum(["inside", "outside"]).optional().default("inside"),
  address: z.string().trim().min(8, "সম্পূর্ণ ঠিকানা লিখুন।").max(500),
  notes: z.string().trim().max(500).optional().default(""),
  couponCode: z.string().trim().max(40).optional().default(""),
});

export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().min(5).max(60),
  phone: z.string().trim().regex(/^(?:\+?880|0)?1[3-9]\d{8}$/, "বাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।"),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("সঠিক ইমেইল লিখুন।").max(254),
  password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।").max(128),
});

export const adminSetupSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন।").max(100),
  email: z.string().trim().email("সঠিক ইমেইল লিখুন।").max(254),
  password: z.string().min(12, "পাসওয়ার্ড কমপক্ষে ১২ অক্ষরের হতে হবে।").max(128),
  setupToken: z.string().min(1).max(300),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "স্লাগ ইংরেজি ছোট অক্ষর ও হাইফেন দিয়ে লিখুন।"),
  tagline: z.string().trim().max(180).optional().default(""),
  description: z.string().trim().min(20).max(6000),
  price: z.coerce.number().int().positive().max(10000000),
  compareAtPrice: optionalNumber(10000000),
  gender: z.enum(["কেজুর গুর", "কেজুর রস", "গুরের মিষ্টি"]),
  categorySlug: z.string().trim().min(1).max(100),
  images: z.array(safeImageUrl).min(1).max(8),
  sizes: z.array(productSizeSchema).min(1).max(8),
  notes: z.object({
    top: z.array(z.string().trim().max(60)).max(12).default([]),
    middle: z.array(z.string().trim().max(60)).max(12).default([]),
    base: z.array(z.string().trim().max(60)).max(12).default([]),
  }).default({ top: [], middle: [], base: [] }),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().trim().max(180).optional().default(""),
  seoDescription: z.string().trim().max(320).optional().default(""),
}).superRefine((product, context) => {
  if (!product.sizes.some((size) => size.price === product.price)) {
    context.addIssue({ code: "custom", path: ["price"], message: "মূল্যকে অন্তত একটি সাইজের দামের সঙ্গে মেলান।" });
  }
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  eyebrow: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(600).optional().default(""),
  image: safeImageUrl,
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/).transform((value) => value.toUpperCase()),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive().max(10000000),
  minOrderAmount: z.coerce.number().min(0).max(10000000).default(0),
  maxDiscount: optionalNumber(10000000),
  startsAt: z.union([z.literal(""), z.string().datetime()]).optional().default(""),
  endsAt: z.union([z.literal(""), z.string().datetime()]).optional().default(""),
  usageLimit: z.preprocess((value) => value === "" || value === null || value === undefined ? null : Number(value), z.number().int().positive().nullable()),
  isActive: z.boolean().default(true),
});

export const bannerSchema = z.object({
  title: z.string().trim().min(2).max(180),
  subtitle: z.string().trim().max(600).optional().default(""),
  image: safeImageUrl,
  ctaLabel: z.string().trim().max(80).optional().default(""),
  ctaHref: safeHref,
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  startsAt: z.union([z.literal(""), z.string().datetime()]).optional().default(""),
  endsAt: z.union([z.literal(""), z.string().datetime()]).optional().default(""),
});

export const heroSchema = z.object({
  eyebrow: z.string().trim().max(120).optional().default(""),
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(1000).optional().default(""),
  image: safeImageUrl,
  primaryLabel: z.string().trim().min(1).max(80),
  primaryHref: safeHref,
  secondaryLabel: z.string().trim().max(80).optional().default(""),
  secondaryHref: z.union([z.literal(""), safeHref]).optional().default(""),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(100),
  location: z.string().trim().max(100).optional().default(""),
  quote: z.string().trim().min(12).max(1200),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});

export const siteSettingsSchema = z.object({
  brandName: z.string().trim().min(1).max(80),
  brandDescriptor: z.string().trim().max(120).optional().default(""),
  tagline: z.string().trim().max(180).optional().default(""),
  logoUrl: z.union([z.literal(""), safeImageUrl]).optional().default(""),
  supportPhone: z.string().trim().max(40).optional().default(""),
  supportEmail: z.union([z.literal(""), z.string().trim().email().max(254)]).optional().default(""),
  address: z.string().trim().max(240).optional().default(""),
  deliveryCharge: z.coerce.number().min(0).max(100000).optional(),
  deliveryChargeDhaka: z.coerce.number().min(0).max(100000).default(0),
  deliveryChargeOutsideDhaka: z.coerce.number().min(0).max(100000).default(0),
  freeDeliveryThreshold: z.coerce.number().min(0).max(10000000).default(0),
  socialLinks: z.object({
    instagram: z.union([z.literal(""), z.string().url().startsWith("https://")]).optional().default(""),
    facebook: z.union([z.literal(""), z.string().url().startsWith("https://")]).optional().default(""),
    twitter: z.union([z.literal(""), z.string().url().startsWith("https://")]).optional().default(""),
  }).default({ instagram: "", facebook: "", twitter: "" }),
  seoTitle: z.string().trim().max(180).optional().default(""),
  seoDescription: z.string().trim().max(320).optional().default(""),
  announcementText: z.string().trim().max(240).optional().default(""),
  announcementActive: z.boolean().default(false),
  brandStory: z.object({
    eyebrow: z.string().trim().max(120).optional().default(""),
    title: z.string().trim().max(200).optional().default(""),
    body: z.string().trim().max(1800).optional().default(""),
    image: z.union([z.literal(""), safeImageUrl]).optional().default(""),
    linkLabel: z.string().trim().max(80).optional().default(""),
    linkHref: safeHref.optional().default("/about"),
  }).optional().default({}),
  socialGallery: z.array(z.object({ image: safeImageUrl, alt: z.string().trim().max(180).optional().default(""), href: z.union([z.literal(""), safeHref]).optional().default("") })).max(12).optional().default([]),
});

export const orderStatusSchema = z.object({
  status: z.enum(["new", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});

export const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const adminReviewCreateSchema = z.object({
  product: z.string().regex(/^[a-f\d]{24}$/i),
  order: z.string().regex(/^[a-f\d]{24}$/i),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(12).max(1200),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export const adminReviewUpdateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]).default(""),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(12).max(1200),
  status: z.enum(["pending", "approved", "rejected"]),
});

export const newsletterStatusSchema = z.object({
  isSubscribed: z.boolean(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন।").max(100),
  phone: z.string().trim().regex(/^(?:\+?880|0)?1[3-9]\d{8}$/, "বাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।"),
  email: z.union([z.literal(""), z.string().trim().email("সঠিক ইমেইল ঠিকানা লিখুন।").max(254)]).optional().default(""),
  subject: z.string().trim().min(2, "বিষয় লিখুন।").max(120),
  message: z.string().trim().min(12, "বার্তা কমপক্ষে ১২ অক্ষরের হতে হবে।").max(2000),
});
