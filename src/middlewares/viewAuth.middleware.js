import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * View-specific JWT protector middleware.
 * Verifies cookie JWT and checks role. Redirects to /login on failure.
 */
export const protectView = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser || currentUser.role !== 'admin') {
      res.clearCookie('token');
      return res.redirect('/login?error=Access denied. Admin access only.');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login?error=Session expired. Please log in again.');
  }
};

/**
 * Redirects logged in users away from the login page back to the dashboard.
 */
export const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (error) {
      res.clearCookie('token');
    }
  }
  next();
};
