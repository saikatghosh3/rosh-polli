import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
  eyebrow: { type: String, trim: true, maxlength: 100, default: "" },
  description: { type: String, trim: true, maxlength: 600, default: "" },
  image: { type: String, required: true, trim: true, maxlength: 2048 },
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

categorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
