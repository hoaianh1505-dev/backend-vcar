import { Router } from 'express';
import authRoutes from './auth.routes.js';
import carRoutes from './car.routes.js';
import bookingRoutes from './booking.routes.js';
import adminRoutes from './admin.routes.js';
import viewRoutes from './view.routes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Car Rental API is running smoothly' });
});

// Bind sub-routers
router.use('/auth', authRoutes);
router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

// Bind EJS view routes
router.use('/', viewRoutes);

export default router;
