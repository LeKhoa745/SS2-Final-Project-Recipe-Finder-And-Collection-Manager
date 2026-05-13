import mongoose from 'mongoose';

const mealPlanEntrySchema = new mongoose.Schema({
  day_of_week: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  meal_type: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true 
  },
  recipe_id: { type: String, required: true },
  recipe_title: { type: String, required: true },
  recipe_image: { type: String },
  servings: { type: Number, default: 1 }
});

const mealPlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  week_start: { type: Date, required: true },
  name: { type: String, default: 'My Meal Plan' },
  entries: [mealPlanEntrySchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Ensure unique plan per user per week
mealPlanSchema.index({ user_id: 1, week_start: 1 }, { unique: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export const PlannerModel = {
  async findOrCreatePlan(userId, weekStart) {
    let plan = await MealPlan.findOne({ user_id: userId, week_start: weekStart }).lean();
    if (plan) {
      plan.id = plan._id.toString();
      return plan;
    }

    const newPlan = new MealPlan({ user_id: userId, week_start: weekStart });
    await newPlan.save();
    plan = newPlan.toObject();
    plan.id = plan._id.toString();
    return plan;
  },

  async getPlanWithEntries(userId, weekStart) {
    const plan = await MealPlan.findOne({ user_id: userId, week_start: weekStart }).lean();
    if (!plan) return null;
    
    plan.id = plan._id.toString();
    if (plan.entries) {
      plan.entries.forEach(e => e.id = e._id.toString());
      // Sort entries by day and type if needed, though they are stored as an array
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const typeOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
      plan.entries.sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return typeOrder.indexOf(a.meal_type) - typeOrder.indexOf(b.meal_type);
      });
    }
    return plan;
  },

  async getUserPlans(userId) {
    const plans = await MealPlan.find({ user_id: userId }).sort({ week_start: -1 }).lean();
    return plans.map(p => ({
      ...p,
      id: p._id.toString(),
      entry_count: p.entries ? p.entries.length : 0
    }));
  },

  async upsertEntry(planId, { dayOfWeek, mealType, recipeId, recipeTitle, recipeImage, servings }) {
    const plan = await MealPlan.findById(planId);
    if (!plan) return null;

    // Find existing entry
    const entryIndex = plan.entries.findIndex(e => e.day_of_week === dayOfWeek && e.meal_type === mealType);
    
    const entryData = {
      day_of_week: dayOfWeek,
      meal_type: mealType,
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      recipe_image: recipeImage,
      servings: servings || 1
    };

    if (entryIndex > -1) {
      plan.entries[entryIndex] = entryData;
    } else {
      plan.entries.push(entryData);
    }

    await plan.save();
    // Return the specific entry
    const savedEntry = plan.entries.find(e => e.day_of_week === dayOfWeek && e.meal_type === mealType);
    const result = savedEntry.toObject();
    result.id = result._id.toString();
    return result;
  },

  async removeEntry(planId, entryId) {
    const plan = await MealPlan.findById(planId);
    if (!plan) return false;

    const initialCount = plan.entries.length;
    plan.entries = plan.entries.filter(e => e._id.toString() !== entryId);
    
    if (plan.entries.length === initialCount) return false;

    await plan.save();
    return true;
  },

  async getPlanEntries(planId) {
    const plan = await MealPlan.findById(planId).lean();
    if (!plan || !plan.entries) return [];
    return plan.entries.map(e => ({ ...e, id: e._id.toString() }));
  },

  async verifyPlanOwner(userId, planId) {
    if (!mongoose.Types.ObjectId.isValid(planId)) return false;
    const plan = await MealPlan.findOne({ _id: planId, user_id: userId }).select('_id');
    return !!plan;
  },
};
