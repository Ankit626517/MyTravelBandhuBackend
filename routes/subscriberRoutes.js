const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  getSubscribers,
  unsubscribeNewsletter
} = require('../controllers/subscriberController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/subscribe', subscribeNewsletter);
router.delete('/unsubscribe', unsubscribeNewsletter);

// Admin endpoint
router.get('/subscribers', protect, admin, getSubscribers);

module.exports = router;
