import { ApiError } from '../utils/apiError.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied. Role '${req.user?.role || 'Guest'}' is not authorized to access this resource.`));
    }
    next();
  };
};
