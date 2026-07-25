import { Comment } from '../models/Comment.js';
import { BlogPost } from '../models/BlogPost.js';
import { Settings } from '../models/Settings.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

function sanitize(text) {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export const getBlogComments = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({
      blogId,
      status: 'Approved',
      isDeleted: false
    }).sort({ createdAt: -1 }).lean();

    return res.status(200).json(new ApiResponse(200, comments, 'Comments fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { name, email, mobile, profileImage, comment } = req.body;

    if (!name || name.trim().length < 2) {
      return next(new ApiError(400, 'Name must be at least 2 characters'));
    }
    if (!comment || comment.trim().length < 5) {
      return next(new ApiError(400, 'Comment must be at least 5 characters'));
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(new ApiError(400, 'Invalid email format'));
    }
    if (mobile && !/^\+?\d{6,15}$/.test(mobile.replace(/[\s-]/g, ''))) {
      return next(new ApiError(400, 'Invalid mobile number format'));
    }

    const blog = await BlogPost.findById(blogId);
    if (!blog) {
      return next(new ApiError(404, 'Blog post not found'));
    }

    const settings = await Settings.findOne();
    const moderationEnabled = settings ? settings.commentModeration : true;

    const commentDoc = await Comment.create({
      blogId,
      name: sanitize(name.trim()),
      email: email ? email.trim() : '',
      mobile: mobile ? mobile.replace(/[\s-]/g, '') : '',
      profileImage: profileImage || '',
      comment: sanitize(comment.trim()),
      status: moderationEnabled ? 'Pending' : 'Approved'
    });

    return res.status(201).json(new ApiResponse(201, commentDoc.toObject(), 'Comment submitted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllComments = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = { isDeleted: false };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const q = String(search);
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { comment: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Comment.find(query)
        .populate('blogId', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Comment.countDocuments(query)
    ]);

    return res.status(200).json(new ApiResponse(200, {
      comments: items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }, 'Comments fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCommentById = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('blogId', 'title slug')
      .lean();

    if (!comment || comment.isDeleted) {
      return next(new ApiError(404, 'Comment not found'));
    }

    return res.status(200).json(new ApiResponse(200, comment, 'Comment fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const approveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return next(new ApiError(404, 'Comment not found'));
    }

    comment.status = 'Approved';
    await comment.save();

    return res.status(200).json(new ApiResponse(200, comment.toObject(), 'Comment approved successfully'));
  } catch (error) {
    next(error);
  }
};

export const rejectComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return next(new ApiError(404, 'Comment not found'));
    }

    comment.status = 'Rejected';
    await comment.save();

    return res.status(200).json(new ApiResponse(200, comment.toObject(), 'Comment rejected successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return next(new ApiError(404, 'Comment not found'));
    }

    comment.isDeleted = true;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, { id: req.params.id }, 'Comment deleted successfully'));
  } catch (error) {
    next(error);
  }
};
