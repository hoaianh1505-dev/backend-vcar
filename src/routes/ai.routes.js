import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all AI assistant routes
router.use(protect);

/**
 * @swagger
 * /ai/recommend:
 *   post:
 *     summary: Get AI car recommendations based on user text query
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Tôi cần thuê xe sang trọng cho 7 người đi công tác"
 *     responses:
 *       200:
 *         description: Recommendation generated successfully
 *       400:
 *         description: Invalid query input
 *       410:
 *         description: Unauthorized
 */
router.post('/recommend', aiController.getCarRecommendation);

export default router;
