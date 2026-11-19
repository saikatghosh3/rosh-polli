import mongoose from "mongoose";

const heroSectionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: "home" },
  eyebrow: { type: String, trim: true, maxlength: 120, default: "" },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  subtitle: { type: String, trim: true, maxlength: 1000, default: "" },
  image: { type: String, required: true, trim: true, maxlength: 2048 },
  primaryLabel: { type: String, required: true, trim: true, maxlength: 80 },
  primaryHref: { type: String, required: true, trim: true, maxlength: 300 },
  secondaryLabel: { type: String, trim: true, maxlength: 80, default: "" },
  secondaryHref: { type: String, trim: true, maxlength: 300, default: "" },
}, { timestamps: true });

export default mongoose.models.HeroSection || mongoose.model("HeroSection", heroSectionSchema);
