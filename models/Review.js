import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, lowercase: true, trim: true, maxlength: 254, default: "" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1200 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
}, { timestamps: true });

reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ order: 1, product: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
