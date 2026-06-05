import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const recipeCacheSchema = new mongoose.Schema({
  cache_key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['search', 'detail', 'similar', 'ingredients'], required: true },
  created_at: { type: Date, default: Date.now }
});

const RecipeCache = mongoose.model('RecipeCache', recipeCacheSchema);

export const RecipeCacheModel = {
  async get(key) {
    try {
      const row = await RecipeCache.findOne({ cache_key: key }).lean();
      if (!row) return null;
      return row.data;
    } catch (err) {
      logger.error('Error getting recipe cache:', err);
      return null;
    }
  },

  async set(key, data, type) {
    try {
      await RecipeCache.findOneAndUpdate(
        { cache_key: key },
        { data, type, created_at: new Date() },
        { upsert: true, new: true }
      );
      return true;
    } catch (err) {
      logger.error('Error setting recipe cache:', err);
      return false;
    }
  },

  async searchCached(query, limit = 12) {
    try {
      // Basic fallback search
      const rows = await RecipeCache.find({
        type: 'detail',
        $or: [
          { 'data.title': { $regex: query, $options: 'i' } },
          { 'data.summary': { $regex: query, $options: 'i' } }
        ]
      }).limit(limit).lean();
      
      return rows.map(r => r.data);
    } catch (err) {
      logger.error('Error searching recipe cache:', err);
      return [];
    }
  }
};
