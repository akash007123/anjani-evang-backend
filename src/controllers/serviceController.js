import { Service } from '../models/Service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

const mockServices = [
  {
    _id: 's-1',
    title: 'Royal Wedding Banquets',
    slug: 'royal-wedding-banquets',
    shortDescription: 'Multi-course luxury wedding feasts tailored for unforgettable celebrations.',
    pricePerGuest: 145,
    category: 'Weddings',
    featured: true,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'
  },
  {
    _id: 's-2',
    title: 'Corporate Executive Galas',
    slug: 'corporate-executive-galas',
    shortDescription: 'Sophisticated corporate dinings, product launches, and annual summits.',
    pricePerGuest: 120,
    category: 'Corporate',
    featured: true,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
  }
];

export const getServices = async (req, res, next) => {
  try {
    let services = await Service.find().catch(() => []);
    if (!services.length) services = mockServices;
    return res.status(200).json(new ApiResponse(200, services, 'Services retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let service = await Service.findOne({ slug }).catch(() => null);
    if (!service) service = mockServices.find(s => s.slug === slug);
    if (!service) return next(new ApiError(404, 'Service not found'));
    return res.status(200).json(new ApiResponse(200, service, 'Service details retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    return res.status(201).json(new ApiResponse(201, service, 'Service created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return next(new ApiError(404, 'Service not found'));
    return res.status(200).json(new ApiResponse(200, updated, 'Service updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, { id }, 'Service deleted successfully'));
  } catch (error) {
    next(error);
  }
};
