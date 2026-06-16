import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { validateCreateBooking } from '../validators/booking.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all booking routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: User booking management APIs
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking request for a car
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *               - rentalDate
 *             properties:
 *               carId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *               rentalDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-20T09:00:00.000Z"
 *     responses:
 *       201:
 *         description: Booking request created successfully
 *       400:
 *         description: Validation error or car unavailable
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Car not found
 */
router.post('/', validateCreateBooking, bookingController.createBooking);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Retrieve booking history for the current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bookings history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', bookingController.getMyBookings);

export default router;
