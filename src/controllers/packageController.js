import { Package } from '../models/Package.js';
import { ApiResponse } from '../utils/apiResponse.js';

let inMemoryPackages = [
  {
    _id: 'pkg-1',
    id: 'pkg-1',
    name: 'Shehnai Silver Heritage Feast',
    description: 'Designed for intimate engagements, anniversary feasts, and warm family receptions with live stations.',
    price: 999,
    minGuests: 50,
    maxGuests: 300,
    includedServices: ['Live Chaat Counter', 'Silver Chafing Service', 'Dedicated Uniformed Waiters', 'Basic Floral Buffet Decor'],
    includedDishes: ['2 Welcome Drinks', '4 Starters', '1 Live Counter', '4 Main Course Curries', '2 Dal & Rice', '3 Assorted Breads', '2 Royal Desserts'],
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
    popular: false,
    featured: true,
    status: 'Active',
    createdAt: new Date('2026-06-01').toISOString()
  },
  {
    _id: 'pkg-2',
    id: 'pkg-2',
    name: 'Royal Gold Heritage Wedding Buffet',
    description: 'Our most sought-after luxury banqueting experience for grand Indian weddings and opulent receptions.',
    price: 1899,
    minGuests: 150,
    maxGuests: 1500,
    includedServices: ['Master Sommelier Mocktail Bar', 'Interactive Live Counters', 'Custom Thematic Buffet Styling', 'VIP Plated Service Staff'],
    includedDishes: ['4 Welcome Drinks & Mocktails', '6 Gourmet Starters', '3 Live Counters', '6 Main Course Curries', '3 Basmati Specials', '4 Indian Breads', '4 Decadent Sweets & Ice Cream'],
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
    popular: true,
    featured: true,
    status: 'Active',
    createdAt: new Date('2026-06-10').toISOString()
  },
  {
    _id: 'pkg-3',
    id: 'pkg-3',
    name: 'Maharaja Platinum Seated Dining',
    description: 'Unrivalled 7-course ultra-luxury silver-service sit-down dinner with dedicated culinary concierges.',
    price: 2999,
    minGuests: 25,
    maxGuests: 200,
    includedServices: ['7-Course Silver Table Plating', 'Personal Master Chef at Table', 'Handcrafted Custom Menu Cards', '24k Gold & Silver Edible Accents'],
    includedDishes: ['Unlimited Signature Amuse-Bouche', '8 Chef-Curated Starters', '4 Live Table Demonstrations', '8 Main Course Masterpieces', '5 Premium Desserts & Exotic Fruit Carving'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80',
    popular: true,
    featured: true,
    status: 'Active',
    createdAt: new Date('2026-06-15').toISOString()
  },
  {
    _id: 'pkg-4',
    id: 'pkg-4',
    name: 'Elite Corporate Gala & Summit Package',
    description: 'Tailored for high-impact international corporate summits, product launches, and executive galas.',
    price: 1450,
    minGuests: 100,
    maxGuests: 2000,
    includedServices: ['High-Speed Bento Box Option', 'Barista Coffee & Tea Station', 'Dietary-Segregated Stations (Jain/Vegan/GF)', 'Elegantly Uniformed Staff'],
    includedDishes: ['3 Artisan Mocktails', '5 Global Tapas & Starters', '2 Live Stir-Fry Counters', '5 Fusion Main Course Options', '3 Gourmet Pastries & Desserts'],
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80',
    popular: false,
    featured: false,
    status: 'Active',
    createdAt: new Date('2026-07-01').toISOString()
  }
];

export const getPackages = async (req, res, next) => {
  try {
    const { search, status, featured, popular, sortBy = 'latest', page = 1, limit = 10 } = req.query;

    let items = [];
    try {
      items = await Package.find().lean();
    } catch (e) {
      items = [];
    }
    if (!items || items.length === 0) {
      items = [...inMemoryPackages];
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'All') {
      items = items.filter(p => p.status === status);
    }

    if (featured !== undefined && featured !== '') {
      items = items.filter(p => Boolean(p.featured) === (String(featured) === 'true'));
    }

    if (popular !== undefined && popular !== '') {
      items = items.filter(p => Boolean(p.popular) === (String(popular) === 'true'));
    }

    if (sortBy === 'latest') {
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sortBy === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price') {
      items.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json(new ApiResponse(200, {
      packages: paginatedItems,
      total,
      page: pageNum,
      totalPages
    }, 'Packages retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let pkg = null;
    try {
      pkg = await Package.findById(id).lean();
    } catch (e) {
      pkg = null;
    }
    if (!pkg) {
      pkg = inMemoryPackages.find(p => p._id === id || p.id === id);
    }
    if (!pkg) {
      return res.status(404).json(new ApiResponse(404, null, 'Package not found'));
    }
    return res.status(200).json(new ApiResponse(200, pkg, 'Package retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const body = req.body;
    const newPkg = {
      _id: `pkg-${Date.now()}`,
      id: `pkg-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      price: Number(body.price) || 999,
      minGuests: Number(body.minGuests) || 25,
      maxGuests: Number(body.maxGuests) || 1000,
      includedServices: body.includedServices ? (Array.isArray(body.includedServices) ? body.includedServices : body.includedServices.split(',').map(s => s.trim())) : [],
      includedDishes: body.includedDishes ? (Array.isArray(body.includedDishes) ? body.includedDishes : body.includedDishes.split(',').map(d => d.trim())) : [],
      image: body.image || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
      popular: Boolean(body.popular),
      featured: Boolean(body.featured),
      status: body.status || 'Active',
      createdAt: new Date().toISOString()
    };

    try {
      await Package.create(newPkg);
    } catch (e) {
      // Fallback
    }
    inMemoryPackages.unshift(newPkg);

    return res.status(201).json(new ApiResponse(201, newPkg, 'Package created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    let updated = null;
    try {
      updated = await Package.findByIdAndUpdate(id, body, { new: true }).lean();
    } catch (e) {
      updated = null;
    }

    const index = inMemoryPackages.findIndex(p => p._id === id || p.id === id);
    if (index !== -1) {
      inMemoryPackages[index] = { ...inMemoryPackages[index], ...body, updatedAt: new Date().toISOString() };
      updated = inMemoryPackages[index];
    }

    if (!updated) {
      return res.status(404).json(new ApiResponse(404, null, 'Package not found'));
    }

    return res.status(200).json(new ApiResponse(200, updated, 'Package updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Package.findByIdAndDelete(id);
    } catch (e) {
      // Fallback
    }
    inMemoryPackages = inMemoryPackages.filter(p => p._id !== id && p.id !== id);

    return res.status(200).json(new ApiResponse(200, { id }, 'Package deleted successfully'));
  } catch (error) {
    next(error);
  }
};
