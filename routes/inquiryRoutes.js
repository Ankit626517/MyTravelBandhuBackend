const express = require('express');
const router = express.Router();
const { 
  createQuoteInquiry, 
  createContactInquiry, 
  getInquiries, 
  updateInquiryStatus 
} = require('../controllers/inquiryController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Input validation schemas
const quoteSchema = {
  name: { type: 'string', required: true, min: 2, max: 50 },
  email: { type: 'string', required: true, format: 'email' },
  phone: { type: 'string', required: true, format: 'phone' },
  destination: { type: 'string', required: true, min: 2, max: 100 },
  travelDate: { type: 'string', required: true },
  packageType: { type: 'string', required: true },
  guests: { required: true },
  notes: { type: 'string', required: false, max: 1000 }
};

const contactSchema = {
  name: { type: 'string', required: true, min: 2, max: 50 },
  email: { type: 'string', required: true, format: 'email' },
  phone: { type: 'string', required: true, format: 'phone' },
  subject: { type: 'string', required: true, min: 2, max: 150 },
  message: { type: 'string', required: true, min: 10, max: 2000 }
};

// Public form submissions
router.post('/quote', validate(quoteSchema), createQuoteInquiry);
router.post('/contact', validate(contactSchema), createContactInquiry);

// Admin actions
router.get('/', protect, admin, getInquiries);
router.put('/:id', protect, admin, updateInquiryStatus);

module.exports = router;
