import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { hashPassword } from '../utils/password.js';

let inMemoryUsers = [
  {
    _id: 'usr-1',
    id: 'usr-1',
    firstName: 'Ranveer',
    lastName: 'Brar',
    name: 'Chef Ranveer Brar',
    email: 'ranveer.brar@evengcatering.com',
    mobile: '+91 98765 43210',
    role: 'Super Admin',
    profilePicture: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Active',
    createdAt: new Date('2026-01-10').toISOString(),
    lastLogin: new Date('2026-07-20').toISOString()
  },
  {
    _id: 'usr-2',
    id: 'usr-2',
    firstName: 'Ananya',
    lastName: 'Sharma',
    name: 'Ananya Sharma',
    email: 'ananya.s@evengcatering.com',
    mobile: '+91 98765 43211',
    role: 'Admin',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Active',
    createdAt: new Date('2026-02-15').toISOString(),
    lastLogin: new Date('2026-07-21').toISOString()
  },
  {
    _id: 'usr-3',
    id: 'usr-3',
    firstName: 'Sanjay',
    lastName: 'Kapoor',
    name: 'Sanjay Kapoor',
    email: 'sanjay.k@evengcatering.com',
    mobile: '+91 98765 43212',
    role: 'Manager',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Active',
    createdAt: new Date('2026-03-01').toISOString(),
    lastLogin: new Date('2026-07-19').toISOString()
  },
  {
    _id: 'usr-4',
    id: 'usr-4',
    firstName: 'Meera',
    lastName: 'Nair',
    name: 'Meera Nair',
    email: 'meera.n@evengcatering.com',
    mobile: '+91 98765 43213',
    role: 'Manager',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Active',
    createdAt: new Date('2026-04-12').toISOString(),
    lastLogin: new Date('2026-07-21').toISOString()
  },
  {
    _id: 'usr-5',
    id: 'usr-5',
    firstName: 'Deepak',
    lastName: 'Gupta',
    name: 'Deepak Gupta',
    email: 'deepak.g@evengcatering.com',
    mobile: '+91 98765 43214',
    role: 'Employee',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Inactive',
    createdAt: new Date('2026-05-05').toISOString(),
    lastLogin: new Date('2026-06-30').toISOString()
  }
];

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, sortBy = 'latest', page = 1, limit = 10 } = req.query;

    let items = [];
    try {
      items = await User.find().lean();
    } catch (e) {
      items = [];
    }
    if (!items || items.length === 0) {
      items = [...inMemoryUsers];
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.toLowerCase().includes(q))
      );
    }

    if (role && role !== 'All') {
      items = items.filter(u => u.role === role);
    }

    if (status && status !== 'All') {
      items = items.filter(u => u.status === status);
    }

    if (sortBy === 'latest') {
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sortBy === 'name') {
      items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json(new ApiResponse(200, {
      users: paginatedItems,
      total,
      page: pageNum,
      totalPages
    }, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user = null;
    try {
      user = await User.findById(id).lean();
    } catch (e) {
      user = null;
    }
    if (!user) {
      user = inMemoryUsers.find(u => u._id === id || u.id === id);
    }
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, 'User not found'));
    }
    return res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const body = req.body;
    const firstName = body.firstName || (body.name ? body.name.split(' ')[0] : 'User');
    const lastName = body.lastName || (body.name ? body.name.split(' ').slice(1).join(' ') : '');
    const fullName = body.name || `${firstName} ${lastName}`.trim();
    const hashedPwd = await hashPassword(body.password || 'password123');

    const newUser = {
      _id: `usr-${Date.now()}`,
      id: `usr-${Date.now()}`,
      firstName,
      lastName,
      name: fullName,
      email: body.email,
      mobile: body.mobile || '',
      password: hashedPwd,
      role: body.role || 'Admin',
      profilePicture: body.profilePicture || body.avatar || '',
      status: body.status || 'Active',
      createdAt: new Date().toISOString()
    };

    try {
      await User.create(newUser);
    } catch (e) {
      // Fallback
    }
    inMemoryUsers.unshift(newUser);

    const { password, ...safeUser } = newUser;
    return res.status(201).json(new ApiResponse(201, safeUser, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (body.firstName || body.lastName) {
      body.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }

    let updated = null;
    try {
      updated = await User.findByIdAndUpdate(id, body, { new: true }).lean();
    } catch (e) {
      updated = null;
    }

    const index = inMemoryUsers.findIndex(u => u._id === id || u.id === id);
    if (index !== -1) {
      inMemoryUsers[index] = { ...inMemoryUsers[index], ...body, updatedAt: new Date().toISOString() };
      updated = inMemoryUsers[index];
    }

    if (!updated) {
      return res.status(404).json(new ApiResponse(404, null, 'User not found'));
    }

    return res.status(200).json(new ApiResponse(200, updated, 'User updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await User.findByIdAndDelete(id);
    } catch (e) {
      // Fallback
    }
    inMemoryUsers = inMemoryUsers.filter(u => u._id !== id && u.id !== id);

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

    try {
      await User.findByIdAndUpdate(id, { password: hashedPwd });
    } catch (e) {
      // Fallback
    }

    const user = inMemoryUsers.find(u => u._id === id || u.id === id);
    if (user) {
      user.password = hashedPwd;
    }

    return res.status(200).json(new ApiResponse(200, { id, message: 'Password reset successfully' }, 'Password reset successfully'));
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    try {
      await User.findByIdAndUpdate(id, { status });
    } catch (e) {
      // Fallback
    }

    const user = inMemoryUsers.find(u => u._id === id || u.id === id);
    if (user) {
      user.status = status;
    }

    return res.status(200).json(new ApiResponse(200, { id, status }, 'User status updated'));
  } catch (error) {
    next(error);
  }
};
