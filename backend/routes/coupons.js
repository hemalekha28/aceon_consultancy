const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// Get active coupons for users
router.get('/active', async (req, res) => {
    try {
        const coupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: new Date() }
        }).sort({ expiryDate: 1 });
        res.json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all coupons (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, count: coupons.length, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new coupon (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get a single coupon by code - No authentication required
router.get('/validate/:code', async (req, res) => {
    try {
        const coupon = await Coupon.findOne({
            code: req.params.code.toUpperCase(),
            isActive: true,
            expiryDate: { $gt: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        res.json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minPurchase: coupon.minPurchase
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update a coupon (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.json({ success: true, data: coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete a coupon (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
