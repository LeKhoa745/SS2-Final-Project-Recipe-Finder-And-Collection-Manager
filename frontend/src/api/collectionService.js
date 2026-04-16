import { apiClient } from './apiClient';

export const collectionService = {
  /**
   * Create a new community recipe.
   */
  async createRecipe(data) {
    return apiClient('/collection', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get the logged-in user's own recipes.
   */
  async getMyRecipes(page = 1) {
    return apiClient(`/collection/mine?page=${page}`);
  },

  /**
   * Search public community recipes.
   */
  async searchPublic(query, page = 1) {
    const params = new URLSearchParams({ page });
    if (query) params.set('q', query);
    return apiClient(`/collection/public?${params}`);
  },

  /**
   * Get a single community recipe by ID.
   */
  async getById(id) {
    return apiClient(`/collection/${id}`);
  },

  /**
   * Update an existing community recipe.
   */
  async updateRecipe(id, data) {
    return apiClient(`/collection/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a community recipe.
   */
  async deleteRecipe(id) {
    return apiClient(`/collection/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Delete all community recipes owned by the user.
   */
  async deleteAll() {
    return apiClient(`/collection/all`, {
      method: 'DELETE',
    });
  },
};
