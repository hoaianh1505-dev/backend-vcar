import * as bookingService from '../services/booking.service.js';

/**
 * Handle booking request submission
 */
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { carId, rentalDate } = req.body;
    
    const booking = await bookingService.createBooking(userId, carId, rentalDate);
    
    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle listing bookings belonging to the currently logged in user
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await bookingService.getMyBookings(userId);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
