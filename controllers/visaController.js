const VisaTrack = require('../models/VisaTrack');

// @desc    Track visa status by Receipt Number
// @route   GET /api/visa/track/:receiptNumber
// @access  Public
const trackVisa = async (req, res) => {
  const receiptNumber = req.params.receiptNumber.trim().toUpperCase();

  try {
    const track = await VisaTrack.findOne({ receiptNumber });

    if (track) {
      res.json(track);
    } else {
      res.status(404).json({ message: 'Tracking code not found. Please verify and try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all visa tracking profiles
// @route   GET /api/visa/tracks
// @access  Private/Admin
const getAllVisaTracks = async (req, res) => {
  try {
    const tracks = await VisaTrack.find({}).sort({ updatedAt: -1 });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a manual visa tracking profile
// @route   POST /api/visa/tracks
// @access  Private/Admin
const createVisaTrack = async (req, res) => {
  const { receiptNumber, name, email, phone, country, stage, statusText, detail } = req.body;

  try {
    const code = (receiptNumber || `MTB-${Math.family || Math.floor(100000 + Math.random() * 900000)}`).toUpperCase();

    const track = new VisaTrack({
      receiptNumber: code,
      name,
      email,
      phone,
      country,
      stage,
      statusText,
      detail
    });

    const createdTrack = await track.save();
    res.status(201).json(createdTrack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update visa tracking details
// @route   PUT /api/visa/tracks/:receiptNumber
// @access  Private/Admin
const updateVisaTrack = async (req, res) => {
  const receiptNumber = req.params.receiptNumber.toUpperCase();
  const { stage, statusText, detail } = req.body;

  try {
    const track = await VisaTrack.findOne({ receiptNumber });

    if (track) {
      if (stage) track.stage = Number(stage);
      if (statusText) track.statusText = statusText;
      if (detail) track.detail = detail;

      const updatedTrack = await track.save();
      res.json(updatedTrack);
    } else {
      res.status(404).json({ message: 'Visa tracking profile not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  trackVisa,
  getAllVisaTracks,
  createVisaTrack,
  updateVisaTrack,
};
