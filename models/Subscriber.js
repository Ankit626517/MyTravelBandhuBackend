const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required for subscription'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
