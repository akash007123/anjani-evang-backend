import { Service } from '../models/Service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find().lean();
    return res.status(200).json(new ApiResponse(200, services, 'Services retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const service = await Service.findOne({ slug }).lean();
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
