import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Review from "@/models/Review";
import Coupon from "@/models/Coupon";
import Banner from "@/models/Banner";
import HeroSection from "@/models/HeroSection";
import Testimonial from "@/models/Testimonial";
import Newsletter from "@/models/Newsletter";
import SiteSettings from "@/models/SiteSettings";
import { connectDatabase } from "@/lib/db";
import { z } from "zod";
import {
  productSchema,
  categorySchema,
  couponSchema,
  bannerSchema,
  heroSchema,
  testimonialSchema,
  siteSettingsSchema,
  orderStatusSchema,
  adminReviewCreateSchema,
  adminReviewUpdateSchema,
  newsletterStatusSchema,
} from "@/lib/validations";

export const createSchemas = {
  products: productSchema,
  categories: categorySchema,
  coupons: couponSchema,
  banners: bannerSchema,
  hero: heroSchema,
  testimonials: testimonialSchema,
  settings: siteSettingsSchema,
  reviews: adminReviewCreateSchema,
};

function dateValue(value) {
  return value ? new Date(value) : null;
}

async function productPayload(data) {
  const category = await Category.findOne({ slug: data.categorySlug, isActive: true }).select("_id name slug").lean();
  if (!category) throw Object.assign(new Error("নির্বাচিত সংগ্রহটি পাওয়া যায়নি।"), { code: "CATEGORY_NOT_FOUND" });
  return { ...data, category: category._id, categorySlug: category.slug, categoryName: category.name };
}

function couponPayload(data) {
  return { ...data, startsAt: dateValue(data.startsAt), endsAt: dateValue(data.endsAt) };
}

function bannerPayload(data) {
  return { ...data, startsAt: dateValue(data.startsAt), endsAt: dateValue(data.endsAt) };
}

function toPlain(value) {
  return value?.toObject ? value.toObject() : value;
}

async function refreshProductRating(productId) {
  const [summary] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), status: "approved" } },
    { $group: { _id: "$product", ratingAverage: { $avg: "$rating" }, ratingCount: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: productId }, { $set: { ratingAverage: summary?.ratingAverage || 0, ratingCount: summary?.ratingCount || 0 } });
}

export async function createAdminResource(resource, rawData) {
  await connectDatabase();
  const schema = createSchemas[resource];
  if (!schema) throw Object.assign(new Error("এই বিভাগে নতুন তথ্য যোগ করা যায় না।"), { code: "RESOURCE_READ_ONLY" });
  const parsed = schema.safeParse(rawData);
  if (!parsed.success) throw Object.assign(new Error("তথ্য যাচাই করা যায়নি।"), { code: "VALIDATION", issues: parsed.error.issues });
  const data = parsed.data;

  if (resource === "products") return toPlain(await Product.create(await productPayload(data)));
  if (resource === "categories") return toPlain(await Category.create(data));
  if (resource === "reviews") {
    const [order, product] = await Promise.all([
      Order.findById(data.order).select("customer items.product items.name status").lean(),
      Product.findById(data.product).select("_id").lean(),
    ]);
    if (!order || order.status !== "delivered" || !product || !order.items.some((item) => String(item.product) === data.product)) {
      throw Object.assign(new Error("সম্পন্ন অর্ডার থেকে পণ্য নির্বাচন করুন।"), { code: "REVIEW_ORDER_PRODUCT_MISMATCH" });
    }
    const review = await Review.create({
      order: order._id,
      product: product._id,
      name: order.customer.name,
      email: order.customer.email || "",
      rating: data.rating,
      comment: data.comment,
      status: data.status,
    });
    await refreshProductRating(product._id);
    return toPlain(review);
  }
  if (resource === "coupons") return toPlain(await Coupon.create(couponPayload(data)));
  if (resource === "banners") return toPlain(await Banner.create(bannerPayload(data)));
  if (resource === "testimonials") return toPlain(await Testimonial.create(data));
  if (resource === "hero") return toPlain(await HeroSection.findOneAndUpdate({ key: "home" }, { ...data, key: "home" }, { upsert: true, new: true, runValidators: true }));
  if (resource === "settings") return toPlain(await SiteSettings.findOneAndUpdate({ key: "site" }, { ...data, key: "site" }, { upsert: true, new: true, runValidators: true }));
  throw Object.assign(new Error("এই বিভাগে নতুন তথ্য যোগ করা যায় না।"), { code: "RESOURCE_READ_ONLY" });
}

export async function updateAdminResource(resource, id, rawData, adminId = null) {
  await connectDatabase();
  if (resource === "customers") {
    const parsed = z.object({ customer: z.object({
      name: z.string().trim().min(1).max(100),
      phone: z.string().trim().min(5).max(24),
      email: z.string().trim().max(254).refine((value) => !value || z.string().email().safeParse(value).success),
    }) }).safeParse(rawData);
    if (!parsed.success) throw Object.assign(new Error("গ্রাহকের নাম, ফোন ও ইমেইল যাচাই করুন।"), { code: "VALIDATION", issues: parsed.error.issues });
    const customer = { ...parsed.data.customer, email: parsed.data.customer.email.toLowerCase() };
    const currentExists = await Order.exists({ "customer.phone": id });
    if (!currentExists) throw Object.assign(new Error("গ্রাহককে পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    const phoneInUse = await Order.exists({ $and: [{ "customer.phone": customer.phone }, { "customer.phone": { $ne: id } }] });
    if (phoneInUse) throw Object.assign(new Error("এই ফোন নম্বরটি অন্য গ্রাহকের সঙ্গে যুক্ত।"), { code: "CUSTOMER_PHONE_EXISTS" });
    await Order.updateMany({ "customer.phone": id }, { $set: {
      "customer.name": customer.name,
      "customer.phone": customer.phone,
      "customer.email": customer.email,
    } }, { runValidators: true });
    return { customer };
  }

  if (resource === "orders") {
    const parsed = orderStatusSchema.safeParse(rawData);
    if (!parsed.success) throw Object.assign(new Error("অর্ডারের অবস্থা যাচাই করা যায়নি।"), { code: "VALIDATION", issues: parsed.error.issues });
    const allowedTransitions = {
      new: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    const session = await mongoose.startSession();
    let updatedOrder;
    try {
      await session.withTransaction(async () => {
        const order = await Order.findById(id).session(session);
        if (!order) throw Object.assign(new Error("অর্ডারটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
        const nextStatus = parsed.data.status;
        if (order.status === nextStatus) {
          updatedOrder = order;
          return;
        }
        if (!allowedTransitions[order.status]?.includes(nextStatus)) {
          throw Object.assign(new Error("এই অর্ডারের অবস্থা পরিবর্তন করা যাবে না।"), { code: "INVALID_ORDER_TRANSITION" });
        }
        if (nextStatus === "cancelled") {
          for (const item of order.items) {
            if (!item.product) continue;
            const restock = await Product.updateOne(
              { _id: item.product, sizes: { $elemMatch: { label: item.size } } },
              { $inc: { "sizes.$.stock": item.quantity } },
              { session },
            );
            if (restock.modifiedCount !== 1) {
              throw Object.assign(new Error("অর্ডারের একটি ভ্যারিয়েন্ট আর পাওয়া যাচ্ছে না; স্টক নিরাপদে ফেরত দেওয়া যায়নি।"), { code: "VARIANT_IN_USE" });
            }
          }
        }
        order.status = nextStatus;
        order.statusHistory.push({ status: nextStatus, changedAt: new Date(), changedBy: adminId || null });
        await order.save({ session });
        updatedOrder = order;
      });
    } finally {
      await session.endSession();
    }
    return toPlain(updatedOrder);
  }

  if (resource === "reviews") {
    const parsed = adminReviewUpdateSchema.safeParse(rawData);
    if (!parsed.success) throw Object.assign(new Error("রিভিউর তথ্য যাচাই করুন।"), { code: "VALIDATION", issues: parsed.error.issues });
    const review = await Review.findByIdAndUpdate(id, { $set: { ...parsed.data, email: parsed.data.email.toLowerCase() } }, { new: true, runValidators: true }).lean();
    if (!review) throw Object.assign(new Error("রিভিউটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    await refreshProductRating(review.product);
    return review;
  }

  if (resource === "newsletter") {
    const parsed = newsletterStatusSchema.safeParse(rawData);
    if (!parsed.success) throw Object.assign(new Error("সাবস্ক্রিপশন অবস্থা যাচাই করা যায়নি।"), { code: "VALIDATION", issues: parsed.error.issues });
    const newsletter = await Newsletter.findByIdAndUpdate(id, { $set: { isSubscribed: parsed.data.isSubscribed, unsubscribedAt: parsed.data.isSubscribed ? null : new Date() } }, { new: true, runValidators: true }).lean();
    if (!newsletter) throw Object.assign(new Error("ইমেইলটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    return newsletter;
  }

  const schema = createSchemas[resource];
  if (!schema) throw Object.assign(new Error("এই বিভাগে তথ্য সম্পাদনা করা যায় না।"), { code: "RESOURCE_READ_ONLY" });
  const parsed = schema.safeParse(rawData);
  if (!parsed.success) throw Object.assign(new Error("তথ্য যাচাই করা যায়নি।"), { code: "VALIDATION", issues: parsed.error.issues });
  const data = parsed.data;

  if (resource === "products") {
    const productId = new mongoose.Types.ObjectId(String(id));
    const inFlightItems = await Order.aggregate([
      { $match: { status: { $in: ["new", "confirmed", "processing"] }, "items.product": productId } },
      { $unwind: "$items" },
      { $match: { "items.product": productId } },
      { $group: { _id: "$items.size" } },
    ]);
    const availableSizeLabels = new Set(data.sizes.map((size) => size.label));
    if (inFlightItems.some((item) => !availableSizeLabels.has(item._id))) {
      throw Object.assign(new Error("চলমান অর্ডারে ব্যবহৃত সাইজ সরানো যাবে না। স্টক ০ করে বিক্রি বন্ধ করুন।"), { code: "VARIANT_IN_USE" });
    }
    const updated = await Product.findByIdAndUpdate(id, { $set: await productPayload(data) }, { new: true, runValidators: true });
    if (!updated) throw Object.assign(new Error("পণ্যটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    return toPlain(updated);
  }
  if (resource === "categories") {
    const updated = await Category.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!updated) throw Object.assign(new Error("সংগ্রহটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    await Product.updateMany({ category: updated._id }, { $set: { categorySlug: updated.slug, categoryName: updated.name } });
    return toPlain(updated);
  }
  if (resource === "coupons") {
    const updated = await Coupon.findByIdAndUpdate(id, { $set: couponPayload(data) }, { new: true, runValidators: true });
    if (!updated) throw Object.assign(new Error("কুপনটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    return toPlain(updated);
  }
  if (resource === "banners") {
    const updated = await Banner.findByIdAndUpdate(id, { $set: bannerPayload(data) }, { new: true, runValidators: true });
    if (!updated) throw Object.assign(new Error("ব্যানারটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    return toPlain(updated);
  }
  if (resource === "testimonials") {
    const updated = await Testimonial.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!updated) throw Object.assign(new Error("প্রশংসাপত্রটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    return toPlain(updated);
  }
  if (resource === "hero") return toPlain(await HeroSection.findOneAndUpdate({ key: id === "home" ? "home" : id }, { $set: { ...data, key: "home" } }, { upsert: true, new: true, runValidators: true }));
  if (resource === "settings") return toPlain(await SiteSettings.findOneAndUpdate({ key: "site" }, { $set: { ...data, key: "site" } }, { upsert: true, new: true, runValidators: true }));
  throw Object.assign(new Error("এই বিভাগে তথ্য সম্পাদনা করা যায় না।"), { code: "RESOURCE_READ_ONLY" });
}

export async function deleteAdminResource(resource, id) {
  await connectDatabase();
  if (resource === "customers") {
    const result = await Order.updateMany({ "customer.phone": id }, { $set: {
      "customer.name": "মুছে ফেলা গ্রাহক",
      "customer.phone": `deleted-${new mongoose.Types.ObjectId().toString().slice(-12)}`,
      "customer.email": "",
      "shippingAddress.district": "মুছে ফেলা হয়েছে",
      "shippingAddress.address": "মুছে ফেলা হয়েছে",
    } });
    if (!result.matchedCount) throw Object.assign(new Error("গ্রাহককে পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    return;
  }
  if (resource === "orders") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const order = await Order.findById(id).session(session);
        if (!order) throw Object.assign(new Error("অর্ডারটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
        if (["new", "confirmed", "processing"].includes(order.status)) {
          for (const item of order.items) {
            if (!item.product) continue;
            const restock = await Product.updateOne(
              { _id: item.product, sizes: { $elemMatch: { label: item.size } } },
              { $inc: { "sizes.$.stock": item.quantity } },
              { session },
            );
            if (restock.modifiedCount !== 1) throw Object.assign(new Error("অর্ডারের পণ্য স্টকে ফেরত দেওয়া যায়নি।"), { code: "VARIANT_IN_USE" });
          }
        }
        await order.deleteOne({ session });
      });
    } finally {
      await session.endSession();
    }
    return;
  }
  if (resource === "hero") {
    await HeroSection.deleteOne({ key: "home" });
    return;
  }
  if (resource === "categories") {
    const category = await Category.findById(id).select("_id").lean();
    if (!category) throw Object.assign(new Error("সংগ্রহটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    if (await Product.exists({ category: category._id })) throw Object.assign(new Error("এই সংগ্রহে পণ্য আছে। আগে পণ্যগুলোর সংগ্রহ পরিবর্তন করুন।"), { code: "RESOURCE_IN_USE" });
    await Category.deleteOne({ _id: id });
    return;
  }
  if (resource === "reviews") {
    const review = await Review.findByIdAndDelete(id).lean();
    if (!review) throw Object.assign(new Error("রিভিউটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
    await refreshProductRating(review.product);
    return;
  }
  if (resource === "products" && await Order.exists({ "items.product": id })) {
    throw Object.assign(new Error("এই পণ্যটি অর্ডারে ব্যবহৃত হয়েছে। মুছে না দিয়ে নিষ্ক্রিয় করুন।"), { code: "RESOURCE_IN_USE" });
  }
  const Model = { products: Product, coupons: Coupon, banners: Banner, testimonials: Testimonial }[resource];
  if (!Model) throw Object.assign(new Error("এই বিভাগে তথ্য মুছে ফেলা যায় না।"), { code: "RESOURCE_READ_ONLY" });
  const deleted = await Model.findByIdAndDelete(id).lean();
  if (!deleted) throw Object.assign(new Error("তথ্যটি পাওয়া যায়নি।"), { code: "NOT_FOUND" });
}
