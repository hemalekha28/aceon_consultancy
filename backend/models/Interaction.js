const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // session-based or guest views possible
    },
    type: {
        type: String,
        enum: ['view', 'click', 'add-to-cart', 'purchase'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sessionID: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Index for faster queries in analytics
interactionSchema.index({ type: 1, timestamp: 1 });
interactionSchema.index({ product: 1, type: 1 });

module.exports = mongoose.model('Interaction', interactionSchema);
