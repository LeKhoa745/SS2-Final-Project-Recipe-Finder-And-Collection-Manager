import { Router } from 'express';
import { body } from 'express-validator';
import passport from '../config/passport.js';
import { AuthController } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { handleValidationErrors } from '../middleware/error.middleware.js';
import { uploadAvatarMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// ── Input validation rules ────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().matches(/^\+84\d{9}$/).withMessage('Phone must be +84 followed by 9 digits'),
];

const loginRules = [
  body('email').notEmpty().withMessage('Email or Phone required'),
  body('password').notEmpty().withMessage('Password required'),
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
      const isRelativePath = value.startsWith('/uploads/');
      if (!isUrl && !isDataImage && !isRelativePath) {
        throw new Error('Avatar must be an image URL, uploaded image data, or valid internal path');
      }
      return true;
    }),
  body('phone')
    .optional({ nullable: true })
    .matches(/^\+84\d{9}$/)
    .withMessage('Phone number must use +84 and contain exactly 9 digits after it'),
  body('newPassword')
    .optional({ checkFalsy: true })
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  body('oldPassword').optional(),
];

const updatePasswordRules = [
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('oldPassword').optional()
];

// ── Routes ────────────────────────────────────────────────────
router.post('/register', authLimiter, registerRules, handleValidationErrors, AuthController.register);
router.post('/login',    authLimiter, loginRules,    handleValidationErrors, AuthController.login);
router.post('/refresh',  AuthController.refresh);
router.post('/logout',   AuthController.logout);
router.get('/me',        protect, AuthController.me);
router.patch('/me',      protect, updateProfileRules, handleValidationErrors, AuthController.updateMe);
router.post('/avatar',   protect, uploadAvatarMiddleware, AuthController.uploadAvatar);
router.patch('/password', protect, updatePasswordRules, handleValidationErrors, AuthController.updatePassword);

// Password Reset (Public)
router.post('/forgot-password', 
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  handleValidationErrors,
  AuthController.forgotPassword
);

router.post('/verify-reset-identity',
  [
    body('identity').notEmpty().withMessage('Email or Phone number is required')
  ],
  handleValidationErrors,
  AuthController.verifyResetIdentity
);

router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  handleValidationErrors,
  AuthController.resetPassword
);

// Google OAuth2
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  AuthController.googleCallback
);

export default router;
