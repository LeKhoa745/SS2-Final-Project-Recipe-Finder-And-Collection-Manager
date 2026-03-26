import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message:          { success: false, message },
    standardHeaders:  true,
    legacyHeaders:    false,
  });

// Strict: auth endpoints
export const authLimiter = createLimiter(
  15 * 60 * 1000,  // 15 min
  20,
  'Too many auth attempts. Try again in 15 minutes.'
);

// General API
export const apiLimiter = createLimiter(
  60 * 1000,       // 1 min
  60,
  'Too many requests. Slow down.'
);

// Admin routes
export const adminLimiter = createLimiter(
  60 * 1000,
  30,
  'Admin rate limit exceeded.'
);
