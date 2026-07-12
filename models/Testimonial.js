const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Visited destination is required'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating (1 to 5) is required'],
    min: 1,
    max: 5,
  },
  avatar: {
    type: String,
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
