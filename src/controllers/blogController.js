import { BlogPost } from '../models/BlogPost.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function resolveUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug;
  let counter = 1;
  const excludeFilter = excludeId ? { _id: { $ne: excludeId } } : {};
  while (await BlogPost.findOne({ slug, ...excludeFilter })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export const getBlogs = async (req, res, next) => {
  try {
    const { search, category, status, featured, sortBy = 'latest', page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      const q = String(search);
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    } else if (!status) {
      query.status = { $in: ['Active', 'Published'] };
    }

    if (featured !== undefined && featured !== '') {
      query.featured = String(featured) === 'true';
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    if (sortBy === 'title') sortOptions = { title: 1 };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      BlogPost.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      BlogPost.countDocuments(query)
    ]);

    return res.status(200).json(new ApiResponse(200, {
      blogs: items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }, 'Blog posts fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    let blog = await BlogPost.findOne({ slug }).lean();

    if (!blog) {
      if (slug.match(/^[0-9a-fA-F]{24}$/)) {
        blog = await BlogPost.findById(slug).lean();
      }
    }

    if (!blog) {
      return next(new ApiError(404, 'Blog post not found'));
    }

    return res.status(200).json(new ApiResponse(200, blog, 'Blog post fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const body = req.body;

    if (!body.title || !body.content) {
      return next(new ApiError(400, 'Title and content are required'));
    }

    const baseSlug = body.slug ? slugify(body.slug) : slugify(body.title);
    const slug = await resolveUniqueSlug(baseSlug);

    const blog = await BlogPost.create({
      title: body.title,
      slug,
      excerpt: body.excerpt || body.shortDescription || '',
      content: body.content,
      featuredImage: body.featuredImage || body.image || '',
      galleryImages: body.galleryImages || [],
      author: body.author || 'Anjani Culinary Team',
      authorAvatar: body.authorAvatar || '',
      category: body.category || 'General',
      tags: body.tags ? (Array.isArray(body.tags) ? body.tags : body.tags.split(',').map(t => t.trim())) : [],
      readingTime: body.readingTime || '5 min read',
      publishDate: body.publishDate || new Date(),
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || body.excerpt || '',
      metaKeywords: body.metaKeywords || '',
      featured: Boolean(body.featured),
      status: body.status || 'Active'
    });

    return res.status(201).json(new ApiResponse(201, blog.toObject(), 'Blog created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await BlogPost.findById(id);
    if (!existing) {
      return next(new ApiError(404, 'Blog not found'));
    }

    if (body.slug && body.slug !== existing.slug) {
      body.slug = await resolveUniqueSlug(body.slug, id);
    }

    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map(t => t.trim());
    }

    const updated = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

    return res.status(200).json(new ApiResponse(200, updated, 'Blog updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return next(new ApiError(404, 'Blog not found'));
    }

    return res.status(200).json(new ApiResponse(200, { id }, 'Blog deleted successfully'));
  } catch (error) {
    next(error);
  }
};
