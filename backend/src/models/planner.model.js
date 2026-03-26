import pool from '../config/db.js';

export const PlannerModel = {
  // ── Meal Plans ──────────────────────────────────────────────
  async findOrCreatePlan(userId, weekStart) {
    let [rows] = await pool.query(
      'SELECT * FROM meal_plans WHERE user_id = ? AND week_start = ?',
      [userId, weekStart]
    );
    if (rows.length > 0) return rows[0];

    const [result] = await pool.query(
      'INSERT INTO meal_plans (user_id, week_start) VALUES (?, ?)',
      [userId, weekStart]
    );
    [rows] = await pool.query('SELECT * FROM meal_plans WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async getPlanWithEntries(userId, weekStart) {
    const [plans] = await pool.query(
      'SELECT * FROM meal_plans WHERE user_id = ? AND week_start = ?',
      [userId, weekStart]
    );
    if (!plans.length) return null;

    const plan = plans[0];
    const [entries] = await pool.query(
      'SELECT * FROM meal_plan_entries WHERE plan_id = ? ORDER BY FIELD(day_of_week,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), meal_type',
      [plan.id]
    );
    plan.entries = entries;
    return plan;
  },

  async getUserPlans(userId) {
    const [rows] = await pool.query(
      'SELECT mp.*, COUNT(mpe.id) as entry_count FROM meal_plans mp LEFT JOIN meal_plan_entries mpe ON mpe.plan_id = mp.id WHERE mp.user_id = ? GROUP BY mp.id ORDER BY mp.week_start DESC',
      [userId]
    );
    return rows;
  },

  // ── Entries ─────────────────────────────────────────────────
  async upsertEntry(planId, { dayOfWeek, mealType, recipeId, recipeTitle, recipeImage, servings }) {
    await pool.query(
      `INSERT INTO meal_plan_entries (plan_id, day_of_week, meal_type, recipe_id, recipe_title, recipe_image, servings)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE recipe_id=VALUES(recipe_id), recipe_title=VALUES(recipe_title),
         recipe_image=VALUES(recipe_image), servings=VALUES(servings)`,
      [planId, dayOfWeek, mealType, recipeId, recipeTitle, recipeImage, servings]
    );
    const [rows] = await pool.query(
      'SELECT * FROM meal_plan_entries WHERE plan_id = ? AND day_of_week = ? AND meal_type = ?',
      [planId, dayOfWeek, mealType]
    );
    return rows[0];
  },

  async removeEntry(planId, entryId) {
    const [result] = await pool.query(
      'DELETE FROM meal_plan_entries WHERE id = ? AND plan_id = ?',
      [entryId, planId]
    );
    return result.affectedRows > 0;
  },

  async getPlanEntries(planId) {
    const [rows] = await pool.query(
      'SELECT * FROM meal_plan_entries WHERE plan_id = ?',
      [planId]
    );
    return rows;
  },

  async verifyPlanOwner(userId, planId) {
    const [rows] = await pool.query(
      'SELECT id FROM meal_plans WHERE id = ? AND user_id = ?',
      [planId, userId]
    );
    return rows.length > 0;
  },
};
