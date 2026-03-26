import { WishlistModel } from '../models/wishlist.model.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, NotFoundError } from '../utils/errors.js';

export const WishlistController = {
  // GET /api/wishlist
  async getAll(req, res, next) {
    try {
      const items = await WishlistModel.findByUser(req.user.id);
      const total = await WishlistModel.count(req.user.id);
      sendSuccess(res, { items, total });
    } catch (err) { next(err); }
  },

  // POST /api/wishlist
  // Body: { recipeId, recipeTitle, recipeImage, readyInMinutes, servings, sourceUrl }
  async add(req, res, next) {
    try {
      const { recipeId } = req.body;
      const existing = await WishlistModel.findOne(req.user.id, recipeId);
      if (existing) throw new AppError('Recipe already in wishlist', 409);

      const item = await WishlistModel.add(req.user.id, req.body);
      sendSuccess(res, { item }, 'Added to wishlist', 201);
    } catch (err) { next(err); }
  },

  // DELETE /api/wishlist/:recipeId
  async remove(req, res, next) {
    try {
      const removed = await WishlistModel.remove(req.user.id, req.params.recipeId);
      if (!removed) throw new NotFoundError('Wishlist item');
      sendSuccess(res, {}, 'Removed from wishlist');
    } catch (err) { next(err); }
  },

  // GET /api/wishlist/check/:recipeId
  async check(req, res, next) {
    try {
      const item = await WishlistModel.findOne(req.user.id, req.params.recipeId);
      sendSuccess(res, { saved: !!item, item: item || null });
    } catch (err) { next(err); }
  },
};
