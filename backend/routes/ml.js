const express = require('express');
const { getMattressRecommendation, getMattressProfiles } = require('../controllers/mlController');

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

module.exports = router;
