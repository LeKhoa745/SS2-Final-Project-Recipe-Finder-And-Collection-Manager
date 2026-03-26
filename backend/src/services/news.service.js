import { newsClient, cachedGet } from '../utils/apiClient.js';

const NEWS_TTL = parseInt(process.env.CACHE_NEWS_TTL) || 21600; // 6 hours

const CULINARY_QUERIES = {
  general:    'cooking OR recipe OR food',
  health:     'healthy eating OR nutrition OR diet',
  trends:     'food trends OR culinary 2024',
  restaurant: 'restaurant OR chef OR cuisine',
};

export const NewsService = {
  async getNews({ category = 'general', page = 1, limit = 12 } = {}) {
    const q = CULINARY_QUERIES[category] || CULINARY_QUERIES.general;

    const data = await cachedGet(
      newsClient,
      '/everything',
      {
        q,
        language:   'en',
        sortBy:     'publishedAt',
        pageSize:   limit,
        page,
      },
      NEWS_TTL
    );

    return {
      articles:    data.articles.filter((a) => a.title !== '[Removed]'),
      totalResults: data.totalResults,
      page,
      limit,
      category,
    };
  },

  async getTopHeadlines({ country = 'us', page = 1 } = {}) {
    return cachedGet(
      newsClient,
      '/top-headlines',
      { country, category: 'health', pageSize: 10, page },
      NEWS_TTL
    );
  },
};
