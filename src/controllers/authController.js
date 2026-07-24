import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';

// In-memory fallback state if database is disconnected
const inMemoryUsers = new Map();

// Seed initial default super admin
(async () => {
  const defaultAdmin = {
    id: 'admin-1',
    name: 'Executive Admin',
    email: 'admin@evengcatering.com',
    mobile: '+1 (800) 555-2283',
    password: await hashPassword('Admin123!'),
    role: ROLES.SUPER_ADMIN,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    verified: true,
    permissions: ['all']
  };
  inMemoryUsers.set('admin@evengcatering.com', defaultAdmin);
})();

export const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    let existingUser = await User.findOne({ email }).catch(() => null);
    if (!existingUser && inMemoryUsers.has(email)) {
      existingUser = inMemoryUsers.get(email);
    }

    if (existingUser) {
      return next(new ApiError(400, 'An account with this email address already exists.'));
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || ROLES.ADMIN;

    let newUser;
    try {
      newUser = await User.create({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: userRole,
        verified: true,
        permissions: ['all']
      });
    } catch {
      newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        mobile,
        password: hashedPassword,
        role: userRole,
        verified: true,
        permissions: ['all']
      };
      inMemoryUsers.set(email, newUser);
    }

    const token = generateToken({
      id: newUser._id || newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return res.status(201).json(new ApiResponse(201, {
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        avatar: newUser.avatar || ''
      }
    }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return next(new ApiError(400, 'Please provide both email/mobile and password.'));
    }

    let user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
    }).catch(() => null);

    if (!user) {
      user = Array.from(inMemoryUsers.values()).find(
        u => u.email === emailOrMobile || u.mobile === emailOrMobile
      );
    }

    if (!user) {
      return next(new ApiError(401, 'Invalid login credentials. Please verify your email/mobile and password.'));
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials provided.'));
    }

    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return res.status(200).json(new ApiResponse(200, {
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar || ''
      }
    }, 'Authentication successful'));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id).select('-password').catch(() => null);
    if (!user) {
      user = Array.from(inMemoryUsers.values()).find(u => u.id === req.user.id || u._id === req.user.id);
    }

    if (!user) {
      return next(new ApiError(404, 'Authenticated user profile not found.'));
    }

    return res.status(200).json(new ApiResponse(200, {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatar: user.avatar || ''
    }, 'User profile retrieved'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
};
