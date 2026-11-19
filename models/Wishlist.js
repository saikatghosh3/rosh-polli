import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  products: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], default: [] },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
