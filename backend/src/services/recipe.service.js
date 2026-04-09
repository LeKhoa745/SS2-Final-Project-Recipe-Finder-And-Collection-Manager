import { spoonacularClient, cachedGet } from '../utils/apiClient.js';
import { MOCK_SEARCH_RESULTS, MOCK_RECIPE_DETAILS, MOCK_SIMILAR_RECIPES } from '../utils/mockData.js';
import { logger } from '../utils/logger.js';

const SEARCH_TTL = parseInt(process.env.CACHE_RECIPE_SEARCH_TTL) || 600;
const DETAIL_TTL = parseInt(process.env.CACHE_RECIPE_DETAIL_TTL) || 3600;

const isMockEnabled = () => process.env.USE_MOCK_DATA === 'true';

export const RecipeService = {
  async search({ query, ingredients, cuisine, diet, type, page = 1, limit = 12 }) {
    try {
      if (isMockEnabled()) {
        logger.info('Using Mock Data for recipe search');
        return {
          results: MOCK_SEARCH_RESULTS,
          totalResults: MOCK_SEARCH_RESULTS.length,
          page,
          limit,
          totalPages: 1,
        };
      }

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

      const data = await cachedGet(spoonacularClient, '/recipes/complexSearch', params, SEARCH_TTL);

      return {
        results:     data.results,
        totalResults: data.totalResults,
        page,
        limit,
        totalPages:  Math.ceil(data.totalResults / limit),
      };
    } catch (err) {
      if (err.response?.status === 402) {
        logger.warn('Spoonacular API limit reached (402). Falling back to Mock Data.');
        return {
          results: MOCK_SEARCH_RESULTS,
          totalResults: MOCK_SEARCH_RESULTS.length,
          page,
          limit,
          totalPages: 1,
        };
      }
      throw err;
    }
  },

  async getById(id) {
    try {
      if (isMockEnabled()) {
        logger.info(`Using Mock Data for recipe detail: ${id}`);
        return MOCK_RECIPE_DETAILS[id] || Object.values(MOCK_RECIPE_DETAILS)[0];
      }

      return await cachedGet(spoonacularClient, `/recipes/${id}/information`, { includeNutrition: true }, DETAIL_TTL);
    } catch (err) {
      if (err.response?.status === 402) {
        logger.warn(`Spoonacular API limit reached (402). Falling back to Mock Data for ID: ${id}`);
        return MOCK_RECIPE_DETAILS[id] || Object.values(MOCK_RECIPE_DETAILS)[0];
      }
      throw err;
    }
  },

  async getSimilar(id) {
    try {
      if (isMockEnabled()) {
        return MOCK_SIMILAR_RECIPES;
      }
      return await cachedGet(spoonacularClient, `/recipes/${id}/similar`, { number: 6 }, DETAIL_TTL);
    } catch (err) {
      if (err.response?.status === 402) {
        return MOCK_SIMILAR_RECIPES;
      }
      throw err;
    }
  },

  async getIngredients(id) {
    try {
      if (isMockEnabled()) {
        const recipe = MOCK_RECIPE_DETAILS[id] || Object.values(MOCK_RECIPE_DETAILS)[0];
        return recipe.extendedIngredients || [];
      }
      const data = await cachedGet(spoonacularClient, `/recipes/${id}/ingredientWidget.json`, {}, DETAIL_TTL);
      return data.ingredients || [];
    } catch (err) {
      if (err.response?.status === 402) {
        const recipe = MOCK_RECIPE_DETAILS[id] || Object.values(MOCK_RECIPE_DETAILS)[0];
        return recipe.extendedIngredients || [];
      }
      throw err;
    }
  },

  async getBulkIngredients(recipeIds) {
    const results = await Promise.allSettled(recipeIds.map((id) => this.getIngredients(id)));
    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .flat();
  },
};
