const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials (reviews)
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const { destination, rating } = req.query;
    let query = {};

    if (destination && destination !== 'All') {
      query.destination = { $regex: destination, $options: 'i' };
    }

    if (rating) {
      query.rating = Number(rating);
    }

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a new testimonial
// @route   POST /api/testimonials
// @access  Public
const createTestimonial = async (req, res) => {
  try {
    const { name, location, destination, rating, avatar, text } = req.body;
    
    const testimonial = new Testimonial({
      name,
      location,
      destination,
      rating,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', // default avatar
      text
    });

    const createdTestimonial = await testimonial.save();
    res.status(201).json(createdTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
};
