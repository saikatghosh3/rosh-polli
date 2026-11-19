import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 40 },
  type: { type: String, enum: ["percent", "fixed"], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, min: 0, default: 0 },
  maxDiscount: { type: Number, min: 0, default: null },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  usageLimit: { type: Number, min: 1, default: null },
  usageCount: { type: Number, min: 0, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

couponSchema.index({ code: 1, isActive: 1 }, { unique: true });

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
