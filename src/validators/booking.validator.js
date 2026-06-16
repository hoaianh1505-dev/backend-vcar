import { body } from 'express-validator';
import { validateResult } from '../middlewares/validator.middleware.js';

export const validateCreateBooking = [
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid Car ID format'),
  body('rentalDate')
    .notEmpty().withMessage('Rental date is required')
    .isISO8601().withMessage('Rental date must be a valid ISO8601 date format (e.g. YYYY-MM-DD)'),
  validateResult
];
