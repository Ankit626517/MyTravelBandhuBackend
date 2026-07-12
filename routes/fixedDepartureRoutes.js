const express = require('express');
const router = express.Router();
const {
  getFixedDepartures,
  getFixedDepartureById,
  createFixedDeparture,
  updateFixedDeparture,
  deleteFixedDeparture
} = require('../controllers/fixedDepartureController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', getFixedDepartures);
router.get('/:id', getFixedDepartureById);

// Protected Admin endpoints
router.post('/', protect, admin, createFixedDeparture);
router.put('/:id', protect, admin, updateFixedDeparture);
router.delete('/:id', protect, admin, deleteFixedDeparture);

module.exports = router;
