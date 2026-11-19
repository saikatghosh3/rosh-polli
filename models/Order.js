import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  slug: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  image: { type: String, required: true, trim: true, maxlength: 2048 },
  size: { type: String, required: true, trim: true, maxlength: 40 },
  quantity: { type: Number, required: true, min: 1, max: 10 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ["new", "confirmed", "processing", "shipped", "delivered", "cancelled"], required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  idempotencyKey: { type: String, unique: true, sparse: true, select: false },
  status: { type: String, enum: ["new", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "new", index: true },
  statusHistory: { type: [statusHistorySchema], default: [] },
  customer: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 24 },
    email: { type: String, lowercase: true, trim: true, maxlength: 254, default: "" },
  },
  shippingAddress: {
    district: { type: String, required: true, trim: true, maxlength: 80 },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    zone: { type: String, enum: ["inside", "outside"], default: "inside" },
  },
  items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "অর্ডারে অন্তত একটি পণ্য থাকতে হবে।"] },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  couponCode: { type: String, uppercase: true, trim: true, maxlength: 40, default: "" },
  paymentMethod: { type: String, enum: ["cod"], default: "cod" },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

orderSchema.index({ "customer.phone": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
