import { Router } from 'express';
import { 
  createBooking, getAllBookings, getBookingById, updateBooking, updateBookingStatus, deleteBooking,
  getBookingAvailability, getAvailableSlotsForDate
} from '../controllers/bookingController.js';
import { bookingValidation } from '../validators/bookingValidator.js';
import { validateRequest } from '../middlewares/validatorMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes for slot & availability lookup and booking submission
router.get('/availability', getBookingAvailability);
router.get('/slots', getAvailableSlotsForDate);
router.post('/', bookingValidation, validateRequest, createBooking);

// Protected routes for admin management
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.patch('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

export default router;
