import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, trim: true, maxlength: 100, default: "" },
  quote: { type: String, required: true, trim: true, maxlength: 1200 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isPublished: { type: Boolean, default: false, index: true },
  sortOrder: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

testimonialSchema.index({ isPublished: 1, sortOrder: 1 });

export default mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);
