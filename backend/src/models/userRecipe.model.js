import mongoose from 'mongoose';

const userRecipeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  image_url: { type: String },
  ingredients: { type: mongoose.Schema.Types.Mixed, required: true }, // Array of {name, amount, unit}
  instructions: { type: mongoose.Schema.Types.Mixed, required: true }, // Array of strings
  cuisine: { type: String },
  cook_time_minutes: { type: Number },
  servings: { type: Number, default: 2 },
  is_public: { type: Boolean, default: true },
  author_name: { type: String }, // Denormalized for search
  author_avatar: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Full-text index for search
userRecipeSchema.index({ title: 'text', description: 'text' });

const deletedUserRecipeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  original_recipe_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  deleted_at: { type: Date, default: Date.now }
});

const UserRecipe = mongoose.model('UserRecipe', userRecipeSchema);
const DeletedUserRecipe = mongoose.model('DeletedUserRecipe', deletedUserRecipeSchema);

export const UserRecipeModel = {
  async create(userId, data) {
    const {
      title, description, imageUrl, ingredients, instructions,
      cuisine, cookTimeMinutes, servings, isPublic = true,
    } = data;

    // Get user info for denormalization
    const User = mongoose.model('User');
    const user = await User.findById(userId);

    const recipe = new UserRecipe({
      user_id: userId,
      title,
      description,
      image_url: imageUrl,
      ingredients,
      instructions,
      cuisine,
      cook_time_minutes: cookTimeMinutes,
      servings,
      is_public: isPublic,
      author_name: user?.name,
      author_avatar: user?.avatar
    });

    await recipe.save();
    return this.findById(recipe._id);
  },

  async update(id, userId, data) {
    const {
      title, description, imageUrl, ingredients, instructions,
      cuisine, cookTimeMinutes, servings, isPublic,
    } = data;

    const update = {
      title,
      description,
      image_url: imageUrl,
      ingredients,
      instructions,
      cuisine,
      cook_time_minutes: cookTimeMinutes,
      servings,
      is_public: isPublic,
    };

    const recipe = await UserRecipe.findOneAndUpdate(
      { _id: id, user_id: userId },
      update,
      { new: true }
    );

    return recipe ? this.findById(recipe._id) : null;
  },

  async delete(id, userId) {
    const recipe = await UserRecipe.findOne({ _id: id, user_id: userId });
    if (!recipe) return false;

    await DeletedUserRecipe.create({
      user_id: userId,
      original_recipe_id: id,
      title: recipe.title
    });

    const result = await UserRecipe.deleteOne({ _id: id, user_id: userId });
    return result.deletedCount > 0;
  },

  async deleteAll(userId) {
    const recipes = await UserRecipe.find({ user_id: userId });
    if (recipes.length === 0) return false;

    const deletedRecords = recipes.map(r => ({
      user_id: userId,
      original_recipe_id: r._id,
      title: r.title
    }));

    await DeletedUserRecipe.insertMany(deletedRecords);
    const result = await UserRecipe.deleteMany({ user_id: userId });
    return result.deletedCount > 0;
  },

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const recipe = await UserRecipe.findById(id).populate('user_id', 'name avatar').lean();
    if (!recipe) return null;
    return this._format(recipe);
  },

  async findByUser(userId, { page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit;
    const recipes = await UserRecipe.find({ user_id: userId })
      .populate('user_id', 'name avatar')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserRecipe.countDocuments({ user_id: userId });

    return {
      recipes: recipes.map(this._format),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async searchPublic(query, { page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit;
    let filter = { is_public: true };

    if (query && query.trim()) {
      const q = query.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { author_name: { $regex: q, $options: 'i' } }
      ];
    }

    const recipes = await UserRecipe.find(filter)
      .populate('user_id', 'name avatar')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserRecipe.countDocuments(filter);

    return {
      recipes: recipes.map(this._format),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async searchPublicSimple(query, limit = 6) {
    if (!query || !query.trim()) return [];
    const recipes = await UserRecipe.find({
      is_public: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { author_name: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('user_id', 'name avatar')
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

    return recipes.map(this._format);
  },

  _format(doc) {
    return {
      id: doc._id.toString(),
      userId: doc.user_id._id || doc.user_id,
      title: doc.title,
      description: doc.description,
      imageUrl: doc.image_url,
      ingredients: doc.ingredients,
      instructions: doc.instructions,
      cuisine: doc.cuisine,
      cookTimeMinutes: doc.cook_time_minutes,
      servings: doc.servings,
      isPublic: !!doc.is_public,
      authorName: doc.author_name || (doc.user_id && doc.user_id.name),
      authorAvatar: doc.author_avatar || (doc.user_id && doc.user_id.avatar),
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      source: 'community',
    };
  },
};
