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
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
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
        profilePicture: newUser.profilePicture || ''
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
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }, { username: emailOrMobile }]
    }).catch(() => null);

    if (!user) {
      user = Array.from(inMemoryUsers.values()).find(
        u => u.email === emailOrMobile || u.mobile === emailOrMobile
      );
    }

    if (!user) {
      return next(new ApiError(401, 'Invalid login credentials. Please verify your email/mobile/username and password.'));
    }

    if (user.status !== 'Active') {
      return next(new ApiError(403, 'Your account is ' + (user.status || 'inactive') + '. Please contact your administrator.'));
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials provided.'));
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(() => {});

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
        username: user.username || '',
        role: user.role,
        status: user.status || 'Active',
        profilePicture: user.profilePicture || ''
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
      username: user.username || '',
      role: user.role,
      status: user.status || 'Active',
      profilePicture: user.profilePicture || ''
    }, 'User profile retrieved'));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.email) body.email = body.email.trim().toLowerCase();
    if (body.firstName || body.lastName) {
      body.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }
    delete body.password;
    delete body.role;
    delete body.username;
    delete body.status;

    let updated;

    try {
      updated = await User.findByIdAndUpdate(req.user.id, body, { new: true, runValidators: true }).select('-password').lean();
    } catch {}

    if (!updated) {
      const memUser = Array.from(inMemoryUsers.values()).find(
        u => u.id === req.user.id || (u._id && String(u._id) === req.user.id)
      );
      if (memUser) {
        Object.assign(memUser, body);
        inMemoryUsers.set(memUser.email, memUser);
        updated = { ...memUser };
        delete updated.password;
      }
    }

    if (!updated) {
      return next(new ApiError(404, 'User profile not found. Please login again.'));
    }

    return res.status(200).json(new ApiResponse(200, {
      id: updated._id || updated.id,
      name: updated.name,
      email: updated.email,
      mobile: updated.mobile,
      username: updated.username || '',
      role: updated.role,
      status: updated.status || 'Active',
      profilePicture: updated.profilePicture || ''
    }, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (req, res, next) => {
  try {
    const { emailOrMobile } = req.body;
    if (!emailOrMobile) {
      return next(new ApiError(400, 'Email or mobile is required.'));
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
      return next(new ApiError(404, 'No account found with that email or mobile.'));
    }

    return res.status(200).json(new ApiResponse(200, {
      verified: true,
      email: user.email
    }, 'Account verified successfully.'));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { emailOrMobile, newPassword } = req.body;
    if (!emailOrMobile || !newPassword) {
      return next(new ApiError(400, 'Email/mobile and new password are required.'));
    }
    if (newPassword.length < 8) {
      return next(new ApiError(400, 'Password must be at least 8 characters.'));
    }

    const hashed = await hashPassword(newPassword);
    let updated = false;

    try {
      const user = await User.findOne({ $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }] });
      if (user) {
        user.password = hashed;
        await user.save();
        updated = true;
      }
    } catch {}

    if (!updated) {
      const memUser = Array.from(inMemoryUsers.values()).find(
        u => u.email === emailOrMobile || u.mobile === emailOrMobile
      );
      if (memUser) {
        memUser.password = hashed;
        inMemoryUsers.set(memUser.email, memUser);
        updated = true;
      }
    }

    if (!updated) {
      return next(new ApiError(404, 'Account not found.'));
    }

    return res.status(200).json(new ApiResponse(200, null, 'Password reset successfully.'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
};
