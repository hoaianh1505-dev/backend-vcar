import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../middlewares/error.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generates a signed JWT for a given user ID.
 * @param {string} userId 
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Registers a new user. Throws error if email is already in use.
 * @param {Object} userData 
 * @returns {Promise<Object>} Created user and JWT token
 */
export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email is already registered', 400);
  }

  const user = await User.create(userData);
  
  const userResponse = user.toObject();
  delete userResponse.password;
  
  const token = generateToken(user._id);

  return { user: userResponse, token };
};

/**
 * Validates credentials and logs in user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Logged in user details and JWT token
 */
export const loginUser = async (email, password) => {
  // Fetch user, explicitly select password since it has select: false
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

/**
 * Fetches user profile.
 * @param {string} userId 
 * @returns {Promise<Object>} User profile object
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
