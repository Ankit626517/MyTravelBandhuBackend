const FixedDeparture = require('../models/FixedDeparture');

// @desc    Get all upcoming fixed departures
// @route   GET /api/fixed-departures
// @access  Public
const getFixedDepartures = async (req, res) => {
  try {
    const { destination, seatsOnly } = req.query;
    let query = {};

    // Filter by destination
    if (destination && destination !== 'All') {
      query.destination = { $regex: destination, $options: 'i' };
    }

    // Filter by seatsLeft > 0
    if (seatsOnly === 'true') {
      query.seatsLeft = { $gt: 0 };
    }

    // Find and populate associated package details, sorted by date ascending
    const departures = await FixedDeparture.find(query)
      .populate('packageId', 'title duration rating price image')
      .sort({ departureDate: 1 });

    res.json(departures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single fixed departure by ID
// @route   GET /api/fixed-departures/:id
// @access  Public
const getFixedDepartureById = async (req, res) => {
  try {
    const departure = await FixedDeparture.findById(req.params.id).populate('packageId');
    if (departure) {
      res.json(departure);
    } else {
      res.status(404).json({ message: 'Fixed departure not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a fixed departure
// @route   POST /api/fixed-departures
// @access  Private/Admin
const createFixedDeparture = async (req, res) => {
  try {
    const departure = new FixedDeparture(req.body);
    const createdDeparture = await departure.save();
    res.status(201).json(createdDeparture);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a fixed departure
// @route   PUT /api/fixed-departures/:id
// @access  Private/Admin
const updateFixedDeparture = async (req, res) => {
  try {
    const departure = await FixedDeparture.findById(req.params.id);

    if (departure) {
      Object.assign(departure, req.body);
      const updatedDeparture = await departure.save();
      res.json(updatedDeparture);
    } else {
      res.status(404).json({ message: 'Fixed departure not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a fixed departure
// @route   DELETE /api/fixed-departures/:id
// @access  Private/Admin
const deleteFixedDeparture = async (req, res) => {
  try {
    const departure = await FixedDeparture.findById(req.params.id);

    if (departure) {
      await departure.deleteOne();
      res.json({ message: 'Fixed departure removed successfully' });
    } else {
      res.status(404).json({ message: 'Fixed departure not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFixedDepartures,
  getFixedDepartureById,
  createFixedDeparture,
  updateFixedDeparture,
  deleteFixedDeparture,
};
