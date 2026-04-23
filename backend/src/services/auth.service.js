import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '../models/user.model.js';
import { AppError, UnauthorizedError } from '../utils/errors.js';

// ── Token helpers ──────────────────────────────────────────────
export const generateTokens = async (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  // Persist refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await UserModel.saveRefreshToken(user.id, refreshToken, expiresAt);

  return { accessToken, refreshToken };
};

// ── Auth Service ───────────────────────────────────────────────
export const AuthService = {
  async register({ name, email, password }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordHash });
    const tokens = await generateTokens(user);
    return { user, ...tokens };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    if (!user.is_active) throw new AppError('Account disabled', 403);

    const safeUser = await UserModel.findById(user.id); // strips password_hash
    const tokens   = await generateTokens(safeUser);
    return { user: safeUser, ...tokens };
  },

  async refreshToken(token) {
    const stored = await UserModel.findRefreshToken(token);
    if (!stored) throw new UnauthorizedError('Invalid refresh token');

    const user = await UserModel.findById(stored.user_id);
    if (!user) throw new UnauthorizedError('User not found');

    // Rotate: delete old, issue new
    await UserModel.deleteRefreshToken(token);
    const tokens = await generateTokens(user);
    return { user, ...tokens };
  },

  async logout(token) {
    await UserModel.deleteRefreshToken(token);
  },

  async updatePassword({ userId, oldPassword, newPassword }) {
    const user = await UserModel.findByIdWithPassword(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.password_hash) {
      if (!oldPassword) throw new AppError('Current password is required', 400);
      const valid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!valid) throw new AppError('Incorrect current password', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await UserModel.updatePassword(userId, newHash);
  },

  // Called after Google OAuth callback
  async handleOAuthLogin(user) {
    return generateTokens(user);
  },

  async forgotPassword(email) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new AppError('No user found with this email address', 404);

    if (!user.password_hash) {
      throw new AppError('This account was created via Google. Please use Google Login.', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await UserModel.saveResetToken(user.id, token, expiresAt);

    // Simulate sending email by logging to console
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log('\n\n================================================');
    console.log('🔗 PASSWORD RESET LINK:');
    console.log(resetUrl);
    console.log('================================================\n\n');

    return true;
  },

  async resetPassword(token, newPassword) {
    const resetRequest = await UserModel.findResetToken(token);
    if (!resetRequest) throw new AppError('Invalid or expired reset token', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await UserModel.updatePassword(resetRequest.user_id, passwordHash);
    await UserModel.deleteResetToken(token);

    return true;
  },
};
