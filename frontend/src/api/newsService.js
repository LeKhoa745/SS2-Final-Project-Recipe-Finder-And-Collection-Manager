import { apiClient } from './apiClient';

export const newsService = {
  /**
   * Fetch top headlines for food/healthy news.
   */
  async getHeadlines() {
    return apiClient('/news/headlines');
  },

  /**
   * Search for specific news by category or query.
   */
  async getNews(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/news?${query}`;
    return apiClient(endpoint);
  },
};
