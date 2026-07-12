const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Passenger name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Passenger age is required'],
  },
  gender: {
    type: String,
    required: [true, 'Passenger gender is required'],
    enum: ['Male', 'Female', 'Other'],
  },
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer User reference is required'],
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
  },
  fixedDepartureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FixedDeparture',
  },
  travelDate: {
    type: Date,
    required: [true, 'Travel starting date is required'],
  },
  guestsCount: {
    type: Number,
    required: [true, 'Guests count is required'],
    min: [1, 'At least 1 guest required'],
  },
  passengers: {
    type: [passengerSchema],
    required: true,
    validate: {
      validator: function (val) {
        return val && val.length > 0;
      },
      message: 'At least one passenger detail must be registered',
    },
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total booking amount is required'],
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
