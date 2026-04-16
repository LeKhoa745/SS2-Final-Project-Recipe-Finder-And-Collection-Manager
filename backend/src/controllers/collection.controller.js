import { UserRecipeModel } from '../models/userRecipe.model.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const CollectionController = {
  /**
   * POST /api/collection
   * Create a new user recipe.
   */
  async create(req, res, next) {
    try {
      const recipe = await UserRecipeModel.create(req.user.id, req.body);
      sendSuccess(res, { recipe }, 'Recipe created', 201);
    } catch (err) { next(err); }
  },

  /**
   * GET /api/collection/mine
   * List the logged-in user's own recipes.
   */
  async getMyRecipes(req, res, next) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 12;
      const result = await UserRecipeModel.findByUser(req.user.id, { page, limit });
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  /**
   * GET /api/collection/public?q=pasta
   * Search public community recipes.
   */
  async searchPublic(req, res, next) {
    try {
      const { q, page, limit } = req.query;
      const result = await UserRecipeModel.searchPublic(q, {
        page:  parseInt(page)  || 1,
        limit: parseInt(limit) || 12,
      });
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  /**
   * GET /api/collection/:id
   * Get a single recipe. Public recipes visible to anyone; private only to owner.
   */
  async getById(req, res, next) {
    try {
      const recipe = await UserRecipeModel.findById(req.params.id);
      if (!recipe) throw new NotFoundError('Recipe');

      // If private, only the owner can view
      if (!recipe.isPublic && (!req.user || req.user.id !== recipe.userId)) {
        throw new ForbiddenError('This recipe is private');
      }

      sendSuccess(res, { recipe });
    } catch (err) { next(err); }
  },

  /**
   * PUT /api/collection/:id
   * Update an existing recipe (must be owner).
   */
  async update(req, res, next) {
    try {
      const existing = await UserRecipeModel.findById(req.params.id);
      if (!existing) throw new NotFoundError('Recipe');
      if (existing.userId !== req.user.id) throw new ForbiddenError('Not your recipe');

      const recipe = await UserRecipeModel.update(req.params.id, req.user.id, req.body);
      sendSuccess(res, { recipe }, 'Recipe updated');
    } catch (err) { next(err); }
  },

  /**
   * DELETE /api/collection/:id
   * Delete a recipe (must be owner).
   */
  async delete(req, res, next) {
    try {
      const deleted = await UserRecipeModel.delete(req.params.id, req.user.id);
      if (!deleted) throw new NotFoundError('Recipe');
      sendSuccess(res, null, 'Recipe deleted');
    } catch (err) { next(err); }
  },

  /**
   * DELETE /api/collection/all
   * Delete ALL recipes for user.
   */
  async deleteAll(req, res, next) {
    try {
      await UserRecipeModel.deleteAll(req.user.id);
      sendSuccess(res, null, 'All recipes deleted');
    } catch (err) { next(err); }
  },
};
