import { RecipeService } from '../services/recipe.service.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

export const RecipeController = {
  // GET /api/recipes/search?q=pasta&ingredients=tomato&cuisine=italian&page=1
  async search(req, res, next) {
    try {
      const { q, ingredients, cuisine, diet, type, page, limit } = req.query;
      const result = await RecipeService.search({
        query: q,
        ingredients,
        cuisine,
        diet,
        type,
        page:  parseInt(page)  || 1,
        limit: parseInt(limit) || 12,
      });
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // GET /api/recipes/:id
  async getById(req, res, next) {
    try {
      const recipe = await RecipeService.getById(req.params.id);
      if (!recipe) {
        throw new NotFoundError('Recipe');
      }
      sendSuccess(res, { recipe });
    } catch (err) { next(err); }
  },

  // GET /api/recipes/:id/similar
  async getSimilar(req, res, next) {
    try {
      const recipes = await RecipeService.getSimilar(req.params.id);
      sendSuccess(res, { recipes });
    } catch (err) { next(err); }
  },

  // GET /api/recipes/status
  async getStatus(_req, res, next) {
    try {
      const status = await RecipeService.getStatus();
      sendSuccess(res, status);
    } catch (err) { next(err); }
  },
};
