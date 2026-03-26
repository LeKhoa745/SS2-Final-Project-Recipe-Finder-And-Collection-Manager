import { Router } from 'express';
import { body } from 'express-validator';
import { WishlistController } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/error.middleware.js';

const router = Router();

router.use(protect); // all wishlist routes require auth

const addRules = [
  body('recipeId').notEmpty().withMessage('recipeId is required'),
  body('recipeTitle').notEmpty().withMessage('recipeTitle is required'),
];

router.get('/',                    WishlistController.getAll);
router.post('/', addRules, handleValidationErrors, WishlistController.add);
router.get('/check/:recipeId',     WishlistController.check);
router.delete('/:recipeId',        WishlistController.remove);

export default router;
