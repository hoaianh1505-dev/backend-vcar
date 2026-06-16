import { validationResult } from 'express-validator';
import { AppError } from './error.middleware.js';

export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => `${err.msg}`);
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  next();
};
