import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import * as authService from '../services/auth.service.js';
import * as carService from '../services/car.service.js';
import * as bookingService from '../services/booking.service.js';
import { uploadMultipleToS3 } from '../services/s3.service.js';

/**
 * Render Login view
 */
export const renderLogin = (req, res) => {
  res.render('login', {
    error: req.query.error,
    success: req.query.success
  });
};

/**
 * Handle Login credentials submit
 */
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Login user via service layer
    const result = await authService.loginUser(email, password);
    
    if (result.user.role !== 'admin') {
      return res.render('login', { error: 'Access denied. Admin access only.' });
    }

    // Set JWT as http-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect('/dashboard');
  } catch (error) {
    res.render('login', { error: error.message });
  }
};

/**
 * Render Dashboard view
 */
export const renderDashboard = async (req, res) => {
  try {
    const activeTab = req.query.tab || 'overview';
    const successMsg = req.query.success;
    const errorMsg = req.query.error;
    
    // Get stats metrics
    const cars = await Car.find();
    const bookings = await Booking.find()
      .populate('userId', 'fullName email phone')
      .populate('carId');

    const totalCars = cars.length;
    const availableCars = cars.filter(car => car.available).length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    // Build data payloads
    const payload = {
      user: req.user,
      activeTab,
      totalCars,
      availableCars,
      totalBookings,
      pendingBookings,
      success: successMsg,
      error: errorMsg,
      cars: [],
      bookings: [],
      currentFilter: 'all'
    };

    if (activeTab === 'overview') {
      payload.cars = cars;
      payload.bookings = bookings;
    } else if (activeTab === 'cars') {
      payload.cars = cars.sort((a, b) => b.createdAt - a.createdAt);
    } else if (activeTab === 'bookings') {
      const statusFilter = req.query.status || 'all';
      payload.currentFilter = statusFilter;
      
      if (statusFilter !== 'all') {
        payload.bookings = bookings.filter(b => b.status === statusFilter);
      } else {
        payload.bookings = bookings;
      }
      payload.bookings.sort((a, b) => b.createdAt - a.createdAt);
    }

    res.render('dashboard', payload);
  } catch (error) {
    res.redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle Add Car Form Submit
 */
export const handleCreateCar = async (req, res) => {
  try {
    const carData = { ...req.body };
    
    // Process image uploads
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadMultipleToS3(req.files);
      carData.images = imageUrls;
    } else {
      carData.images = [];
    }

    await carService.createCar(carData);
    res.redirect('/dashboard?tab=cars&success=Car created successfully');
  } catch (error) {
    res.redirect(`/dashboard?tab=cars&error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle Edit Car Form Submit
 */
export const handleUpdateCar = async (req, res) => {
  try {
    const carData = { ...req.body };

    // Process image uploads if provided
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadMultipleToS3(req.files);
      carData.images = imageUrls;
    }

    await carService.updateCar(req.params.id, carData);
    res.redirect('/dashboard?tab=cars&success=Car updated successfully');
  } catch (error) {
    res.redirect(`/dashboard?tab=cars&error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle Delete Car
 */
export const handleDeleteCar = async (req, res) => {
  try {
    await carService.deleteCar(req.params.id);
    res.redirect('/dashboard?tab=cars&success=Car deleted successfully');
  } catch (error) {
    res.redirect(`/dashboard?tab=cars&error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle Approve Booking request
 */
export const handleApproveBooking = async (req, res) => {
  try {
    await bookingService.approveBooking(req.params.id);
    const redirectStatus = req.query.status || 'approved';
    res.redirect(`/dashboard?tab=bookings&status=${redirectStatus}&success=Đã duyệt đơn đặt xe thành công`);
  } catch (error) {
    res.redirect(`/dashboard?tab=bookings&error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle Reject Booking request
 */
export const handleCancelBooking = async (req, res) => {
  try {
    await bookingService.cancelBooking(req.params.id);
    const redirectStatus = req.query.status || 'cancelled';
    res.redirect(`/dashboard?tab=bookings&status=${redirectStatus}&success=Đã hủy đơn đặt xe thành công`);
  } catch (error) {
    res.redirect(`/dashboard?tab=bookings&error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle Logout action
 */
export const handleLogout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login?success=Logged out successfully');
};
