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

  // Enforce a limit of at most 1 active (pending or approved) booking per user
  const activeBooking = await Booking.findOne({
    userId,
    status: { $in: ['pending', 'approved'] }
  });

  if (activeBooking) {
    throw new AppError('Mỗi tài khoản chỉ được phép đặt xe 1 ngày (1 lượt thuê) tại một thời điểm. Vui lòng hoàn thành hoặc hủy lịch đặt xe hiện tại trước khi tạo lịch mới.', 400);
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
 * Automatically cancels/deletes bookings that have been created or rented more than 24 hours ago,
 * and restores their associated cars to available status so other users can rent them.
 */
export const autoCancelExpiredBookings = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find any bookings where the creation time or rental date is more than 24 hours in the past.
    // This covers both pending and approved bookings that have completed their 1-day lease or confirmation window.
    const expiredBookings = await Booking.find({
      $or: [
        { createdAt: { $lt: oneDayAgo } },
        { rentalDate: { $lt: oneDayAgo } }
      ]
    });

    if (expiredBookings.length > 0) {
      const bookingIds = expiredBookings.map(b => b._id);
      const carIds = expiredBookings.map(b => b.carId);

      // Remove the booking documents from database
      await Booking.deleteMany({ _id: { $in: bookingIds } });

      // Reset the associated cars to available
      await Car.updateMany(
        { _id: { $in: carIds } },
        { $set: { available: true } }
      );

      console.log(`[Auto-Cleanup] Successfully deleted ${expiredBookings.length} expired bookings (IDs: ${bookingIds.join(', ')}) and restored their cars (IDs: ${carIds.join(', ')}) to available status.`);
    }
  } catch (error) {
    console.error('[Auto-Cleanup Error] Failed to run database cleanup job:', error.message);
  }
};
