import { body } from 'express-validator';
import { validateResult } from '../middlewares/validator.middleware.js';

export const validateCreateBooking = [
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid Car ID format'),
  body('rentalDate')
    .notEmpty().withMessage('Rental date is required')
    .isISO8601().withMessage('Rental date must be a valid ISO8601 date format (e.g. YYYY-MM-DD)'),
  body('fullName')
    .notEmpty().withMessage('Full name is required'),
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required'),
  body('licenseNumber')
    .notEmpty().withMessage('Driver\'s license number is required')
    .matches(/^[0-9]{12}$/).withMessage('Số GPLX không hợp lệ. Vui lòng nhập đúng 12 chữ số.'),
  body('address')
    .notEmpty().withMessage('Address is required'),
  validateResult
];
