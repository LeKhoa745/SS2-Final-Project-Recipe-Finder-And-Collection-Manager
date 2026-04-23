import { spoonacularClient, cachedGet } from '../utils/apiClient.js';
import { MOCK_SEARCH_RESULTS } from '../utils/mockData.js';
import { logger } from '../utils/logger.js';
import { UserRecipeModel } from '../models/userRecipe.model.js';

const isMockEnabled = () => process.env.MOCK_API === 'true';
const shouldForceMockRecipes = () => process.env.FORCE_MOCK_RECIPES === 'true';

const isRecipeApiFallbackError = (err) => {
  return err.response?.status === 402 || err.code === 'ECONNREFUSED';
};

const logRecipeFallback = (err, context) => {
  logger.warn(`API Fallback triggered for ${context}: ${err.message}`);
};

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
    // Fetch community recipes matching the query (non-blocking)
    let communityResults = [];
    try {
      // If query is empty, we search for 'random' or 'featured' ones by just getting public ones without filters
      if (query) {
        communityResults = await UserRecipeModel.searchPublicSimple(query, 6);
      } else {
        // Get some 'featured' community recipes
        const res = await UserRecipeModel.searchPublic('', { page: 1, limit: 6 });
        communityResults = res.recipes || [];
      }

      // Transform community recipes into a card-friendly shape
      communityResults = communityResults.map(r => ({
        id: `community-${r.id}`,
        title: r.title,
        image: r.imageUrl,
        readyInMinutes: r.cookTimeMinutes,
        servings: r.servings,
        source: 'community',
        authorName: r.authorName,
      }));
    } catch (communityErr) {
      logger.warn('Community recipe search failed (non-fatal):', communityErr.message);
    }

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
          communityResults,
          page,
          limit,
          totalPages: 1,
        };
      }

      const params = buildSearchParams({ query, ingredients, cuisine, diet, type, page, limit });
      const data = await cachedGet(spoonacularClient, '/recipes/complexSearch', params, SEARCH_TTL);

      return {
        results:     data.results,
        totalResults: data.totalResults,
        communityResults,
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
          communityResults,
          page,
          limit,
          totalPages: 1,
        };
      }
      throw err;
    }
  },

  async getById(id) {
    // Detail logic...
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
      return null;
    }
  },

  async getSimilar(id) {
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
      return [];
    }
  },

  async getIngredients(id) {
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
      return [];
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
    return {
      mode: 'live',
      usingFallback: false,
      provider: 'spoonacular',
    };
  },
};
