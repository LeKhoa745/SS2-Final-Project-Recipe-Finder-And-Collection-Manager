import pool from '../config/db.js';

export const WishlistModel = {
  async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM wishlist_items WHERE user_id = ? ORDER BY saved_at DESC',
      [userId]
    );
    return rows;
  },

  async findOne(userId, recipeId) {
    const [rows] = await pool.query(
      'SELECT * FROM wishlist_items WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );
    return rows[0] || null;
  },

  async add(userId, recipe) {
    const { recipeId, recipeTitle, recipeImage, readyInMinutes, servings, sourceUrl } = recipe;
    const [result] = await pool.query(
      `INSERT INTO wishlist_items (user_id, recipe_id, recipe_title, recipe_image, ready_in_min, servings, source_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, recipeId, recipeTitle, recipeImage, readyInMinutes, servings, sourceUrl]
    );
    return this.findOne(userId, recipeId);
  },

  async remove(userId, recipeId) {
    // 1. Copy to deleted_wishlist_items
    await pool.query(
      `INSERT INTO deleted_wishlist_items (user_id, recipe_id, recipe_title, recipe_image)
       SELECT user_id, recipe_id, recipe_title, recipe_image 
       FROM wishlist_items 
       WHERE user_id = ? AND recipe_id = ?`,
      [userId, recipeId]
    );

    // 2. Remove
    const [result] = await pool.query(
      'DELETE FROM wishlist_items WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );
    return result.affectedRows > 0;
  },

  async removeAll(userId) {
    // 1. Copy all to deleted_wishlist_items
    await pool.query(
      `INSERT INTO deleted_wishlist_items (user_id, recipe_id, recipe_title, recipe_image)
       SELECT user_id, recipe_id, recipe_title, recipe_image 
       FROM wishlist_items 
       WHERE user_id = ?`,
      [userId]
    );

    // 2. Remove all
    const [result] = await pool.query(
      'DELETE FROM wishlist_items WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },

  async count(userId) {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) as total FROM wishlist_items WHERE user_id = ?',
      [userId]
    );
    return row.total;
  },
};
