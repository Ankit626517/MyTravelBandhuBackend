const express = require('express');
const router = express.Router();
const {
  trackVisa,
  getAllVisaTracks,
  createVisaTrack,
  updateVisaTrack
} = require('../controllers/visaController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public tracking
router.get('/track/:receiptNumber', trackVisa);

// Admin operations
router.get('/tracks', protect, admin, getAllVisaTracks);
router.post('/tracks', protect, admin, createVisaTrack);
router.put('/tracks/:receiptNumber', protect, admin, updateVisaTrack);

module.exports = router;
