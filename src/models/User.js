import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.ADMIN },
  profilePicture: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  verified: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
