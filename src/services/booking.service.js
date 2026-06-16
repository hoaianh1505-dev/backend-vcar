import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * Creates a rental booking request for a user.
 * @param {string} userId 
 * @param {string} carId 
 * @param {Date} rentalDate 
 * @returns {Promise<Object>} Created booking document
 */
export const createBooking = async (userId, carId, rentalDate) => {
  const car = await Car.findById(carId);
  if (!car) {
    throw new AppError('Car not found', 404);
  }

  if (!car.available) {
    throw new AppError('Car is not available for rental', 400);
  }

  const booking = await Booking.create({
    userId,
    carId,
    rentalDate,
    status: 'pending',
  });

  return booking;
};

/**
 * Retrieves bookings of a specific user.
 * @param {string} userId 
 * @returns {Promise<Object[]>} List of bookings with car details populated
 */
export const getMyBookings = async (userId) => {
  return Booking.find({ userId })
    .populate('carId')
    .sort({ createdAt: -1 });
};

/**
 * Retrieves all bookings (Admin only).
 * @returns {Promise<Object[]>} List of all bookings populated with user and car details
 */
export const getAllBookings = async () => {
  return Booking.find()
    .populate('userId', 'fullName email phone')
    .populate('carId')
    .sort({ createdAt: -1 });
};

/**
 * Approves a pending booking. Marks the booked car as unavailable.
 * @param {string} bookingId 
 * @returns {Promise<Object>} Updated booking document
 */
export const approveBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status === 'approved') {
    throw new AppError('Booking is already approved', 400);
  }

  booking.status = 'approved';
  await booking.save();

  // Mark the car as currently rented / unavailable
  await Car.findByIdAndUpdate(booking.carId, { available: false });

  return booking;
};

/**
 * Cancels a booking request. Re-enables car availability if it was previously approved.
 * @param {string} bookingId 
 * @returns {Promise<Object>} Updated booking document
 */
export const cancelBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status === 'cancelled') {
    throw new AppError('Booking is already cancelled', 400);
  }

  const previousStatus = booking.status;
  booking.status = 'cancelled';
  await booking.save();

  // If approved before, return car back to available pool
  if (previousStatus === 'approved') {
    await Car.findByIdAndUpdate(booking.carId, { available: true });
  }

  return booking;
};

/**
 * Automatically cancels pending bookings that have been created more than 24 hours ago,
 * or whose rental start date has already passed.
 */
export const autoCancelExpiredBookings = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();
    
    // Find bookings that are 'pending' and either:
    // 1. Created more than 24 hours ago
    // 2. The rental date has already passed
    const expiredBookings = await Booking.find({
      status: 'pending',
      $or: [
        { createdAt: { $lt: oneDayAgo } },
        { rentalDate: { $lt: now } }
      ]
    });

    if (expiredBookings.length > 0) {
      const ids = expiredBookings.map(b => b._id);
      await Booking.updateMany(
        { _id: { $in: ids } },
        { $set: { status: 'cancelled' } }
      );
      console.log(`[Auto-Cancel] Automatically cancelled ${expiredBookings.length} expired pending bookings: ${ids.join(', ')}`);
    }
  } catch (error) {
    console.error('[Auto-Cancel Error] Failed to run auto-cancel job:', error.message);
  }
};
