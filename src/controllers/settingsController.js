import { Settings } from '../models/Settings.js';
import { ApiResponse } from '../utils/apiResponse.js';

let mockSettings = {
  companyName: 'Eveng Catering',
  companyEmail: 'concierge@evengcatering.com',
  companyPhone: '+1 (800) 555-2283',
  companyAddress: '90210 Gourmet Row, Suite A, Beverly Hills, CA 90210',
  taxRate: 8.5,
  bookingDepositPercentage: 25,
  notificationsEnabled: true,
  autoReplyEnabled: true
};

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne().catch(() => null);
    if (!settings) settings = mockSettings;
    return res.status(200).json(new ApiResponse(200, settings, 'Application settings retrieved'));
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const payload = req.body;
    let settings = await Settings.findOneAndUpdate({}, payload, { new: true, upsert: true }).catch(() => null);
    if (!settings) {
      mockSettings = { ...mockSettings, ...payload };
      settings = mockSettings;
    }
    return res.status(200).json(new ApiResponse(200, settings, 'Application settings updated successfully'));
  } catch (error) {
    next(error);
  }
};
