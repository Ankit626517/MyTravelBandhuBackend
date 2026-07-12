const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, verifyOTP, getAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

// Input validation schemas
const registerSchema = {
  name: { type: 'string', required: true, min: 2, max: 50 },
  email: { type: 'string', required: true, format: 'email' },
  password: { type: 'string', required: true, min: 6, max: 100 }
};

const loginSchema = {
  email: { type: 'string', required: true, format: 'email' },
  password: { type: 'string', required: true, min: 6, max: 100 }
};

const verifyOtpSchema = {
  email: { type: 'string', required: true, format: 'email' },
  otp: { type: 'string', required: true, format: 'otp' }
};

router.post('/register', validate(registerSchema), registerAdmin);
router.post('/login', authLimiter, validate(loginSchema), loginAdmin);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOTP);
router.get('/profile', protect, getAdminProfile);

module.exports = router;
