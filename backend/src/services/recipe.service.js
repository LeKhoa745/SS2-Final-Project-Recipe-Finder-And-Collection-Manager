import { spoonacularClient, cachedGet } from '../utils/apiClient.js';
import { MOCK_SEARCH_RESULTS, MOCK_RECIPE_DETAILS, MOCK_SIMILAR_RECIPES } from '../utils/mockData.js';
import { logger } from '../utils/logger.js';

const SEARCH_TTL = parseInt(process.env.CACHE_RECIPE_SEARCH_TTL, 10) || 600;
const DETAIL_TTL = parseInt(process.env.CACHE_RECIPE_DETAIL_TTL, 10) || 3600;

function buildSearchParams({ query, ingredients, cuisine, diet, type, page, limit }) {
  return {
    number: limit,
    offset: (page - 1) * limit,
    addRecipeInformation: true,
    fillIngredients: false,
    ...(query && { query }),
    ...(ingredients && { includeIngredients: ingredients }),
    ...(cuisine && { cuisine }),
    ...(diet && { diet }),
    ...(type && { type }),
  };
}

export const RecipeService = {
  async search({ query, ingredients, cuisine, diet, type, page = 1, limit = 12 }) {
    try {
      if (isMockEnabled()) {
        logger.info('Using Mock Data for recipe search');
        let filteredResults = MOCK_SEARCH_RESULTS;
        if (query) {
          const q = query.toLowerCase();
          filteredResults = MOCK_SEARCH_RESULTS.filter(r => r.title.toLowerCase().includes(q));
        }
        return {
          results: filteredResults,
          totalResults: filteredResults.length,
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
        totalPages: Math.max(1, Math.ceil((data.totalResults || 0) / limit)),
        source: 'live',
      };
    } catch (err) {
      if (err.response?.status === 402) {
        logger.warn('Spoonacular API limit reached (402). Falling back to Mock Data.');
        let filteredResults = MOCK_SEARCH_RESULTS;
        if (query) {
          const q = query.toLowerCase();
          filteredResults = MOCK_SEARCH_RESULTS.filter(r => r.title.toLowerCase().includes(q));
        }
        return {
          results: filteredResults,
          totalResults: filteredResults.length,
          page,
          limit,
          totalPages: 1,
        };
      }
      throw err;
    }
  },

  async getById(id) {
    if (shouldForceMockRecipes()) {
      return MockRecipeService.getById(id);
    }

    try {
      const recipe = await cachedGet(
        spoonacularClient,
        `/recipes/${id}/information`,
        { includeNutrition: true },
        DETAIL_TTL
      );

      return recipe ? { ...recipe, source: 'live' } : null;
    } catch (error) {
      if (!isRecipeApiFallbackError(error)) throw error;
      logRecipeFallback(error, `detail:${id}`);
      return MockRecipeService.getById(id);
    }
  },

  async getSimilar(id) {
    if (shouldForceMockRecipes()) {
      return MockRecipeService.getSimilar(id);
    }

    try {
      const recipes = await cachedGet(
        spoonacularClient,
        `/recipes/${id}/similar`,
        { number: 6 },
        DETAIL_TTL
      );

      return Array.isArray(recipes)
        ? recipes.map((recipe) => ({ ...recipe, source: 'live' }))
        : [];
    } catch (error) {
      if (!isRecipeApiFallbackError(error)) throw error;
      logRecipeFallback(error, `similar:${id}`);
      return MockRecipeService.getSimilar(id);
    }
  },

  async getIngredients(id) {
    if (shouldForceMockRecipes()) {
      return MockRecipeService.getIngredients(id);
    }

    try {
      const data = await cachedGet(
        spoonacularClient,
        `/recipes/${id}/ingredientWidget.json`,
        {},
        DETAIL_TTL
      );

      return data.ingredients || [];
    } catch (error) {
      if (!isRecipeApiFallbackError(error)) throw error;
      logRecipeFallback(error, `ingredients:${id}`);
      return MockRecipeService.getIngredients(id);
    }
  },

  async getBulkIngredients(recipeIds) {
    const results = await Promise.allSettled(recipeIds.map((id) => this.getIngredients(id)));
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
      .flat();
  },

  async getStatus() {
    if (shouldForceMockRecipes()) {
      return {
        mode: 'mock',
        usingFallback: true,
        provider: 'bundled-sample-data',
        ...MockRecipeService.getStatus(),
      };
    }

    return {
      mode: 'live',
      usingFallback: false,
      provider: 'spoonacular',
    };
  },
};
