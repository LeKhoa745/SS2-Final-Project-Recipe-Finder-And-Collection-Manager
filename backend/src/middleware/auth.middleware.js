import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';

export const protect = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    next(err);
  }
};

export const isAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new UnauthorizedError('Admin access required'));
  }
  next();
};

// Attach user but don't fail if missing (optional auth)
export const optionalAuth = (req, _res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) { /* silent */ }
  next();
};
