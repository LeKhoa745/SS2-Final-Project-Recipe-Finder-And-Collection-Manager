import pool from '../config/db.js';
import { logger } from '../utils/logger.js';

export const RecipeCacheModel = {
  async get(key) {
    try {
      const [rows] = await pool.execute(
        'SELECT data FROM recipe_cache WHERE cache_key = ? LIMIT 1',
        [key]
      );
      if (rows.length === 0) return null;
      return JSON.parse(rows[0].data);
    } catch (err) {
      logger.error('Error getting recipe cache:', err);
      return null;
    }
  },

  async set(key, data, type) {
    try {
      const jsonData = JSON.stringify(data);
      await pool.execute(
        'INSERT INTO recipe_cache (cache_key, data, type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = ?, type = ?',
        [key, jsonData, type, jsonData, type]
      );
      return true;
    } catch (err) {
      logger.error('Error setting recipe cache:', err);
      return false;
    }
  },

  async searchCached(query, limit = 12) {
    try {
      // Very simple search on cached results
      // We look for keys that were 'search' type and contain the query in the data
      // This is a "best effort" fallback
      const [rows] = await pool.execute(
        "SELECT data FROM recipe_cache WHERE type = 'detail' AND data LIKE ? LIMIT ?",
        [`%${query}%`, limit]
      );
      
      return rows.map(r => JSON.parse(r.data));
    } catch (err) {
      logger.error('Error searching recipe cache:', err);
      return [];
    }
  }
};
