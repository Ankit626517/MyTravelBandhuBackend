const mongoose = require('mongoose');

const fixedDepartureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Fixed departure title is required'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  originalPrice: {
    type: Number,
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required'],
  },
  seatsTotal: {
    type: Number,
    required: [true, 'Total seats capacity is required'],
  },
  seatsLeft: {
    type: Number,
    required: [true, 'Remaining seats count is required'],
  },
  duration: {
    type: String,
    required: [true, 'Duration description is required'],
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: [true, 'Associated Package ID is required'],
  },
}, { timestamps: true });

module.exports = mongoose.model('FixedDeparture', fixedDepartureSchema);
