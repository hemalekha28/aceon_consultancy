const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middlewares/auth');
const { sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { name, email, password, role } = req.body; // ADD role HERE

    // ADD THESE DEBUG LINES:
    console.log("📝 Registration request body:", req.body);
    console.log("🎭 Role from request:", role);
    console.log("🎭 Role to be saved:", role || 'user');

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user - ADD role here
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: role || 'user' // ADD THIS LINE
    });
    
    // ADD THIS DEBUG LINE AFTER CREATION:
    console.log("✅ User created in DB:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});
// Login User
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Forgot Password - send reset email
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond with success message to avoid email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    // Generate reset token (store hashed version in DB)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendBase}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetLink);

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending reset link'
    });
  }
});

// Reset Password - set new password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
});

// Get Current User
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        role: req.user.role
      }
    }
  });
});

// Update User Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          role: updatedUser.role
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// Google Sign-In endpoint
router.post('/google-login', async (req, res) => {
  try {
    const { email, displayName, photoURL, firebaseUID } = req.body;

    if (!email || !firebaseUID) {
      return res.status(400).json({
        success: false,
        message: 'Email and firebaseUID are required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name: displayName || email.split('@')[0],
        email,
        firebaseUID,
        photoURL,
        role: 'user',
        // No password for OAuth users
      });
      await user.save();
      console.log('✅ New user created via Google:', user._id);
    } else {
      // Update existing user with Firebase info
      user.firebaseUID = firebaseUID;
      if (displayName && !user.name.includes(displayName)) {
        user.name = displayName;
      }
      if (photoURL) {
        user.photoURL = photoURL;
      }
      await user.save();
      console.log('✅ User updated via Google:', user._id);
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google sign-in'
    });
  }
});

module.exports = router;