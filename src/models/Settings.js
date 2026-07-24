import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Eveng Catering' },
  companyEmail: { type: String, default: 'concierge@evengcatering.com' },
  companyPhone: { type: String, default: '+1 (800) 555-2283' },
  companyAddress: { type: String, default: '90210 Gourmet Row, Suite A, Beverly Hills, CA' },
  taxRate: { type: Number, default: 8.5 },
  bookingDepositPercentage: { type: Number, default: 25 },
  notificationsEnabled: { type: Boolean, default: true },
  autoReplyEnabled: { type: Boolean, default: true }
}, { timestamps: true });

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
