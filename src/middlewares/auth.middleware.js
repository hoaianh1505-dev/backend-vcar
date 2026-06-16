import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Protect routes by verifying JWT signature.
 * Attaches decoded user to the request object.
 */
export const protect = async (req, res, next) => {
  let token;

  // Read JWT from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify if user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return next(error); // Formatted in global error middleware
  }
};

/**
 * Restricts access to specific roles (e.g. 'admin').
 * @param {...string} roles Authorized roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
export const adminOnly = authorize('admin');
