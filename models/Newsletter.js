import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  isSubscribed: { type: Boolean, default: true, index: true },
  source: { type: String, trim: true, maxlength: 80, default: "storefront" },
  consentAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);
