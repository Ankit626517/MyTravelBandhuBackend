const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// Elegant HTML template for OTP verification email
const getOTPTemplate = (name, otp) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 40px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin: 0; letter-spacing: -0.5px;">My Travel Bandhu</h2>
        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Admin Console Security Desk</p>
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="font-size: 14px; line-height: 1.5; color: #334155; margin-top: 0;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #475569;">A login request was initiated for your administrator account. Use the verification code below to verify your identity:</p>
        
        <div style="font-size: 32px; font-weight: 800; text-align: center; color: #2563eb; background-color: #f0f7ff; padding: 16px; border-radius: 12px; margin: 24px 0; letter-spacing: 6px; border: 1px solid #bfdbfe;">
          ${otp}
        </div>
        
        <p style="font-size: 11px; line-height: 1.5; color: #94a3b8; margin-bottom: 0;">This security code is strictly confidential and is valid for only <strong>5 minutes</strong>. If you did not initiate this login request, please change your administrator password immediately.</p>
      </div>
      <div style="border-top: 1px solid #f1f5f9; margin-top: 25px; padding-top: 15px; text-align: center; font-size: 11px; color: #cbd5e1;">
        © My Travel Bandhu Admin Security Service
      </div>
    </div>
  `;
};

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth admin & generate/send OTP code
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // If user is Admin, initiate 2FA OTP flow
      if (user.role === 'admin') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
        await user.save();

        // Send verification code email
        const emailSubject = `Admin Console Verification Code: ${otp}`;
        const emailHtml = getOTPTemplate(user.name, otp);

        await sendEmail({
          to: user.email,
          subject: emailSubject,
          html: emailHtml,
        });

        return res.json({
          requiresOTP: true,
          email: user.email,
          message: 'Security verification code sent to your email.'
        });
      }

      // Fallback for non-admin roles (regular login directly)
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and return auth credentials
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify code exists, matches, and is within validity timestamp
    if (
      !user.otp ||
      !user.otpExpire ||
      user.otp !== otp ||
      new Date() > user.otpExpire
    ) {
      return res.status(401).json({ message: 'Invalid or expired verification code' });
    }

    // Clear verification codes from record
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Reset authentication attempt counters in rateLimiter store
    try {
      const { resetAuthAttempts } = require('../middleware/rateLimiter');
      resetAuthAttempts(req);
    } catch (e) {
      console.error('Failed to reset auth attempts:', e);
    }

    // Authenticate and return JWT token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  verifyOTP,
  getAdminProfile,
};
