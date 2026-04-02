import { apiClient } from './apiClient';

export const wishlistService = {
  /**
   * Get all wishlist items for current user.
   */
  async getAll() {
    return apiClient('/wishlist');
  },

  /**
   * Add a recipe to the wishlist.
   * /api/wishlist
   */
  async add(recipeData) {
    return apiClient('/wishlist', {
      method:  'POST',
      body:    JSON.stringify(recipeData),
    });
  },

  /**
   * Check if a recipe is in the wishlist.
   * /api/wishlist/check/716429
   */
  async check(recipeId) {
    return apiClient(`/wishlist/check/${recipeId}`);
  },

  /**
   * Remove a recipe from the wishlist.
   * /api/wishlist/716429
   */
  async remove(recipeId) {
    return apiClient(`/wishlist/${recipeId}`, {
      method:  'DELETE',
    });
  },
};
