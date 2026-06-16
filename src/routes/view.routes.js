import { Router } from 'express';
import * as viewController from '../controllers/view.controller.js';
import { protectView, redirectIfLoggedIn } from '../middlewares/viewAuth.middleware.js';
import { uploadCarImages } from '../middlewares/upload.middleware.js';

const router = Router();

// Authentication view routes
router.get('/login', redirectIfLoggedIn, viewController.renderLogin);
router.post('/login', redirectIfLoggedIn, viewController.handleLogin);
router.get('/logout', viewController.handleLogout);

// Authenticated admin view routes
router.get('/dashboard', protectView, viewController.renderDashboard);

// Fleet CRUD form action routes
router.post('/dashboard/cars', protectView, uploadCarImages, viewController.handleCreateCar);
router.post('/dashboard/cars/:id/edit', protectView, uploadCarImages, viewController.handleUpdateCar);
router.get('/dashboard/cars/:id/delete', protectView, viewController.handleDeleteCar);

// Booking actions view routes
router.get('/dashboard/bookings/:id/approve', protectView, viewController.handleApproveBooking);
router.get('/dashboard/bookings/:id/cancel', protectView, viewController.handleCancelBooking);

// Root redirect helper
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

export default router;
