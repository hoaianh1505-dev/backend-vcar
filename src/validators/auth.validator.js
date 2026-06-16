import { body } from 'express-validator';
import { validateResult } from '../middlewares/validator.middleware.js';

export const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .custom(v => v === 'admin' || /^\S+@\S+\.\S+$/.test(v)).withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{9,15}$/).withMessage('Please provide a valid phone number (9 to 15 digits)'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  validateResult
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .custom(v => v === 'admin' || /^\S+@\S+\.\S+$/.test(v)).withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validateResult
];
