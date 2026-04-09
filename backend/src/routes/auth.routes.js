import { Router } from 'express';
import { body } from 'express-validator';
import passport from '../config/passport.js';
import { AuthController } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { handleValidationErrors } from '../middleware/error.middleware.js';

const router = Router();

// ── Input validation rules ────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('avatar')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value) return true;
      const isUrl = /^https?:\/\/.+/i.test(value);
      const isDataImage = /^data:image\/[a-zA-Z+]+;base64,/.test(value);
      if (!isUrl && !isDataImage) {
        throw new Error('Avatar must be an image URL or uploaded image data');
      }
      if (value.length > 200000) {
        throw new Error('Avatar image is too large');
      }
      return true;
    }),
  body('phone')
    .optional({ nullable: true })
    .matches(/^\+84\d{9}$/)
    .withMessage('Phone number must use +84 and contain exactly 9 digits after it'),
];

// ── Routes ────────────────────────────────────────────────────
router.post('/register', authLimiter, registerRules, handleValidationErrors, AuthController.register);
router.post('/login',    authLimiter, loginRules,    handleValidationErrors, AuthController.login);
router.post('/refresh',  AuthController.refresh);
router.post('/logout',   AuthController.logout);
router.get('/me',        protect, AuthController.me);
router.patch('/me',      protect, updateProfileRules, handleValidationErrors, AuthController.updateMe);

// Google OAuth2
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  AuthController.googleCallback
);

export default router;
