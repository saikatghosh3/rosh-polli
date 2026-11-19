import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String, required: true, trim: true, maxlength: 40 },
  quantity: { type: Number, required: true, min: 1, max: 10 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  checkoutToken: { type: String, required: true, default: () => randomUUID() },
  items: { type: [cartItemSchema], default: [] },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
