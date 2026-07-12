const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { publicLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: true, // Dynamically allow incoming origin (resolves port mismatches in local dev)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for file uploads (if stored locally)
app.use('/uploads', express.static('uploads'));

// Rate Limit API endpoints
app.use('/api', publicLimiter);

// Define Routes
app.get('/', (req, res) => {
  res.send('My Travel Bandhu Server API is running smoothly... ✈️');
});

// Health Check Endpoint for Uptime Monitors (e.g. UptimeRobot, Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/fixed-departures', require('./routes/fixedDepartureRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/visa', require('./routes/visaRoutes'));
app.use('/api/newsletter', require('./routes/subscriberRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// 404 Route Not Found Middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  // Log full detailed stack trace to server-side terminal for developers
  console.error('🔥 Server Error Captured:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Sanitize the response message to avoid leaking stack traces/database properties
  let userMessage = 'An unexpected server error occurred. Please try again later.';

  if (statusCode < 500) {
    userMessage = err.message;
  } else if (err.name === 'ValidationError') {
    userMessage = 'Input validation failed. Please check your data fields.';
  } else if (err.name === 'CastError') {
    userMessage = 'Invalid identifier format provided.';
  } else if (err.code === 11000) {
    userMessage = 'Duplicate key error: This record already exists.';
  }

  res.status(statusCode).json({
    message: userMessage,
    error: process.env.SHOW_DETAILED_ERRORS === 'true' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
