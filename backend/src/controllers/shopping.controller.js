import { ShoppingService } from '../services/shopping.service.js';
import { sendSuccess } from '../utils/response.js';

export const ShoppingController = {
  // GET /api/shopping
  async getAllLists(req, res, next) {
    try {
      const lists = await ShoppingService.getUserLists(req.user.id);
      sendSuccess(res, { lists });
    } catch (err) { next(err); }
  },

  // GET /api/shopping/:listId
  async getList(req, res, next) {
    try {
      const list = await ShoppingService.getList(req.user.id, req.params.listId);
      sendSuccess(res, { list });
    } catch (err) { next(err); }
  },

  // POST /api/shopping/generate/:planId
  async generate(req, res, next) {
    try {
      const list = await ShoppingService.generateFromPlan(req.user.id, req.params.planId);
      sendSuccess(res, { list }, 'Shopping list generated', 201);
    } catch (err) { next(err); }
  },

  // PATCH /api/shopping/item/:itemId
  // Body: { isChecked: true/false }
  async toggleItem(req, res, next) {
    try {
      const result = await ShoppingService.toggleItem(
        req.user.id,
        req.params.itemId,
        req.body.isChecked
      );
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // DELETE /api/shopping/:listId
  async deleteList(req, res, next) {
    try {
      await ShoppingService.deleteList(req.user.id, req.params.listId);
      sendSuccess(res, {}, 'Shopping list deleted');
    } catch (err) { next(err); }
  },
};
