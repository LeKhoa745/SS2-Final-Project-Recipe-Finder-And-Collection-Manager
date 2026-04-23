import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '../models/user.model.js';
import { AppError, UnauthorizedError } from '../utils/errors.js';
import { sendEmail } from '../utils/email.util.js';

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
  async register({ name, email, password, phone }) {
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) throw new AppError('Email already registered', 409);

    if (phone) {
      const existingPhone = await UserModel.findByPhone(phone);
      if (existingPhone) throw new AppError('Phone number already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordHash, phone });
    const tokens = await generateTokens(user);
    return { user, ...tokens };
  },

  async login({ email, password }) {
    // Determine if input is email or phone
    const isEmail = email.includes('@');
    const user = isEmail 
      ? await UserModel.findByEmail(email) 
      : await UserModel.findByPhone(email);

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

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Recipe Finder',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ea580c;">Recipe Finder</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Please click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">If the button above doesn't work, copy and paste this link: <br/> ${resetUrl}</p>
        </div>
      `,
    });

    return true;
  },

  async verifyResetIdentity(identity) {
    let user;
    if (identity.includes('@')) {
      user = await UserModel.findByEmail(identity);
    } else {
      user = await UserModel.findByPhone(identity);
    }

    if (!user) {
      throw new AppError('Identity not found. Please check your email or phone number.', 404);
    }

    if (!user.password_hash) {
      throw new AppError('This account was created via Google. Please use Google Login.', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1800000); // 30 minutes
    await UserModel.saveResetToken(user.id, token, expiresAt);

    return { token };
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
