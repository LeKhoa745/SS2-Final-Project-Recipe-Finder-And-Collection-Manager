import { spoonacularClient, cachedGet } from '../utils/apiClient.js';

const SEARCH_TTL = parseInt(process.env.CACHE_RECIPE_SEARCH_TTL) || 600;
const DETAIL_TTL = parseInt(process.env.CACHE_RECIPE_DETAIL_TTL) || 3600;

const isMockEnabled = () => process.env.USE_MOCK_DATA === 'true';

export const RecipeService = {
  async search({ query, ingredients, cuisine, diet, type, page = 1, limit = 12 }) {
    const params = {
      number: limit,
      offset: (page - 1) * limit,
      addRecipeInformation: true,
      fillIngredients: false,
      ...(query       && { query }),
      ...(ingredients && { includeIngredients: ingredients }),
      ...(cuisine     && { cuisine }),
      ...(diet        && { diet }),
      ...(type        && { type }),
    };

    const data = await cachedGet(
      spoonacularClient,
      '/recipes/complexSearch',
      params,
      SEARCH_TTL
    );

    return {
      results:     data.results,
      totalResults: data.totalResults,
      page,
      limit,
      totalPages:  Math.ceil(data.totalResults / limit),
    };
  },

  async getById(id) {
    return cachedGet(
      spoonacularClient,
      `/recipes/${id}/information`,
      { includeNutrition: true },
      DETAIL_TTL
    );
  },

  async getSimilar(id) {
    return cachedGet(
      spoonacularClient,
      `/recipes/${id}/similar`,
      { number: 6 },
      DETAIL_TTL
    );
  },

  async getIngredients(id) {
    const data = await cachedGet(
      spoonacularClient,
      `/recipes/${id}/ingredientWidget.json`,
      {},
      DETAIL_TTL
    );
    return data.ingredients || [];
  },

  // Fetch ingredients for multiple recipe IDs (used for shopping list generation)
  async getBulkIngredients(recipeIds) {
    const results = await Promise.allSettled(recipeIds.map((id) => this.getIngredients(id)));
    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .flat();
  },

  async getStatus() {
    if (shouldForceMockRecipes()) {
      return {
        mode: 'mock',
        usingFallback: true,
        provider: 'bundled-sample-data',
      };
    }

    return {
      mode: 'live',
      usingFallback: false,
      provider: 'spoonacular',
    };
  },
};
