import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin"], default: "admin", required: true },
  isActive: { type: Boolean, default: true, index: true },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ email: 1, role: 1 }, { unique: true });
userSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: "admin" } });

export default mongoose.models.User || mongoose.model("User", userSchema);
