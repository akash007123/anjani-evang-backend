import { body } from 'express-validator';

export const bookingValidation = [
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Mobile phone number is required'),
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('eventDate').notEmpty().withMessage('Event date is required'),
  body('guestCount').isNumeric().withMessage('Guest count must be a positive number'),
  body('venueAddress').notEmpty().withMessage('Venue address is required')
];
