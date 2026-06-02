import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe_id: { type: String, required: true },
  recipe_title: { type: String, required: true },
  recipe_image: { type: String },
  ready_in_min: { type: Number },
  servings: { type: Number },
  source_url: { type: String },
  saved_at: { type: Date, default: Date.now }
});

// Unique index for user_id + recipe_id
wishlistItemSchema.index({ user_id: 1, recipe_id: 1 }, { unique: true });

const deletedWishlistItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe_id: { type: String, required: true },
  recipe_title: { type: String, required: true },
  recipe_image: { type: String },
  deleted_at: { type: Date, default: Date.now }
});

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);
const DeletedWishlistItem = mongoose.model('DeletedWishlistItem', deletedWishlistItemSchema);

export const WishlistModel = {
  async findByUser(userId) {
    const items = await WishlistItem.find({ user_id: userId }).sort({ saved_at: -1 }).lean();
    return items.map(i => ({ ...i, id: i._id.toString() }));
  },

  async findOne(userId, recipeId) {
    const item = await WishlistItem.findOne({ user_id: userId, recipe_id: recipeId }).lean();
    if (item) item.id = item._id.toString();
    return item;
  },

  async add(userId, recipe) {
    const { recipeId, recipeTitle, recipeImage, readyInMinutes, servings, sourceUrl } = recipe;
    
    // Check if already exists to avoid unique constraint error
    const existing = await this.findOne(userId, recipeId);
    if (existing) return existing;

    const item = new WishlistItem({
      user_id: userId,
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      recipe_image: recipeImage,
      ready_in_min: readyInMinutes,
      servings: servings,
      source_url: sourceUrl
    });

    await item.save();
    return this.findOne(userId, recipeId);
  },

  async remove(userId, recipeId) {
    const item = await WishlistItem.findOne({ user_id: userId, recipe_id: recipeId });
    if (!item) return false;

    await DeletedWishlistItem.create({
      user_id: userId,
      recipe_id: recipeId,
      recipe_title: item.recipe_title,
      recipe_image: item.recipe_image
    });

    const result = await WishlistItem.deleteOne({ user_id: userId, recipe_id: recipeId });
    return result.deletedCount > 0;
  },

  async removeAll(userId) {
    const items = await WishlistItem.find({ user_id: userId });
    if (items.length === 0) return false;

    const deletedItems = items.map(i => ({
      user_id: userId,
      recipe_id: i.recipe_id,
      recipe_title: i.recipe_title,
      recipe_image: i.recipe_image
    }));

    await DeletedWishlistItem.insertMany(deletedItems);
    const result = await WishlistItem.deleteMany({ user_id: userId });
    return result.deletedCount > 0;
  },

  async count(userId) {
    return await WishlistItem.countDocuments({ user_id: userId });
  },
};
