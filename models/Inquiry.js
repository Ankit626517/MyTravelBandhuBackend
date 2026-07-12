const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quote', 'contact', 'visa'],
    required: [true, 'Inquiry type (quote, contact, or visa) is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    lowercase: true,
    trim: true,
  },
  destination: {
    type: String,
    trim: true,
  },
  travelDate: {
    type: Date,
  },
  packageType: {
    type: String,
    trim: true,
  },
  guests: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'closed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
