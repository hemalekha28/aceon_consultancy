const express = require('express');
const { getMattressRecommendation, getMattressProfiles } = require('../controllers/mlController');
const QuizResult = require('../models/QuizResult');
const Product = require('../models/Product');
const { protect } = require('../middlewares/auth');

const router = express.Router();

/**
 * POST /ml/recommend
 * Get mattress recommendation based on user profile
 * Body: { weight, position, firmness, backPain }
 */
router.post('/recommend', getMattressRecommendation);

/**
 * GET /ml/profiles
 * Get all mattress profiles and their ideal conditions
 */
router.get('/profiles', getMattressProfiles);

/**
 * POST /api/ml/save-quiz
 * Save quiz results for analytics
 */
router.post('/save-quiz', async (req, res) => {
  try {
    const { answers, recommendedProductId, userId } = req.body;
    
    const result = new QuizResult({
      user: userId || null,
      answers,
      recommendedProduct: recommendedProductId
    });

    await result.save();
    res.json({ success: true, message: 'Quiz results saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/ml/recommendations/:id
 * Get smart cross-selling recommendations
 */
router.get('/recommendations/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let recommended = [];

    // Simple logic: if mattress, recommend accessories (pillows, sheets, etc. - in this DB categories are mattress types mostly)
    // For this project, we might just recommend other categories or top rated items
    if (['latex', 'coir', 'memory-foam', 'softy-foam', 'spring'].includes(product.category)) {
      // Find products in different categories or specifically accessories if they exist
      // Since we only have mattress categories in enum, let's recommend top products from other categories
      recommended = await Product.find({ 
        category: { $ne: product.category },
        _id: { $ne: product._id }
      }).limit(4);
    } else {
      recommended = await Product.find({ _id: { $ne: product._id } }).limit(4);
    }

    res.json({ success: true, data: recommended });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
