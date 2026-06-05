import { spoonacularClient, cachedGet } from '../utils/apiClient.js';
import { MOCK_SEARCH_RESULTS } from '../utils/mockData.js';
import { logger } from '../utils/logger.js';
import { UserRecipeModel } from '../models/userRecipe.model.js';
import { RecipeCacheModel } from '../models/recipeCache.model.js';

const isMockEnabled = () => process.env.MOCK_API === 'true';

const isRecipeApiFallbackError = (err) => {
  return err.response?.status === 402 || err.code === 'ECONNREFUSED';
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
    const params = buildSearchParams({ query, ingredients, cuisine, diet, type, page, limit });
    const cacheKey = `search:${JSON.stringify(params)}`;

    // 1. Try DB Cache first
    const cachedData = await RecipeCacheModel.get(cacheKey);
    if (cachedData) {
      logger.info(`DB Cache HIT: ${cacheKey}`);
      // Still fetch community recipes to merge
      const communityResults = await this.getCommunityRecipes(query);
      return { ...cachedData, communityResults, source: 'cache' };
    }

    // Fetch community recipes (non-blocking)
    const communityResults = await this.getCommunityRecipes(query);

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

      // 2. Fetch from API
      const data = await cachedGet(spoonacularClient, '/recipes/complexSearch', params, SEARCH_TTL);

      const result = {
        results:     data.results,
        totalResults: data.totalResults,
        communityResults,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil((data.totalResults || 0) / limit)),
        source: 'live',
      };

      // 3. Save to DB Cache for future use
      await RecipeCacheModel.set(cacheKey, result, 'search');

      return result;
    } catch (err) {
      if (err.response?.status === 402) {
        logger.warn('Spoonacular API limit reached (402). Falling back to DB Cache or Mock Data.');
        
        // 4. Fallback to DB search (best effort)
        const dbFallback = await RecipeCacheModel.searchCached(query || '', limit);
        if (dbFallback.length > 0) {
          return {
            results: dbFallback,
            totalResults: dbFallback.length,
            communityResults,
            page,
            limit,
            totalPages: 1,
            source: 'db-fallback'
          };
        }

        // Final fallback to mock
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
          source: 'mock-fallback'
        };
      }
      throw err;
    }
  },

  async getCommunityRecipes(query) {
    try {
      let communityResults = [];
      if (query) {
        communityResults = await UserRecipeModel.searchPublicSimple(query, 6);
      } else {
        const res = await UserRecipeModel.searchPublic('', { page: 1, limit: 6 });
        communityResults = res.recipes || [];
      }

      return communityResults.map(r => ({
        id: `community-${r.id}`,
        title: r.title,
        image: r.imageUrl,
        readyInMinutes: r.cookTimeMinutes,
        servings: r.servings,
        source: 'community',
        authorName: r.authorName,
      }));
    } catch (err) {
      logger.warn('Community recipe search failed:', err.message);
      return [];
    }
  },

  async getById(id) {
    const cacheKey = `detail:${id}`;
    const cachedData = await RecipeCacheModel.get(cacheKey);
    if (cachedData) return { ...cachedData, source: 'cache' };

    try {
      const recipe = await cachedGet(
        spoonacularClient,
        `/recipes/${id}/information`,
        { includeNutrition: true },
        DETAIL_TTL
      );

      if (recipe) {
        await RecipeCacheModel.set(cacheKey, recipe, 'detail');
        return { ...recipe, source: 'live' };
      }
      return null;
    } catch (error) {
      if (!isRecipeApiFallbackError(error)) throw error;
      return null;
    }
  },

  async getSimilar(id) {
    const cacheKey = `similar:${id}`;
    const cachedData = await RecipeCacheModel.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const recipes = await cachedGet(
        spoonacularClient,
        `/recipes/${id}/similar`,
        { number: 6 },
        DETAIL_TTL
      );

      if (Array.isArray(recipes)) {
        const formatted = recipes.map((recipe) => ({ ...recipe, source: 'live' }));
        await RecipeCacheModel.set(cacheKey, formatted, 'similar');
        return formatted;
      }
      return [];
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
