import * as bookingService from '../services/booking.service.js';

/**
 * Handle listing all bookings across the application (Admin only)
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle approving a user booking request (Admin only)
 */
export const approveBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.approveBooking(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle cancelling a user booking request (Admin only)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
