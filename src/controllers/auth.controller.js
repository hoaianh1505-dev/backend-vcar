import * as authService from '../services/auth.service.js';

/**
 * Handle user registration request
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const result = await authService.registerUser({ fullName, email, phone, password, role });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user/admin login request
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle fetching user profile request
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is set by authentication middleware
    const userId = req.user.id;
    const profile = await authService.getUserProfile(userId);
    
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
