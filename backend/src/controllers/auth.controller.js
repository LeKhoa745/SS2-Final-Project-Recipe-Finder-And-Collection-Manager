import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

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
      const { name, email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.register({ name, email, password });

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

      const existing = await UserModel.findByEmail(nextEmail);
      if (existing && existing.id !== req.user.id) {
        throw new AppError('Email already registered', 409);
      }

      const user = await UserModel.updateProfile(req.user.id, {
        name: nextName,
        email: nextEmail,
        avatar: nextAvatar,
        phone: nextPhone,
      });

      sendSuccess(res, { user }, 'Profile updated successfully');
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
};
