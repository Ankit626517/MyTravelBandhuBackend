const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Package title is required'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required (e.g. Honeymoon, Adventure, Weekend)'],
    trim: true,
  },
  duration: {
    type: String,
    required: [true, 'Duration string (e.g. 5 Nights / 6 Days) is required'],
  },
  daysCount: {
    type: Number,
    required: [true, 'Number of days (daysCount) is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  originalPrice: {
    type: Number,
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    required: [true, 'Main image URL is required'],
  },
  images: {
    type: [String],
    default: [],
  },
  overview: {
    type: String,
    required: [true, 'Package overview is required'],
  },
  highlights: {
    type: [String],
    default: [],
  },
  inclusions: {
    type: [String],
    default: [],
  },
  exclusions: {
    type: [String],
    default: [],
  },
  itinerary: {
    type: [itineraryItemSchema],
    default: [],
  },
  tourType: {
    type: String,
    default: 'Private Tour',
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for text search on destination, state, country, or title
packageSchema.index({ destination: 'text', state: 'text', country: 'text', title: 'text' });

module.exports = mongoose.model('Package', packageSchema);
