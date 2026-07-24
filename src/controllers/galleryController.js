import { Gallery } from '../models/Gallery.js';
import { ApiResponse } from '../utils/apiResponse.js';

let inMemoryGallery = [
  {
    _id: 'gal-1',
    id: 'gal-1',
    type: 'image',
    title: 'The Royal Ambani Wedding Banquet',
    description: 'Grand 1500-guest silver dinner set up with traditional flower canopies and live musical counters.',
    category: 'Weddings',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 1,
    status: 'Active',
    createdAt: new Date('2026-06-01').toISOString()
  },
  {
    _id: 'gal-2',
    id: 'gal-2',
    type: 'image',
    title: 'Gourmet Sangeet Chaat Counter',
    description: 'Interactive live street food stalls with liquid nitrogen panipuri and artisanal chutneys.',
    category: 'Live Stalls',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 2,
    status: 'Active',
    createdAt: new Date('2026-06-15').toISOString()
  },
  {
    _id: 'gal-3',
    id: 'gal-3',
    type: 'video',
    title: 'Behind the Scenes: Master Chefs at Work',
    description: 'Cinematic view into our 10,000 sq.ft state-of-the-art central kitchen preparing for a destination wedding.',
    category: 'Kitchen & Chef',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 3,
    status: 'Active',
    createdAt: new Date('2026-07-01').toISOString()
  },
  {
    _id: 'gal-4',
    id: 'gal-4',
    type: 'image',
    title: 'Oracle Corporate Banquet Gala',
    description: 'High-end corporate multi-cuisine buffet for 350 executives at Malibu Coast.',
    category: 'Corporate',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80',
    featured: false,
    displayOrder: 4,
    status: 'Active',
    createdAt: new Date('2026-07-05').toISOString()
  },
  {
    _id: 'gal-5',
    id: 'gal-5',
    type: 'video',
    title: 'Live Smoked Mocktail Mixology Show',
    description: 'Watch our master mixologists create cedar-wood smoked kokum margaritas.',
    category: 'Mocktails',
    videoType: 'vimeo',
    videoUrl: 'https://vimeo.com/76979871',
    thumbnail: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 5,
    status: 'Active',
    createdAt: new Date('2026-07-10').toISOString()
  }
];

export const getGalleryItems = async (req, res, next) => {
  try {
    const { search, type, category, status, featured, sortBy = 'latest', page = 1, limit = 10 } = req.query;

    let items = [];
    try {
      items = await Gallery.find().lean();
    } catch (e) {
      items = [];
    }
    if (!items || items.length === 0) {
      items = [...inMemoryGallery];
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(g => 
        (g.title && g.title.toLowerCase().includes(q)) ||
        (g.description && g.description.toLowerCase().includes(q)) ||
        (g.category && g.category.toLowerCase().includes(q))
      );
    }

    if (type && type !== 'All') {
      items = items.filter(g => g.type === type);
    }

    if (category && category !== 'All') {
      items = items.filter(g => g.category === category);
    }

    if (status && status !== 'All') {
      items = items.filter(g => g.status === status);
    }

    if (featured !== undefined && featured !== '') {
      items = items.filter(g => Boolean(g.featured) === (String(featured) === 'true'));
    }

    if (sortBy === 'latest') {
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sortBy === 'title') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'displayOrder') {
      items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json(new ApiResponse(200, {
      gallery: paginatedItems,
      total,
      page: pageNum,
      totalPages
    }, 'Gallery items retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req, res, next) => {
  try {
    const body = req.body;
    const newItem = {
      _id: `gal-${Date.now()}`,
      id: `gal-${Date.now()}`,
      type: body.type || 'image',
      title: body.title,
      description: body.description || '',
      category: body.category || 'Weddings',
      imageUrl: body.imageUrl || body.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
      videoUrl: body.videoUrl || '',
      videoType: body.videoType || 'youtube',
      thumbnail: body.thumbnail || body.imageUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
      featured: Boolean(body.featured),
      displayOrder: Number(body.displayOrder) || inMemoryGallery.length + 1,
      status: body.status || 'Active',
      createdAt: new Date().toISOString()
    };

    try {
      await Gallery.create(newItem);
    } catch (e) {
      // Fallback
    }
    inMemoryGallery.unshift(newItem);

    return res.status(201).json(new ApiResponse(201, newItem, 'Gallery item added successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    let updated = null;
    try {
      updated = await Gallery.findByIdAndUpdate(id, body, { new: true }).lean();
    } catch (e) {
      updated = null;
    }

    const index = inMemoryGallery.findIndex(g => g._id === id || g.id === id);
    if (index !== -1) {
      inMemoryGallery[index] = { ...inMemoryGallery[index], ...body, updatedAt: new Date().toISOString() };
      updated = inMemoryGallery[index];
    }

    if (!updated) {
      return res.status(404).json(new ApiResponse(404, null, 'Gallery item not found'));
    }

    return res.status(200).json(new ApiResponse(200, updated, 'Gallery item updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Gallery.findByIdAndDelete(id);
    } catch (e) {
      // Fallback
    }
    inMemoryGallery = inMemoryGallery.filter(g => g._id !== id && g.id !== id);

    return res.status(200).json(new ApiResponse(200, { id }, 'Gallery item deleted successfully'));
  } catch (error) {
    next(error);
  }
};
