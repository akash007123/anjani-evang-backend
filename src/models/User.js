import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['Super Admin', 'Admin', 'Manager', 'Employee'], default: 'Admin' },
  profilePicture: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  verified: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
