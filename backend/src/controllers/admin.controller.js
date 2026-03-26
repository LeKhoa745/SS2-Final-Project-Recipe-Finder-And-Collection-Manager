import { UserModel } from '../models/user.model.js';
import pool from '../config/db.js';
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
      if (isActive !== undefined) await UserModel.toggleActive(id, isActive ? 1 : 0);

      const user = await UserModel.findById(id);
      if (!user) throw new NotFoundError('User');
      sendSuccess(res, { user }, 'User updated');
    } catch (err) { next(err); }
  },

  // DELETE /api/admin/users/:id
  async deleteUser(req, res, next) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
      if (!result.affectedRows) throw new NotFoundError('User');
      sendSuccess(res, {}, 'User deleted');
    } catch (err) { next(err); }
  },

  // GET /api/admin/stats
  async getStats(req, res, next) {
    try {
      const [[{ totalUsers }]]    = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
      const [[{ totalWishlists }]] = await pool.query('SELECT COUNT(*) as totalWishlists FROM wishlist_items');
      const [[{ totalPlans }]]    = await pool.query('SELECT COUNT(*) as totalPlans FROM meal_plans');
      const [[{ newToday }]]      = await pool.query("SELECT COUNT(*) as newToday FROM users WHERE DATE(created_at) = CURDATE()");

      // Top 5 most-wishlisted recipes
      const [topRecipes] = await pool.query(
        `SELECT recipe_id, recipe_title, recipe_image, COUNT(*) as save_count
         FROM wishlist_items GROUP BY recipe_id ORDER BY save_count DESC LIMIT 5`
      );

      sendSuccess(res, { totalUsers, totalWishlists, totalPlans, newToday, topRecipes });
    } catch (err) { next(err); }
  },
};
