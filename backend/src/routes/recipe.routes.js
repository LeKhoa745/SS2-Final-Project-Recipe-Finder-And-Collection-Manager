import { Router } from 'express';
import { query, param } from 'express-validator';
import { RecipeController } from '../controllers/recipe.controller.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';
import { handleValidationErrors } from '../middleware/error.middleware.js';

const router = Router();

router.use(apiLimiter);

router.get('/search',
  [query('q').optional().trim(), query('page').optional().isInt({ min: 1 })],
  handleValidationErrors,
  RecipeController.search
);

router.get('/:id', param('id').notEmpty(), handleValidationErrors, RecipeController.getById);
router.get('/:id/similar', RecipeController.getSimilar);

export default router;
