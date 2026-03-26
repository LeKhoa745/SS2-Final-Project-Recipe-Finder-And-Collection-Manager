import { PlannerModel } from '../models/planner.model.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const PlannerController = {
  // GET /api/planner?week=2024-01-15   (week = any Monday date)
  async getWeek(req, res, next) {
    try {
      const { week } = req.query;
      if (!week) return res.status(400).json({ success: false, message: 'week query param required (YYYY-MM-DD)' });

      const plan = await PlannerModel.getPlanWithEntries(req.user.id, week);
      sendSuccess(res, { plan: plan || null });
    } catch (err) { next(err); }
  },

  // GET /api/planner/all
  async getAllPlans(req, res, next) {
    try {
      const plans = await PlannerModel.getUserPlans(req.user.id);
      sendSuccess(res, { plans });
    } catch (err) { next(err); }
  },

  // POST /api/planner/entry
  // Body: { weekStart, dayOfWeek, mealType, recipeId, recipeTitle, recipeImage, servings }
  async addEntry(req, res, next) {
    try {
      const { weekStart, dayOfWeek, mealType, recipeId, recipeTitle, recipeImage, servings = 1 } = req.body;

      const plan  = await PlannerModel.findOrCreatePlan(req.user.id, weekStart);
      const entry = await PlannerModel.upsertEntry(plan.id, {
        dayOfWeek, mealType, recipeId, recipeTitle, recipeImage, servings,
      });

      sendSuccess(res, { entry, planId: plan.id }, 'Meal plan updated', 201);
    } catch (err) { next(err); }
  },

  // DELETE /api/planner/entry/:entryId?planId=X
  async removeEntry(req, res, next) {
    try {
      const { planId } = req.query;
      if (!planId) return res.status(400).json({ success: false, message: 'planId query param required' });

      const isOwner = await PlannerModel.verifyPlanOwner(req.user.id, planId);
      if (!isOwner) throw new ForbiddenError('Not your meal plan');

      const removed = await PlannerModel.removeEntry(planId, req.params.entryId);
      if (!removed) throw new NotFoundError('Meal plan entry');

      sendSuccess(res, {}, 'Entry removed');
    } catch (err) { next(err); }
  },
};
