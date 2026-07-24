import { body } from 'express-validator';

export const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('message').trim().notEmpty().withMessage('Message content is required')
];
