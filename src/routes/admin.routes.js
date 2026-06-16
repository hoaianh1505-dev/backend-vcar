import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply auth protection & admin-only checks to all routes in this file
router.use(protect);
router.use(adminOnly);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin booking administration APIs
 */

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/bookings', adminController.getAllBookings);

/**
 * @swagger
 * /admin/bookings/{id}/approve:
 *   patch:
 *     summary: Approve a booking request (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking request unique ID
 *     responses:
 *       200:
 *         description: Booking approved successfully
 *       400:
 *         description: Booking already approved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Booking not found
 */
router.patch('/bookings/:id/approve', adminController.approveBooking);

/**
 * @swagger
 * /admin/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel/reject a booking request (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking request unique ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking already cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Booking not found
 */
router.patch('/bookings/:id/cancel', adminController.cancelBooking);

export default router;
