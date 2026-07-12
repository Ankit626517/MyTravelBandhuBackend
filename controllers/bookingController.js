const Booking = require('../models/Booking');
const Package = require('../models/Package');
const FixedDeparture = require('../models/FixedDeparture');

// Helper to generate unique booking ID
const generateBookingId = () => {
  return `MTB-BOOK-${Math.floor(100000 + Math.random() * 900000)}`;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customers/Admins)
const createBooking = async (req, res) => {
  const { packageId, fixedDepartureId, travelDate, guestsCount, passengers } = req.body;

  try {
    if (!packageId && !fixedDepartureId) {
      return res.status(400).json({ message: 'Please specify either a Package ID or a Fixed Departure ID' });
    }

    if (!passengers || passengers.length !== Number(guestsCount)) {
      return res.status(400).json({ message: 'Passenger details count must match guestsCount value' });
    }

    // Verify package / departure pricing
    let pricePerGuest = 0;
    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) return res.status(404).json({ message: 'Package not found' });
      pricePerGuest = pkg.price;
    } else if (fixedDepartureId) {
      const fd = await FixedDeparture.findById(fixedDepartureId);
      if (!fd) return res.status(404).json({ message: 'Fixed Departure not found' });
      
      // Check if enough seats are left
      if (fd.seatsLeft < Number(guestsCount)) {
        return res.status(400).json({ message: `Insufficient seats. Only ${fd.seatsLeft} seats left for this departure.` });
      }
      pricePerGuest = fd.price;
    }

    const totalAmount = pricePerGuest * Number(guestsCount);
    const bookingId = generateBookingId();

    const booking = new Booking({
      bookingId,
      userId: req.user._id,
      packageId,
      fixedDepartureId,
      travelDate,
      guestsCount: Number(guestsCount),
      passengers,
      totalAmount,
    });

    const createdBooking = await booking.save();
    res.status(201).json({
      message: 'Booking request created successfully!',
      booking: createdBooking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customers/Admins)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('packageId', 'title destination duration image price')
      .populate('fixedDepartureId', 'title destination departureDate duration image price')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed single booking by Mongoose ID
// @route   GET /api/bookings/:id
// @access  Private (Authenticated users)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('packageId')
      .populate('fixedDepartureId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization: User must be admin or the owner of the booking
    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to view this booking.' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin dashboard list)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email phone')
      .populate('packageId', 'title destination duration')
      .populate('fixedDepartureId', 'title destination departureDate')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking/payment status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  const { bookingStatus, paymentStatus } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldBookingStatus = booking.bookingStatus;

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    const updatedBooking = await booking.save();

    // Side Effect: If a group departure booking is confirmed, subtract from seatsLeft
    if (
      bookingStatus === 'confirmed' &&
      oldBookingStatus !== 'confirmed' &&
      booking.fixedDepartureId
    ) {
      const fd = await FixedDeparture.findById(booking.fixedDepartureId);
      if (fd) {
        fd.seatsLeft = Math.max(0, fd.seatsLeft - booking.guestsCount);
        await fd.save();
      }
    }

    // Restore seat count if a confirmed booking gets cancelled
    if (
      bookingStatus === 'cancelled' &&
      oldBookingStatus === 'confirmed' &&
      booking.fixedDepartureId
    ) {
      const fd = await FixedDeparture.findById(booking.fixedDepartureId);
      if (fd) {
        fd.seatsLeft = Math.min(fd.seatsTotal, fd.seatsLeft + booking.guestsCount);
        await fd.save();
      }
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
};
