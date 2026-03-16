const { spawn } = require('child_process');
const path = require('path');

/**
 * Get mattress recommendation from ML model
 */
exports.getMattressRecommendation = async (req, res) => {
  try {
    const { weight, position, firmness, backPain } = req.body;

    // Validate input
    if (!weight || !position || !firmness || backPain === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: weight, position, firmness, backPain'
      });
    }

    // Call Python ML model
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../ml/mattress_recommendation_api.py'),
      JSON.stringify({
        weight,
        position,
        firmness,
        backPain
      })
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python ML Error:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'Error processing recommendation',
          error: errorOutput
        });
      }

      try {
        const result = JSON.parse(output);
        res.json({
          success: true,
          data: result
        });
      } catch (parseError) {
        console.error('Parse Error:', parseError, 'Output:', output);
        res.status(500).json({
          success: false,
          message: 'Error parsing ML response',
          error: parseError.message
        });
      }
    });
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendation',
      error: error.message
    });
  }
};

/**
 * Get mattress profiles and ML info
 */
exports.getMattressProfiles = (req, res) => {
  try {
    const profiles = {
      'Orthopedic Memory Foam': {
        ideal_weight: ['light', 'avg-light', 'avg-heavy'],
        ideal_position: ['side', 'back'],
        ideal_firmness: ['medium-soft', 'medium'],
        back_pain_benefit: true,
        description: 'Best for pressure relief and spinal support'
      },
      'Firm Hybrid Support': {
        ideal_weight: ['avg-heavy', 'heavy'],
        ideal_position: ['back', 'stomach'],
        ideal_firmness: ['firm', 'extra-firm'],
        back_pain_benefit: true,
        description: 'Maximum support for heavier sleepers'
      },
      'Soft Gel Cooling': {
        ideal_weight: ['light', 'avg-light'],
        ideal_position: ['side'],
        ideal_firmness: ['soft', 'medium-soft'],
        back_pain_benefit: false,
        description: 'Cooling technology for side sleepers'
      },
      'Latex Natural Support': {
        ideal_weight: ['light', 'avg-light', 'avg-heavy'],
        ideal_position: ['back', 'side'],
        ideal_firmness: ['medium', 'medium-firm'],
        back_pain_benefit: false,
        description: 'Balanced support with hypoallergenic properties'
      },
      'Spring Comfort Classic': {
        ideal_weight: ['heavy'],
        ideal_position: ['back', 'stomach'],
        ideal_firmness: ['firm'],
        back_pain_benefit: false,
        description: 'Excellent airflow for heavy weight sleepers'
      }
    };

    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message
    });
  }
};
