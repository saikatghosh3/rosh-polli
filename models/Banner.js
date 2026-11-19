import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  subtitle: { type: String, trim: true, maxlength: 600, default: "" },
  image: { type: String, required: true, trim: true, maxlength: 2048 },
  ctaLabel: { type: String, trim: true, maxlength: 80, default: "" },
  ctaHref: { type: String, trim: true, maxlength: 300, default: "/products" },
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, min: 0, default: 0 },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
}, { timestamps: true });

bannerSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
