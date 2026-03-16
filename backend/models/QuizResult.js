const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  answers: {
    position: String,
    weight: String,
    partner: String,
    firmness: String,
    pain: String,
    budget: String
  },
  recommendedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
