const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// User actions (must be logged in)
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

// Admin actions
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;
