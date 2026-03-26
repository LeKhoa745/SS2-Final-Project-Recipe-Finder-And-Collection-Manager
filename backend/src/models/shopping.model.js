import pool from '../config/db.js';

export const ShoppingModel = {
  async createList(userId, planId, name = 'Shopping List') {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Remove old list for same plan if exists
      if (planId) {
        await conn.query('DELETE FROM shopping_lists WHERE user_id = ? AND plan_id = ?', [userId, planId]);
      }

      const [result] = await conn.query(
        'INSERT INTO shopping_lists (user_id, plan_id, name) VALUES (?, ?, ?)',
        [userId, planId, name]
      );

      await conn.commit();
      return result.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async bulkInsertItems(listId, items) {
    if (!items.length) return;
    const values = items.map((i) => [listId, i.name, i.amount || null, i.unit || null, i.aisle || null]);
    await pool.query(
      'INSERT INTO shopping_items (list_id, ingredient_name, amount, unit, aisle) VALUES ?',
      [values]
    );
  },

  async getListWithItems(listId, userId) {
    const [lists] = await pool.query(
      'SELECT * FROM shopping_lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );
    if (!lists.length) return null;

    const [items] = await pool.query(
      'SELECT * FROM shopping_items WHERE list_id = ? ORDER BY aisle, ingredient_name',
      [listId]
    );
    return { ...lists[0], items };
  },

  async getListsByUser(userId) {
    const [rows] = await pool.query(
      'SELECT sl.*, COUNT(si.id) as item_count FROM shopping_lists sl LEFT JOIN shopping_items si ON si.list_id = sl.id WHERE sl.user_id = ? GROUP BY sl.id ORDER BY sl.generated_at DESC',
      [userId]
    );
    return rows;
  },

  async toggleItem(itemId, userId, isChecked) {
    const [result] = await pool.query(
      `UPDATE shopping_items si
       JOIN shopping_lists sl ON sl.id = si.list_id
       SET si.is_checked = ?
       WHERE si.id = ? AND sl.user_id = ?`,
      [isChecked ? 1 : 0, itemId, userId]
    );
    return result.affectedRows > 0;
  },

  async deleteList(listId, userId) {
    const [result] = await pool.query(
      'DELETE FROM shopping_lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );
    return result.affectedRows > 0;
  },
};
