import pool from '../config/db.js';

export const UserRecipeModel = {
  /**
   * Create a new user recipe.
   */
  async create(userId, data) {
    const {
      title, description, imageUrl, ingredients, instructions,
      cuisine, cookTimeMinutes, servings, isPublic = true,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO user_recipes
         (user_id, title, description, image_url, ingredients, instructions,
          cuisine, cook_time_minutes, servings, is_public)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, title, description || null, imageUrl || null,
        JSON.stringify(ingredients), JSON.stringify(instructions),
        cuisine || null, cookTimeMinutes || null, servings || 2,
        isPublic ? 1 : 0,
      ]
    );
    return this.findById(result.insertId);
  },

  /**
   * Update an existing recipe (only if owned by userId).
   */
  async update(id, userId, data) {
    const {
      title, description, imageUrl, ingredients, instructions,
      cuisine, cookTimeMinutes, servings, isPublic,
    } = data;

    await pool.query(
      `UPDATE user_recipes SET
         title = ?, description = ?, image_url = ?, ingredients = ?, instructions = ?,
         cuisine = ?, cook_time_minutes = ?, servings = ?, is_public = ?
       WHERE id = ? AND user_id = ?`,
      [
        title, description || null, imageUrl || null,
        JSON.stringify(ingredients), JSON.stringify(instructions),
        cuisine || null, cookTimeMinutes || null, servings || 2,
        isPublic ? 1 : 0,
        id, userId,
      ]
    );
    return this.findById(id);
  },

  /**
   * Delete a recipe (only if owned by userId).
   */
  async delete(id, userId) {
    // 1. Copy to deleted_user_recipes
    await pool.query(
      `INSERT INTO deleted_user_recipes (user_id, original_recipe_id, title)
       SELECT user_id, id, title 
       FROM user_recipes 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    // 2. Remove
    const [result] = await pool.query(
      'DELETE FROM user_recipes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete all recipes owned by userId.
   */
  async deleteAll(userId) {
    // 1. Copy all to deleted_user_recipes
    await pool.query(
      `INSERT INTO deleted_user_recipes (user_id, original_recipe_id, title)
       SELECT user_id, id, title 
       FROM user_recipes 
       WHERE user_id = ?`,
      [userId]
    );

    // 2. Remove all
    const [result] = await pool.query(
      'DELETE FROM user_recipes WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Find a single recipe by ID, joining with user name.
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS author_name, u.avatar AS author_avatar
       FROM user_recipes r
       JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    return this._format(rows[0]);
  },

  /**
   * List recipes by a specific user (owner view — includes private).
   */
  async findByUser(userId, { page = 1, limit = 12 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS author_name, u.avatar AS author_avatar
       FROM user_recipes r
       JOIN users u ON u.id = r.user_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM user_recipes WHERE user_id = ?',
      [userId]
    );
    return {
      recipes: rows.map(this._format),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Full-text search across public user recipes.
   */
  async searchPublic(query, { page = 1, limit = 12 } = {}) {
    const offset = (page - 1) * limit;

    let where = 'r.is_public = 1';
    const params = [];

    if (query && query.trim()) {
      where += ' AND MATCH(r.title, r.description) AGAINST(? IN BOOLEAN MODE)';
      // Append wildcard so partial words match
      params.push(query.trim().split(/\s+/).map(w => `+${w}*`).join(' '));
    }

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS author_name, u.avatar AS author_avatar
       FROM user_recipes r
       JOIN users u ON u.id = r.user_id
       WHERE ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countParams = query && query.trim()
      ? [query.trim().split(/\s+/).map(w => `+${w}*`).join(' ')]
      : [];
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM user_recipes r WHERE ${where}`,
      countParams
    );

    return {
      recipes: rows.map(this._format),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Quick LIKE-based search used for merging into Spoonacular results.
   */
  async searchPublicSimple(query, limit = 6) {
    if (!query || !query.trim()) return [];
    const like = `%${query.trim()}%`;
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS author_name, u.avatar AS author_avatar
       FROM user_recipes r
       JOIN users u ON u.id = r.user_id
       WHERE r.is_public = 1 AND (r.title LIKE ? OR r.description LIKE ?)
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [like, like, limit]
    );
    return rows.map(this._format);
  },

  /**
   * Normalise a database row into a clean object.
   */
  _format(row) {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
      instructions: typeof row.instructions === 'string' ? JSON.parse(row.instructions) : row.instructions,
      cuisine: row.cuisine,
      cookTimeMinutes: row.cook_time_minutes,
      servings: row.servings,
      isPublic: !!row.is_public,
      authorName: row.author_name,
      authorAvatar: row.author_avatar,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      source: 'community',
    };
  },
};
