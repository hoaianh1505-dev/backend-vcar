import { Router } from 'express';
import * as carController from '../controllers/car.controller.js';
import { validateCar, validateCarUpdate } from '../validators/car.validator.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { uploadCarImages } from '../middlewares/upload.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car listings management APIs
 */

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Retrieve a list of cars
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter cars by availability
 *     responses:
 *       200:
 *         description: List of cars retrieved successfully
 */
router.get('/', carController.getCars);

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get car details by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the car
 *     responses:
 *       200:
 *         description: Car details retrieved successfully
 *       404:
 *         description: Car not found
 */
router.get('/:id', carController.getCarById);

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car listing (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - brand
 *               - year
 *               - pricePerDay
 *               - description
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: Civic
 *               brand:
 *                 type: string
 *                 example: Honda
 *               year:
 *                 type: integer
 *                 example: 2023
 *               pricePerDay:
 *                 type: number
 *                 example: 50.5
 *               description:
 *                 type: string
 *                 example: Fuel-efficient and reliable sedan.
 *               location:
 *                 type: string
 *                 example: Hanoi
 *               available:
 *                 type: boolean
 *                 example: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Car created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post('/', protect, adminOnly, uploadCarImages, validateCar, carController.createCar);

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update an existing car listing (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the car
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Civic updated
 *               brand:
 *                 type: string
 *                 example: Honda
 *               year:
 *                 type: integer
 *                 example: 2024
 *               pricePerDay:
 *                 type: number
 *                 example: 55.0
 *               description:
 *                 type: string
 *                 example: Updated description
 *               location:
 *                 type: string
 *                 example: Hanoi
 *               available:
 *                 type: boolean
 *                 example: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Car not found
 */
router.put('/:id', protect, adminOnly, uploadCarImages, validateCarUpdate, carController.updateCar);

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete a car listing (Admin only)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the car
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Car not found
 */
router.delete('/:id', protect, adminOnly, carController.deleteCar);

export default router;
