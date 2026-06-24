import * as aiService from '../services/ai.service.js';

/**
 * Handle AI recommendation requests
 */
export const getCarRecommendation = async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query string is required'
      });
    }

    const result = await aiService.getRecommendation(query);

    res.status(200).json({
      success: true,
      data: {
        recommendation: result.recommendation,
        recommendedCars: result.recommendedCars
      }
    });
  } catch (error) {
    next(error);
  }
};
