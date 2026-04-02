import { apiClient } from './apiClient';

export const recipeService = {
  /**
   * Search recipes with filters.
   * /api/recipes/search?q=pizza&cuisine=Italian&page=1
   */
  async search(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/recipes/search?${query}`;
    return apiClient(endpoint);
  },

  /**
   * Get full recipe details by ID.
   * /api/recipes/716429
   */
  async getById(id) {
    return apiClient(`/recipes/${id}`);
  },

  /**
   * Get similar recipes for a specific recipe.
   */
  async getSimilar(id) {
    return apiClient(`/recipes/${id}/similar`);
  },
};
