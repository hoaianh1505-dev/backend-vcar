import { body } from 'express-validator';
import { validateResult } from '../middlewares/validator.middleware.js';

export const validateCar = [
  body('name')
    .trim()
    .notEmpty().withMessage('Car name is required'),
  body('brand')
    .trim()
    .notEmpty().withMessage('Car brand is required'),
  body('year')
    .notEmpty().withMessage('Manufacturing year is required')
    .isInt({ min: 1886, max: new Date().getFullYear() + 2 }).withMessage('Please provide a valid manufacturing year'),
  body('pricePerDay')
    .notEmpty().withMessage('Price per day is required')
    .isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('available')
    .optional()
    .isBoolean().withMessage('Available must be a boolean')
    .customSanitizer(val => val === 'true' || val === true),
  validateResult
];

export const validateCarUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Car name cannot be empty'),
  body('brand')
    .optional()
    .trim()
    .notEmpty().withMessage('Car brand cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 1886, max: new Date().getFullYear() + 2 }).withMessage('Please provide a valid manufacturing year'),
  body('pricePerDay')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty'),
  body('location')
    .optional()
    .trim()
    .notEmpty().withMessage('Location cannot be empty'),
  body('available')
    .optional()
    .customSanitizer(val => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return val;
    })
    .isBoolean().withMessage('Available must be a boolean'),
  validateResult
];
