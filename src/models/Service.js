import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String },
  pricePerGuest: { type: Number, required: true },
  minGuests: { type: Number, default: 10 },
  image: { type: String },
  icon: { type: String },
  category: { type: String, default: 'Catering' },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }]
}, { timestamps: true });

export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
