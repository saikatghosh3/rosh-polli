import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 40 },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false });

const notesSchema = new mongoose.Schema({
  top: { type: [String], default: [] },
  middle: { type: [String], default: [] },
  base: { type: [String], default: [] },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
  tagline: { type: String, trim: true, maxlength: 180, default: "" },
  description: { type: String, required: true, trim: true, maxlength: 6000 },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0, default: null },
  gender: { type: String, enum: ["কেজুর গুর", "কেজুর রস", "গুরের মিষ্টি"], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  categorySlug: { type: String, required: true, lowercase: true, trim: true, index: true },
  categoryName: { type: String, required: true, trim: true, maxlength: 100 },
  brand: { type: String, trim: true, maxlength: 100, default: "রসপল্লী" },
  images: { type: [String], required: true, validate: [(items) => items.length > 0 && items.length <= 8, "এক থেকে আটটি ছবি দিতে হবে।"] },
  sizes: { type: [sizeSchema], required: true, validate: [(items) => items.length > 0 && items.length <= 8, "এক থেকে আটটি সাইজ দিতে হবে।"] },
  notes: { type: notesSchema, default: () => ({}) },
  isFeatured: { type: Boolean, default: false, index: true },
  isBestSeller: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true },
  seoTitle: { type: String, trim: true, maxlength: 180, default: "" },
  seoDescription: { type: String, trim: true, maxlength: 320, default: "" },
  ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
  ratingCount: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

productSchema.index({ name: "text", tagline: "text", description: "text" });
productSchema.index({ isActive: 1, categorySlug: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isFeatured: 1, isBestSeller: 1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
