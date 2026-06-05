import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema({
  ingredient_name: { type: String, required: true },
  amount: { type: Number },
  unit: { type: String },
  aisle: { type: String },
  is_checked: { type: Boolean, default: false }
});

const shoppingListSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan' },
  name: { type: String, default: 'Shopping List' },
  items: [shoppingItemSchema],
  generated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'generated_at', updatedAt: false }
});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

export const ShoppingModel = {
  async createList(userId, planId, name = 'Shopping List') {
    // Remove old list for same plan if exists
    if (planId) {
      await ShoppingList.deleteMany({ user_id: userId, plan_id: planId });
    }

    const list = new ShoppingList({ user_id: userId, plan_id: planId, name });
    await list.save();
    return list._id;
  },

  async bulkInsertItems(listId, items) {
    if (!items.length) return;
    const shoppingItems = items.map(i => ({
      ingredient_name: i.name,
      amount: i.amount || null,
      unit: i.unit || null,
      aisle: i.aisle || null
    }));

    await ShoppingList.findByIdAndUpdate(listId, {
      $push: { items: { $each: shoppingItems } }
    });
  },

  async getListWithItems(listId, userId) {
    if (!mongoose.Types.ObjectId.isValid(listId)) return null;
    const list = await ShoppingList.findOne({ _id: listId, user_id: userId }).lean();
    if (!list) return null;

    list.id = list._id.toString();
    if (list.items) {
      list.items.forEach(i => i.id = i._id.toString());
      // Sort by aisle
      list.items.sort((a, b) => (a.aisle || '').localeCompare(b.aisle || ''));
    }
    return list;
  },

  async getListsByUser(userId) {
    const lists = await ShoppingList.find({ user_id: userId }).sort({ generated_at: -1 }).lean();
    return lists.map(l => ({
      ...l,
      id: l._id.toString(),
      item_count: l.items ? l.items.length : 0
    }));
  },

  async toggleItem(itemId, userId, isChecked) {
    // This is a bit tricky with nested arrays. We need to find the list that contains the item and belongs to the user.
    const result = await ShoppingList.updateOne(
      { user_id: userId, 'items._id': itemId },
      { $set: { 'items.$.is_checked': isChecked } }
    );
    return result.modifiedCount > 0;
  },

  async deleteList(listId, userId) {
    if (!mongoose.Types.ObjectId.isValid(listId)) return false;
    const result = await ShoppingList.deleteOne({ _id: listId, user_id: userId });
    return result.deletedCount > 0;
  },
};
