import { Project } from '../models/Project.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

const mockProjects = [
  {
    _id: 'pr1',
    title: 'Royal Palace Wedding Feast',
    slug: 'royal-palace-wedding-feast',
    category: 'Wedding',
    client: 'Singhania Family',
    date: '2025-12-15',
    location: 'Umaid Bhawan Palace, Jodhpur',
    guestCount: 650,
    description: 'A royal Rajasthani palace wedding featuring brassware, marigold floral decorations, and a majestic multi-tiered traditional thali feast.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
    ],
    menuServed: ['Dal Makhani', 'Laal Maas', 'Kesar Biryani', 'Gulab Jamun']
  },
  {
    _id: 'pr2',
    title: 'Tech India Annual Gala',
    slug: 'tech-india-annual-gala',
    category: 'Corporate',
    client: 'Aetheris Technology Ltd.',
    date: '2026-02-20',
    location: 'Taj Lands End, Mumbai',
    guestCount: 1200,
    description: 'A high-energy corporate gala evening with modern cocktail lounge, interactive fusion food counters, and swift buffet service.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'
    ],
    menuServed: ['Tandoori Broccoli', 'Goan Curry', 'Naan Pizza', 'Kokum Mojito']
  },
  {
    _id: 'pr3',
    title: 'Festival Diwali Milan Celebration',
    slug: 'festival-diwali-milan-celebration',
    category: 'Social',
    client: 'Aditya & Priya Birla',
    date: '2025-10-28',
    location: 'Private Bungalow, Juhu',
    guestCount: 85,
    description: 'An intimate, high-end Diwali celebration fully cooked on-site by our private chef team.',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    menuServed: ['Paan Shots', 'Chole Bhature', 'Nihari', 'Gajar Halwa']
  }
];

export const getProjects = async (req, res, next) => {
  try {
    let projects = await Project.find().catch(() => []);
    if (!projects.length) projects = mockProjects;
    return res.status(200).json(new ApiResponse(200, projects, 'Projects retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let project = await Project.findOne({ slug }).catch(() => null);
    if (!project) project = mockProjects.find(p => p.slug === slug);
    if (!project) return next(new ApiError(404, 'Project not found'));
    return res.status(200).json(new ApiResponse(200, project, 'Project details retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    return res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Project.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return next(new ApiError(404, 'Project not found'));
    return res.status(200).json(new ApiResponse(200, updated, 'Project updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, { id }, 'Project deleted successfully'));
  } catch (error) {
    next(error);
  }
};
