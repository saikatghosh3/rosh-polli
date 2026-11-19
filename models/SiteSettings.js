import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema({
  image: { type: String, required: true, trim: true, maxlength: 2048 },
  alt: { type: String, trim: true, maxlength: 180, default: "" },
  href: { type: String, trim: true, maxlength: 300, default: "" },
}, { _id: false });

const storySchema = new mongoose.Schema({
  eyebrow: { type: String, trim: true, maxlength: 120, default: "" },
  title: { type: String, trim: true, maxlength: 200, default: "" },
  body: { type: String, trim: true, maxlength: 1800, default: "" },
  image: { type: String, trim: true, maxlength: 2048, default: "" },
  linkLabel: { type: String, trim: true, maxlength: 80, default: "" },
  linkHref: { type: String, trim: true, maxlength: 300, default: "/about" },
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "site", required: true },
  brandName: { type: String, trim: true, maxlength: 80, default: "রসপল্লী" },
  brandDescriptor: { type: String, trim: true, maxlength: 120, default: "কেজুর গুর ও রসের ঠিকানা" },
  tagline: { type: String, trim: true, maxlength: 180, default: "" },
  logoUrl: { type: String, trim: true, maxlength: 2048, default: "" },
  supportPhone: { type: String, trim: true, maxlength: 40, default: "" },
  supportEmail: { type: String, lowercase: true, trim: true, maxlength: 254, default: "" },
  address: { type: String, trim: true, maxlength: 240, default: "" },
  deliveryCharge: { type: Number, min: 0, default: 0 },
  deliveryChargeDhaka: { type: Number, min: 0, default: 0 },
  deliveryChargeOutsideDhaka: { type: Number, min: 0, default: 0 },
  freeDeliveryThreshold: { type: Number, min: 0, default: 0 },
  socialLinks: { instagram: { type: String, trim: true, maxlength: 300, default: "" }, facebook: { type: String, trim: true, maxlength: 300, default: "" }, twitter: { type: String, trim: true, maxlength: 300, default: "" } },
  seoTitle: { type: String, trim: true, maxlength: 180, default: "" },
  seoDescription: { type: String, trim: true, maxlength: 320, default: "" },
  announcementText: { type: String, trim: true, maxlength: 240, default: "" },
  announcementActive: { type: Boolean, default: false },
  brandStory: { type: storySchema, default: () => ({}) },
  socialGallery: { type: [galleryItemSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);
