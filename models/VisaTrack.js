const mongoose = require('mongoose');

const visaTrackSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: [true, 'Receipt tracking number is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Applicant name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Visa application country is required'],
    trim: true,
  },
  stage: {
    type: Number,
    enum: [1, 2, 3, 4],
    default: 1, // 1: Received, 2: Reviewing, 3: Submitted, 4: Approved
  },
  statusText: {
    type: String,
    default: 'Document Received',
  },
  detail: {
    type: String,
    default: 'Receipt verified. We have successfully received your physical passport and photograph uploads.',
  },
}, { timestamps: true });

module.exports = mongoose.model('VisaTrack', visaTrackSchema);
