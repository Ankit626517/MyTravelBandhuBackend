const Subscriber = require('../models/Subscriber');

// @desc    Subscribe to email newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    const existing = await Subscriber.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: 'You have already subscribed to our newsletter.' });
    }

    const subscriber = await Subscriber.create({ email });
    res.status(201).json({
      message: 'Subscribed to newsletter successfully!',
      subscriber
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unsubscribe email
// @route   DELETE /api/newsletter/unsubscribe
// @access  Public
const unsubscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    const subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      await subscriber.deleteOne();
      res.json({ message: 'Successfully unsubscribed from our newsletter distribution list.' });
    } else {
      res.status(404).json({ message: 'Email address not found in our subscriber registry.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  subscribeNewsletter,
  getSubscribers,
  unsubscribeNewsletter,
};
