// ── planner.routes.js ─────────────────────────────────────────
import { Router as PlannerRouter } from 'express';
import { body } from 'express-validator';
import { PlannerController } from '../controllers/planner.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/error.middleware.js';

export const plannerRouter = PlannerRouter();
plannerRouter.use(protect);

const DAYS   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEALS  = ['breakfast','lunch','dinner','snack'];

const entryRules = [
  body('weekStart').isDate().withMessage('weekStart must be a date (YYYY-MM-DD)'),
  body('dayOfWeek').isIn(DAYS).withMessage(`dayOfWeek must be one of: ${DAYS.join(', ')}`),
  body('mealType').isIn(MEALS).withMessage(`mealType must be one of: ${MEALS.join(', ')}`),
  body('recipeId').notEmpty(),
  body('recipeTitle').notEmpty(),
];

plannerRouter.get('/',            PlannerController.getWeek);
plannerRouter.get('/all',         PlannerController.getAllPlans);
plannerRouter.post('/entry', entryRules, handleValidationErrors, PlannerController.addEntry);
plannerRouter.delete('/entry/:entryId', PlannerController.removeEntry);


// ── shopping.routes.js ────────────────────────────────────────
import { Router as ShoppingRouter } from 'express';
import { body as sbody } from 'express-validator';
import { ShoppingController } from '../controllers/shopping.controller.js';
import { protect as sprotect } from '../middleware/auth.middleware.js';

export const shoppingRouter = ShoppingRouter();
shoppingRouter.use(sprotect);

shoppingRouter.get('/',                      ShoppingController.getAllLists);
shoppingRouter.get('/:listId',               ShoppingController.getList);
shoppingRouter.post('/generate/:planId',     ShoppingController.generate);
shoppingRouter.patch('/item/:itemId',
  [sbody('isChecked').isBoolean()],
  ShoppingController.toggleItem
);
shoppingRouter.delete('/:listId',            ShoppingController.deleteList);


// ── news.routes.js ────────────────────────────────────────────
import { Router as NewsRouter } from 'express';
import { NewsController } from '../controllers/news.controller.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';

export const newsRouter = NewsRouter();
newsRouter.use(apiLimiter);
newsRouter.get('/',           NewsController.getNews);
newsRouter.get('/headlines',  NewsController.getHeadlines);


// ── admin.routes.js ───────────────────────────────────────────
import { Router as AdminRouter } from 'express';
import { body as abody } from 'express-validator';
import { AdminController } from '../controllers/admin.controller.js';
import { protect as aprotect, isAdmin } from '../middleware/auth.middleware.js';
import { adminLimiter } from '../middleware/rateLimit.middleware.js';
import { handleValidationErrors as hve } from '../middleware/error.middleware.js';

export const adminRouter = AdminRouter();
adminRouter.use(adminLimiter, aprotect, isAdmin);

adminRouter.get('/users',       AdminController.getUsers);
adminRouter.patch('/users/:id',
  [abody('role').optional().isIn(['user','admin']), abody('isActive').optional().isBoolean()],
  hve,
  AdminController.updateUser
);
adminRouter.delete('/users/:id', AdminController.deleteUser);
adminRouter.get('/stats',        AdminController.getStats);
