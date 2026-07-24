import { BlogPost } from '../models/BlogPost.js';
import { ApiResponse } from '../utils/apiResponse.js';

let inMemoryBlogs = [
  {
    _id: 'b-101',
    id: 'b-101',
    title: 'The Art of Royal Plating: Elevating Luxury Wedding Feasts',
    slug: 'the-art-of-royal-plating',
    excerpt: 'Mastering the visual presentation of grand multi-course banquets with traditional silver accents and modern molecular gastronomy.',
    content: '<p>Visual allure is the prelude to any luxury culinary journey. In royal Indian banquets, plating is not merely serving food—it is an immersive artistic experience. From 24-karat edible gold leaf garnishes to handcrafted copper chafing pedestals, every element tells a story of heritage and indulgence.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'],
    author: 'Chef Ranveer Brar',
    category: 'Culinary Arts',
    tags: ['Weddings', 'Plating', 'Luxury Catering'],
    readingTime: '6 min read',
    publishDate: new Date('2026-06-15').toISOString(),
    seoTitle: 'Royal Plating Techniques for Luxury Banquets | Eveng Catering',
    seoDescription: 'Discover how master chefs curate fine-dining plating for high-end wedding banquets and corporate galas.',
    metaKeywords: 'catering, luxury plating, wedding menu, fine dining',
    featured: true,
    status: 'Active',
    createdAt: new Date('2026-06-15').toISOString()
  },
  {
    _id: 'b-102',
    id: 'b-102',
    title: 'Sustainable Gourmet: Zero-Waste Banqueting Solutions',
    slug: 'sustainable-gourmet-zero-waste',
    excerpt: 'How Eveng Catering implements eco-conscious sourcing, compostable tableware, and food donation partnerships across 500+ events.',
    content: '<p>Sustainability is no longer an afterthought; it is a core pillar of modern hospitality. By sourcing 100% organic regional produce and converting food scraps into bio-compost, we reduce environmental footprint without compromising flavor or regal elegance.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80',
    galleryImages: [],
    author: 'Meera Nair',
    category: 'Industry Trends',
    tags: ['Eco Friendly', 'Sustainability', 'Corporate Events'],
    readingTime: '4 min read',
    publishDate: new Date('2026-07-02').toISOString(),
    seoTitle: 'Eco-Friendly & Sustainable Event Catering | Eveng',
    seoDescription: 'Learn about our zero-waste initiative and sustainable luxury catering options for eco-conscious hosts.',
    metaKeywords: 'zero waste catering, organic event food, eco banquets',
    featured: false,
    status: 'Active',
    createdAt: new Date('2026-07-02').toISOString()
  },
  {
    _id: 'b-103',
    id: 'b-103',
    title: 'Interactive Live Stalls: Revolutionizing Event Catering',
    slug: 'interactive-live-stalls-revolution',
    excerpt: 'From smoked kokum mixology counters to liquid nitrogen chaat stations, explore why interactive food counters dominate 2026 receptions.',
    content: '<p>Guests today crave an engaging culinary experience. Live cooking counters allow attendees to interact directly with chefs, customized to exact spice preferences in real time.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80',
    galleryImages: [],
    author: 'Ananya Sharma',
    category: 'Event Trends',
    tags: ['Live Stalls', 'Interactive Dining', 'Sangeet Menu'],
    readingTime: '5 min read',
    publishDate: new Date('2026-07-10').toISOString(),
    seoTitle: 'Trending Live Food Counters for Sangeet & Weddings',
    seoDescription: 'Top 10 interactive live food stalls for corporate summits and sangeet night celebrations.',
    metaKeywords: 'live stalls, chaat counter, teppanyaki catering',
    featured: true,
    status: 'Active',
    createdAt: new Date('2026-07-10').toISOString()
  }
];

export const getBlogs = async (req, res, next) => {
  try {
    const { search, category, status, featured, sortBy = 'latest', page = 1, limit = 10 } = req.query;

    let items = [];
    try {
      items = await BlogPost.find().lean();
    } catch (dbErr) {
      items = [];
    }
    if (!items || items.length === 0) {
      items = [...inMemoryBlogs];
    }

    // Search filter
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category && category !== 'All') {
      items = items.filter(b => b.category === category);
    }

    // Status filter
    if (status && status !== 'All') {
      items = items.filter(b => b.status === status);
    }

    // Featured filter
    if (featured !== undefined && featured !== '') {
      const isFeat = String(featured) === 'true';
      items = items.filter(b => Boolean(b.featured) === isFeat);
    }

    // Sort
    if (sortBy === 'latest') {
      items.sort((a, b) => new Date(b.createdAt || b.publishDate).getTime() - new Date(a.createdAt || a.publishDate).getTime());
    } else if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.createdAt || a.publishDate).getTime() - new Date(b.createdAt || b.publishDate).getTime());
    } else if (sortBy === 'title') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json(new ApiResponse(200, {
      blogs: paginatedItems,
      total,
      page: pageNum,
      totalPages
    }, 'Blog posts fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let blog = null;
    try {
      blog = await BlogPost.findOne({ slug }).lean();
    } catch (e) {
      blog = null;
    }
    if (!blog) {
      blog = inMemoryBlogs.find(b => b.slug === slug || b._id === slug || b.id === slug);
    }
    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, 'Blog post not found'));
    }
    return res.status(200).json(new ApiResponse(200, blog, 'Blog post fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const body = req.body;
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newBlog = {
      _id: `b-${Date.now()}`,
      id: `b-${Date.now()}`,
      title: body.title,
      slug,
      excerpt: body.excerpt || body.shortDescription || '',
      content: body.content || '',
      featuredImage: body.featuredImage || body.image || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
      galleryImages: body.galleryImages || [],
      author: body.author || 'Eveng Culinary Team',
      category: body.category || 'General',
      tags: body.tags ? (Array.isArray(body.tags) ? body.tags : body.tags.split(',').map(t => t.trim())) : [],
      readingTime: body.readingTime || '5 min read',
      publishDate: body.publishDate || new Date().toISOString(),
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || body.excerpt || '',
      metaKeywords: body.metaKeywords || '',
      featured: Boolean(body.featured),
      status: body.status || 'Active',
      createdAt: new Date().toISOString()
    };

    try {
      await BlogPost.create(newBlog);
    } catch (dbErr) {
      // Fallback
    }
    inMemoryBlogs.unshift(newBlog);

    return res.status(201).json(new ApiResponse(201, newBlog, 'Blog created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    let updated = null;
    try {
      updated = await BlogPost.findByIdAndUpdate(id, body, { new: true }).lean();
    } catch (e) {
      updated = null;
    }

    const index = inMemoryBlogs.findIndex(b => b._id === id || b.id === id);
    if (index !== -1) {
      inMemoryBlogs[index] = { ...inMemoryBlogs[index], ...body, updatedAt: new Date().toISOString() };
      updated = inMemoryBlogs[index];
    }

    if (!updated) {
      return res.status(404).json(new ApiResponse(404, null, 'Blog not found'));
    }

    return res.status(200).json(new ApiResponse(200, updated, 'Blog updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await BlogPost.findByIdAndDelete(id);
    } catch (e) {
      // Fallback
    }
    inMemoryBlogs = inMemoryBlogs.filter(b => b._id !== id && b.id !== id);

    return res.status(200).json(new ApiResponse(200, { id }, 'Blog deleted successfully'));
  } catch (error) {
    next(error);
  }
};
