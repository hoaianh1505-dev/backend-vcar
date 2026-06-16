import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user or admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Do Hoai Anh
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *                 example: user
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already registered
 */
router.post('/register', validateRegister, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user or admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validateLogin, authController.login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, authController.getProfile);

export default router;
