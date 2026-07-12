/**
 * Strict Schema Validation Middleware
 * Validates request input against a strict definition.
 * Rejects mismatched requests immediately.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const target = req.body || {};

    for (const [key, rules] of Object.entries(schema)) {
      const val = target[key];

      // 1. Required check
      if (rules.required && (val === undefined || val === null || val === '')) {
        errors.push(`Field '${key}' is required.`);
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        // 2. Type validation
        if (rules.type === 'string') {
          if (typeof val !== 'string') {
            errors.push(`Field '${key}' must be a string.`);
            continue;
          }
          // Length checks
          if (rules.min !== undefined && val.length < rules.min) {
            errors.push(`Field '${key}' must be at least ${rules.min} characters.`);
          }
          if (rules.max !== undefined && val.length > rules.max) {
            errors.push(`Field '${key}' must not exceed ${rules.max} characters.`);
          }
        } else if (rules.type === 'number') {
          const num = Number(val);
          if (typeof val === 'boolean' || isNaN(num)) {
            errors.push(`Field '${key}' must be a valid number.`);
            continue;
          }
          if (rules.min !== undefined && num < rules.min) {
            errors.push(`Field '${key}' must be greater than or equal to ${rules.min}.`);
          }
          if (rules.max !== undefined && num > rules.max) {
            errors.push(`Field '${key}' must be less than or equal to ${rules.max}.`);
          }
        } else if (rules.type === 'date') {
          if (isNaN(Date.parse(val))) {
            errors.push(`Field '${key}' must be a valid date.`);
          }
        } else if (rules.type === 'array') {
          if (!Array.isArray(val)) {
            errors.push(`Field '${key}' must be an array.`);
          }
        }

        // 3. Format validations
        if (rules.format === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            errors.push(`Field '${key}' must be a valid email address.`);
          }
        } else if (rules.format === 'phone') {
          // Normalizes phone digits and verifies format
          const phoneClean = String(val).replace(/\D/g, '');
          const phoneRegex = /^[6-9]\d{9}$/; // Standard 10-digit Indian mobile layout
          if (!phoneRegex.test(phoneClean)) {
            errors.push(`Field '${key}' must be a valid 10-digit phone number.`);
          }
        } else if (rules.format === 'otp') {
          const otpRegex = /^\d{6}$/;
          if (!otpRegex.test(val)) {
            errors.push(`Field '${key}' must be a valid 6-digit numeric OTP code.`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: 'Input validation failed. Please check your submission.', 
        errors 
      });
    }

    next();
  };
};

module.exports = validate;
