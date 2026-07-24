import { Team } from '../models/Team.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

const mockMembers = [
  {
    _id: 't1',
    name: 'Ranveer Singh Rathore',
    role: 'Executive Master Chef',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    bio: 'With over 22 years of experience heading five-star hotel kitchens and culinary shows, Ranveer brings unmatched taste precision to every event.',
    socials: { linkedin: '#', instagram: '#' }
  },
  {
    _id: 't2',
    name: 'Sanjay Dubey',
    role: 'Master Tandoor & Kebab Specialist',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80',
    bio: 'Sanjay is a virtuoso of fire and smoke. He has spent 15 years perfecting tandoor roasting, yielding silky paneers and crackling naans.',
    socials: { linkedin: '#', instagram: '#' }
  },
  {
    _id: 't3',
    name: 'Meera Nair',
    role: 'Head of Operations & Logistics',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'Meera manages the seamless logistical flow of staff, transport, traditional utensils and setups across every event.',
    socials: { linkedin: '#', instagram: '#' }
  },
  {
    _id: 't4',
    name: 'Ananya Bhatia',
    role: 'Guest Experience & Decor Lead',
    image: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?auto=format&fit=crop&w=400&q=80',
    bio: 'Ananya serves as your dedicated wedding menu stylist. She shapes brassware layouts and floral installations.',
    socials: { linkedin: '#', instagram: '#' }
  }
];

export const getTeam = async (req, res, next) => {
  try {
    let members = await Team.find().catch(() => []);
    if (!members.length) members = mockMembers;
    return res.status(200).json(new ApiResponse(200, members, 'Team members retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (req, res, next) => {
  try {
    const member = await Team.create(req.body);
    return res.status(201).json(new ApiResponse(201, member, 'Team member created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Team.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return next(new ApiError(404, 'Team member not found'));
    return res.status(200).json(new ApiResponse(200, updated, 'Team member updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Team.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, { id }, 'Team member deleted successfully'));
  } catch (error) {
    next(error);
  }
};
