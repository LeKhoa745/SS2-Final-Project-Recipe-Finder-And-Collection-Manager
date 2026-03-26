import { NewsService } from '../services/news.service.js';
import { sendSuccess } from '../utils/response.js';

export const NewsController = {
  // GET /api/news?category=health&page=1&limit=12
  async getNews(req, res, next) {
    try {
      const { category, page, limit } = req.query;
      const result = await NewsService.getNews({
        category,
        page:  parseInt(page)  || 1,
        limit: parseInt(limit) || 12,
      });
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // GET /api/news/headlines
  async getHeadlines(req, res, next) {
    try {
      const result = await NewsService.getTopHeadlines();
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
