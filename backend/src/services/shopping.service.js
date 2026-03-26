import { PlannerModel } from '../models/planner.model.js';
import { ShoppingModel } from '../models/shopping.model.js';
import { RecipeService } from './recipe.service.js';
import { NotFoundError } from '../utils/errors.js';

// ── Ingredient consolidation ───────────────────────────────────
// Merges duplicate ingredients: "2 cups flour" + "1.5 cups flour" → "3.5 cups flour"
function consolidateIngredients(rawIngredients) {
  const map = new Map();

  for (const item of rawIngredients) {
    const key = `${item.name?.toLowerCase().trim()}|${item.unit?.toLowerCase().trim() || ''}`;

    if (map.has(key)) {
      const existing = map.get(key);
      existing.amount = (parseFloat(existing.amount) || 0) + (parseFloat(item.amount) || 0);
    } else {
      map.set(key, {
        name:   item.name,
        amount: parseFloat(item.amount) || null,
        unit:   item.unit || null,
        aisle:  item.aisle || null,
      });
    }
  }

  return Array.from(map.values()).map((i) => ({
    ...i,
    amount: i.amount ? parseFloat(i.amount.toFixed(2)) : null,
  }));
}

export const ShoppingService = {
  async generateFromPlan(userId, planId) {
    // Verify ownership
    const isOwner = await PlannerModel.verifyPlanOwner(userId, planId);
    if (!isOwner) throw new NotFoundError('Meal plan');

    const entries = await PlannerModel.getPlanEntries(planId);
    if (!entries.length) {
      throw new Error('Meal plan has no entries to generate a shopping list from');
    }

    // Fetch ingredients for every recipe in the plan
    const recipeIds = [...new Set(entries.map((e) => e.recipe_id))];
    const rawIngredients = await RecipeService.getBulkIngredients(recipeIds);

    // Consolidate duplicates
    const consolidated = consolidateIngredients(rawIngredients);

    // Persist to DB (replaces any existing list for this plan)
    const listId = await ShoppingModel.createList(userId, planId, 'Weekly Shopping List');
    await ShoppingModel.bulkInsertItems(listId, consolidated);

    return ShoppingModel.getListWithItems(listId, userId);
  },

  async getList(userId, listId) {
    const list = await ShoppingModel.getListWithItems(listId, userId);
    if (!list) throw new NotFoundError('Shopping list');
    return list;
  },

  async getUserLists(userId) {
    return ShoppingModel.getListsByUser(userId);
  },

  async toggleItem(userId, itemId, isChecked) {
    const updated = await ShoppingModel.toggleItem(itemId, userId, isChecked);
    if (!updated) throw new NotFoundError('Shopping item');
    return { itemId, isChecked };
  },

  async deleteList(userId, listId) {
    const deleted = await ShoppingModel.deleteList(listId, userId);
    if (!deleted) throw new NotFoundError('Shopping list');
  },
};
