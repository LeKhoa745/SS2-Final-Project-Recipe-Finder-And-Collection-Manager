import { spoonacularClient, cachedGet } from '../utils/apiClient.js';
import { MockRecipeService } from './mockRecipe.service.js';
import { isRecipeApiFallbackError, logRecipeFallback, shouldForceMockRecipes } from '../utils/recipeSource.js';

const SEARCH_TTL = parseInt(process.env.CACHE_RECIPE_SEARCH_TTL) || 600;
const DETAIL_TTL = parseInt(process.env.CACHE_RECIPE_DETAIL_TTL) || 3600;

export const RecipeService = {
  async search({ query, ingredients, cuisine, diet, type, page = 1, limit = 12 }) {
    if (shouldForceMockRecipes()) {
      return MockRecipeService.search({ query, ingredients, cuisine, diet, type, page, limit });
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

    try {
      const data = await cachedGet(
        spoonacularClient,
        '/recipes/complexSearch',
        params,
        SEARCH_TTL
      );

      return {
        results: data.results,
        totalResults: data.totalResults,
        page,
        limit,
        totalPages: Math.ceil(data.totalResults / limit),
        source: 'live',
      };
    } catch (error) {
      if (!isRecipeApiFallbackError(error)) throw error;
      logRecipeFallback(error, 'search');
      return MockRecipeService.search({ query, ingredients, cuisine, diet, type, page, limit });
    }
  },

  async getById(id) {
    if (shouldForceMockRecipes()) {
      return MockRecipeService.getById(id);
    }

    try {
      return await cachedGet(
        spoonacularClient,
        `/recipes/${id}/information`,
        { includeNutrition: true },
        DETAIL_TTL
      );
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
      return await cachedGet(
        spoonacularClient,
        `/recipes/${id}/similar`,
        { number: 6 },
        DETAIL_TTL
      );
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

  // Fetch ingredients for multiple recipe IDs (used for shopping list generation)
  async getBulkIngredients(recipeIds) {
    const results = await Promise.allSettled(
      recipeIds.map((id) => this.getIngredients(id))
    );
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
