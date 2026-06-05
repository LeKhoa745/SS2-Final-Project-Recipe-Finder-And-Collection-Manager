import { UserModel } from '../models/user.model.js';
import { WishlistModel } from '../models/wishlist.model.js';
import { PlannerModel } from '../models/planner.model.js';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

export const AdminController = {
  // GET /api/admin/users?page=1&limit=20
  async getUsers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await UserModel.findAll({
        page:  parseInt(page)  || 1,
        limit: parseInt(limit) || 20,
      });
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // PATCH /api/admin/users/:id  — update role or active status
  async updateUser(req, res, next) {
    try {
      const { role, isActive } = req.body;
      const { id } = req.params;

      if (role !== undefined)     await UserModel.updateRole(id, role);
      if (isActive !== undefined) await UserModel.toggleActive(id, isActive);

      const user = await UserModel.findById(id);
      if (!user) throw new NotFoundError('User');
      sendSuccess(res, { user }, 'User updated');
    } catch (err) { next(err); }
  },

  // DELETE /api/admin/users/:id
  async deleteUser(req, res, next) {
    try {
      const success = await UserModel.delete(req.params.id);
      if (!success) throw new NotFoundError('User');
      sendSuccess(res, {}, 'User deleted');
    } catch (err) { next(err); }
  },

  // GET /api/admin/stats
  async getStats(req, res, next) {
    try {
      const User = mongoose.model('User');
      const WishlistItem = mongoose.model('WishlistItem');
      const MealPlan = mongoose.model('MealPlan');

      const totalUsers = await User.countDocuments();
      const totalWishlists = await WishlistItem.countDocuments();
      const totalPlans = await MealPlan.countDocuments();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newToday = await User.countDocuments({ created_at: { $gte: today } });

      // Top 5 most-wishlisted recipes
      const topRecipes = await WishlistItem.aggregate([
        { $group: { _id: '$recipe_id', recipe_title: { $first: '$recipe_title' }, recipe_image: { $first: '$recipe_image' }, save_count: { $sum: 1 } } },
        { $sort: { save_count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, recipe_id: '$_id', recipe_title: 1, recipe_image: 1, save_count: 1 } }
      ]);

      sendSuccess(res, { totalUsers, totalWishlists, totalPlans, newToday, topRecipes });
    } catch (err) { next(err); }
  },
};
