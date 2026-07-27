import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword } from '../utils/password.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, sortBy = 'latest', page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      const q = String(search);
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
      ];
    }
    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    else if (sortBy === 'name') sortOptions = { name: 1 };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      User.find(query).select('-password').sort(sortOptions).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    return res.status(200).json(new ApiResponse(200, {
      users: items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    }, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();
    if (!user) return next(new ApiError(404, 'User not found'));
    return res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const body = req.body;
    const userData = {
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email,
      mobile: body.mobile || '',
      password: await hashPassword(body.password || 'Password@123'),
      role: body.role || 'Admin',
      profilePicture: body.profilePicture || body.avatar || '',
      status: body.status || 'Active',
    };
    const user = await User.create(userData);
    const { password, ...safeUser } = user.toObject();
    return res.status(201).json(new ApiResponse(201, safeUser, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    if (body.firstName || body.lastName) {
      body.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }
    const updated = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select('-password').lean();
    if (!updated) return next(new ApiError(404, 'User not found'));
    return res.status(200).json(new ApiResponse(200, updated, 'User updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return next(new ApiError(404, 'User not found'));
    return res.status(200).json(new ApiResponse(200, { id }, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const password = newPassword || 'Reset@1234';
    const hashedPwd = await hashPassword(password);
    const updated = await User.findByIdAndUpdate(id, { password: hashedPwd }, { runValidators: true });
    if (!updated) return next(new ApiError(404, 'User not found'));
    return res.status(200).json(new ApiResponse(200, { id }, 'Password reset successfully'));
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await User.findByIdAndUpdate(id, { status }, { runValidators: true });
    if (!updated) return next(new ApiError(404, 'User not found'));
    return res.status(200).json(new ApiResponse(200, { id, status }, 'User status updated'));
  } catch (error) {
    next(error);
  }
};
