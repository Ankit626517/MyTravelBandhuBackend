/**
 * Configurable Security Rate Limiting Middleware
 * Uses environment variables for limits and handles:
 * - Public IP-based limits (Moderate)
 * - Authenticated User-based limits (Loose)
 * - Auth attempts (Login, OTP verification) with exponential backoff rather than hard lockouts
 */

// In-memory store for rate limiting data
const rateStore = new Map();
const authStore = new Map();

/**
 * Moderate rate limiter for public routes
 */
const publicLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const windowMs = Number(process.env.PUBLIC_LIMIT_WINDOW_MS) || 900000; // 15 mins
  const maxRequests = Number(process.env.PUBLIC_LIMIT_MAX) || 150; // 150 requests

  const now = Date.now();
  const storeKey = `pub_${ip}`;

  if (!rateStore.has(storeKey)) {
    rateStore.set(storeKey, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = rateStore.get(storeKey);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  record.count++;
  if (record.count > maxRequests) {
    res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
    return res.status(429).json({
      message: 'Too many requests. Please try again later.'
    });
  }

  next();
};

/**
 * Loose rate limiter for authenticated routes
 */
const authedLimiter = (req, res, next) => {
  // If request hasn't passed auth, fallback to IP
  const identifier = req.user ? req.user._id.toString() : (req.ip || req.socket.remoteAddress);
  const windowMs = Number(process.env.AUTHED_LIMIT_WINDOW_MS) || 900000; // 15 mins
  const maxRequests = Number(process.env.AUTHED_LIMIT_MAX) || 1000; // 1000 requests

  const now = Date.now();
  const storeKey = `auth_${identifier}`;

  if (!rateStore.has(storeKey)) {
    rateStore.set(storeKey, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = rateStore.get(storeKey);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  record.count++;
  if (record.count > maxRequests) {
    res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
    return res.status(429).json({
      message: 'API rate limit exceeded. Please slow down.'
    });
  }

  next();
};

/**
 * Authentication protector using per-IP & per-account (email) exponential backoff
 */
const authLimiter = (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress;
  const email = req.body.email || '';

  const ipKey = `ip_${ip}`;
  const accountKey = `acc_${email}`;
  const now = Date.now();

  // Helper to calculate exponential backoff delay (seconds)
  const getDelay = (attempts) => {
    const baseAttempts = Number(process.env.AUTH_LIMIT_MAX_ATTEMPTS) || 3;
    if (attempts <= baseAttempts) return 0;
    
    // Backoff formula: 2^(attempts - base) seconds, capped at 16 seconds
    const diff = attempts - baseAttempts;
    return Math.min(Math.pow(2, diff), 16);
  };

  // Track attempts
  const ipRecord = authStore.get(ipKey) || { attempts: 0, lastAttempt: 0 };
  const accRecord = email ? (authStore.get(accountKey) || { attempts: 0, lastAttempt: 0 }) : { attempts: 0, lastAttempt: 0 };

  // If previous attempt is older than 30 mins, reset attempts
  const timeoutLimit = 30 * 60 * 1000;
  if (now - ipRecord.lastAttempt > timeoutLimit) ipRecord.attempts = 0;
  if (email && (now - accRecord.lastAttempt > timeoutLimit)) accRecord.attempts = 0;

  ipRecord.attempts++;
  ipRecord.lastAttempt = now;
  authStore.set(ipKey, ipRecord);

  if (email) {
    accRecord.attempts++;
    accRecord.lastAttempt = now;
    authStore.set(accountKey, accRecord);
  }

  // Calculate highest delay between IP and Account limits
  const maxAttempts = Math.max(ipRecord.attempts, accRecord.attempts);
  const delaySec = getDelay(maxAttempts);

  if (delaySec > 0) {
    // Return rate limit info in headers and delay response sending (exponential backoff)
    res.setHeader('X-Retry-Delay-Seconds', delaySec);
    console.log(`⚠️ RateLimit Delay: Slowing down auth request from IP ${ip} / Email ${email} by ${delaySec}s due to ${maxAttempts} attempts.`);
    
    setTimeout(() => {
      next();
    }, delaySec * 1000);
  } else {
    next();
  }
};

/**
 * Reset authentication attempt counter on successful login
 */
const resetAuthAttempts = (req) => {
  const ip = req.ip || req.socket.remoteAddress;
  const email = req.body.email || '';

  authStore.delete(`ip_${ip}`);
  if (email) {
    authStore.delete(`acc_${email}`);
  }
};

module.exports = {
  publicLimiter,
  authedLimiter,
  authLimiter,
  resetAuthAttempts
};
