import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { CollectionController } from '../controllers/collection.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/error.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();
router.use(apiLimiter);

// ── Validation rules ──────────────────────────────────────────
const recipeRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('instructions').isArray({ min: 1 }).withMessage('At least one instruction step is required'),
  body('cookTimeMinutes').optional().isInt({ min: 1 }),
  body('servings').optional().isInt({ min: 1 }),
  body('isPublic').optional().isBoolean(),
];

// ── Public routes (no auth required) ──────────────────────────
router.get('/public',
  [query('q').optional().trim()],
  handleValidationErrors,
  CollectionController.searchPublic
);

// ── Protected routes (auth required) ──────────────────────────
// These MUST come before /:id to avoid being caught as a param
router.get('/mine',
  protect,
  CollectionController.getMyRecipes
);

router.post('/',
  protect,
  recipeRules,
  handleValidationErrors,
  CollectionController.create
);

router.put('/:id',
  protect,
  [param('id').isInt(), ...recipeRules],
  handleValidationErrors,
  CollectionController.update
);

router.delete('/all',
  protect,
  CollectionController.deleteAll
);

router.delete('/:id',
  protect,
  param('id').isInt(),
  handleValidationErrors,
  CollectionController.delete
);

// ── Public detail route (must be last to not shadow /mine, /public) ──
router.get('/:id',
  optionalAuth,
  param('id').isInt(),
  handleValidationErrors,
  CollectionController.getById
);

export default router;
