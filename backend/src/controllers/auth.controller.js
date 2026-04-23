import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/errors.js';
import bcrypt from 'bcryptjs';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

export const AuthController = {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.register({ name, email, password, phone });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      sendSuccess(res, { user, accessToken }, 'Account created successfully', 201);
    } catch (err) { next(err); }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login({ email, password });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      sendSuccess(res, { user, accessToken }, 'Login successful');
    } catch (err) { next(err); }
  },

  // POST /api/auth/refresh
  async refresh(req, res, next) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

      const { user, accessToken, refreshToken } = await AuthService.refreshToken(token);

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      sendSuccess(res, { user, accessToken }, 'Token refreshed');
    } catch (err) { next(err); }
  },

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken;
      if (token) await AuthService.logout(token);

      res.clearCookie('refreshToken');
      sendSuccess(res, {}, 'Logged out successfully');
    } catch (err) { next(err); }
  },

  // GET /api/auth/me
  async me(req, res, next) {
    try {
      const { UserModel } = await import('../models/user.model.js');
      const user = await UserModel.findById(req.user.id);
      sendSuccess(res, { user });
    } catch (err) { next(err); }
  },

  async updateMe(req, res, next) {
    try {
      const { UserModel } = await import('../models/user.model.js');
      const currentUser = await UserModel.findById(req.user.id);

      if (!currentUser) {
        throw new AppError('User not found', 404);
      }

      const nextName = req.body.name ?? currentUser.name;
      const nextEmail = req.body.email ?? currentUser.email;
      const nextAvatar = req.body.avatar ?? currentUser.avatar;
      const nextPhone = req.body.phone ?? currentUser.phone;
      const existingEmail = await UserModel.findByEmail(nextEmail);
      if (existingEmail && existingEmail.id !== req.user.id) {
        throw new AppError('Email already registered', 409);
      }

      if (nextPhone) {
        const existingPhone = await UserModel.findByPhone(nextPhone);
        if (existingPhone && existingPhone.id !== req.user.id) {
          throw new AppError('Phone number already registered', 409);
        }
      }

      await UserModel.updateProfile(req.user.id, {
        name: nextName,
        email: nextEmail,
        avatar: nextAvatar,
        phone: nextPhone,
      });

      // Handle password update if provided
      const { oldPassword, newPassword } = req.body;
      if (newPassword) {
        await AuthService.updatePassword({ userId: req.user.id, oldPassword, newPassword });
      }

      // Fetch the most up-to-date user data (including updated hasPassword state)
      const user = await UserModel.findById(req.user.id);

      sendSuccess(res, { user }, 'Profile updated successfully');
    } catch (err) { next(err); }
  },

  async updatePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await AuthService.updatePassword({ userId: req.user.id, oldPassword, newPassword });
      
      const { UserModel } = await import('../models/user.model.js');
      const user = await UserModel.findById(req.user.id);
      sendSuccess(res, { user }, 'Password updated successfully');
    } catch (err) { next(err); }
  },

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('No image file provided', 400);
      }
      
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const { UserModel } = await import('../models/user.model.js');
      const currentUser = await UserModel.findById(req.user.id);
      
      await UserModel.updateProfile(req.user.id, {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        avatar: avatarUrl
      });
      
      const user = await UserModel.findById(req.user.id);
      sendSuccess(res, { user, avatarUrl }, 'Avatar uploaded successfully');
    } catch (err) { next(err); }
  },

  // GET /api/auth/google/callback — passport attaches req.user
  async googleCallback(req, res, next) {
    try {
      const { accessToken, refreshToken } = await AuthService.handleOAuthLogin(req.user);

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      // Redirect to frontend with access token in query (frontend stores in memory)
      res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${accessToken}`);
    } catch (err) { next(err); }
  },

  async forgotPassword(req, res, next) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      sendSuccess(res, { email: req.body.email, ...result }, 'Email found. Please confirm your phone number.');
    } catch (err) { next(err); }
  },

  async verifyResetPhone(req, res, next) {
    try {
      const { token, phone } = req.body;
      await AuthService.verifyResetPhone(token, phone);
      sendSuccess(res, null, 'Phone number confirmed.');
    } catch (err) { next(err); }
  },

  async verifyResetIdentity(req, res, next) {
    try {
      const { identity } = req.body;
      const { token } = await AuthService.verifyResetIdentity(identity);
      sendSuccess(res, { token }, 'Identity verified. You can now reset your password.');
    } catch (err) { next(err); }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);
      sendSuccess(res, null, 'Password has been reset successfully. You can now log in.');
    } catch (err) { next(err); }
  },
};
