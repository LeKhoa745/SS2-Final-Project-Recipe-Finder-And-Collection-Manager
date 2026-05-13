import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/apiClient";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];

export default function Planner() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [draggedRecipe, setDraggedRecipe] = useState(null);

  useEffect(() => {
    fetchPlan();
    fetchWishlist();
  }, [weekStart]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/planner?weekStart=${weekStart}`);
      setPlan(res.data.plan || { entries: [] });
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await apiClient.get("/wishlist");
      setWishlist(res.data.recipes || []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleAddEntry = async (day, meal, recipe) => {
    try {
      await apiClient.post("/planner/entry", {
        weekStart,
        dayOfWeek: day,
        mealType: meal,
        recipeId: recipe.recipe_id || recipe.id,
        recipeTitle: recipe.recipe_title || recipe.title,
        recipeImage: recipe.recipe_image || recipe.image,
        servings: 2
      });
      fetchPlan();
    } catch (err) {
      console.error("Failed to add entry:", err);
    }
  };

  const handleRemoveEntry = async (entryId) => {
    try {
      await apiClient.delete(`/planner/entry/${entryId}`);
      fetchPlan();
    } catch (err) {
      console.error("Failed to remove entry:", err);
    }
  };

  const getEntry = (day, meal) => {
    return plan?.entries?.find(e => e.day_of_week === day && e.meal_type === meal);
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#2d1b11] mb-2 font-serif italic">Weekly Meal Planner</h1>
            <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Plan your delicious journey</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-orange-100">
             <input 
               type="date" 
               value={weekStart} 
               onChange={(e) => setWeekStart(e.target.value)}
               className="bg-transparent border-none outline-none font-bold text-orange-600 px-4"
             />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Wishlist Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-100/50 border border-orange-50">
              <h2 className="text-xl font-bold text-[#2d1b11] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">bookmark</span>
                Saved Recipes
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {wishlist.length === 0 ? (
                  <p className="text-center text-gray-400 py-10 text-sm">No saved recipes yet.</p>
                ) : (
                  wishlist.map(recipe => (
                    <div 
                      key={recipe.id}
                      draggable
                      onDragStart={() => setDraggedRecipe(recipe)}
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-orange-50/50 hover:bg-orange-100 transition-all cursor-grab active:cursor-grabbing border border-orange-100/50"
                    >
                      <img src={recipe.recipe_image || recipe.image} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <span className="text-sm font-bold text-[#2d1b11] line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {recipe.recipe_title || recipe.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-center">Drag recipes to the calendar</p>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 border border-orange-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-orange-50/30 border-b border-orange-100">
                      <th className="p-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px] w-24">Meal</th>
                      {DAYS.map(day => (
                        <th key={day} className="p-4 text-center font-black text-[#2d1b11] uppercase tracking-tighter text-sm min-w-[150px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MEALS.map(meal => (
                      <tr key={meal} className="border-b border-orange-50 last:border-0">
                        <td className="p-4 font-bold text-orange-600 uppercase tracking-widest text-[10px] bg-orange-50/10">
                          {meal}
                        </td>
                        {DAYS.map(day => {
                          const entry = getEntry(day, meal);
                          return (
                            <td 
                              key={`${day}-${meal}`}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (draggedRecipe) {
                                  handleAddEntry(day, meal, draggedRecipe);
                                  setDraggedRecipe(null);
                                }
                              }}
                              className="p-3 align-top min-h-[120px] transition-colors hover:bg-orange-50/20"
                            >
                              {entry ? (
                                <div className="relative group">
                                  <div className="p-2 rounded-2xl bg-white border border-orange-100 shadow-sm animate-in zoom-in-95 duration-200">
                                    <img src={entry.recipe_image} alt="" className="w-full h-20 rounded-xl object-cover mb-2" />
                                    <p className="text-xs font-bold text-[#2d1b11] line-clamp-2 leading-tight">
                                      {entry.recipe_title}
                                    </p>
                                    <button 
                                      onClick={() => handleRemoveEntry(entry.id)}
                                      className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-24 rounded-2xl border-2 border-dashed border-orange-100 flex items-center justify-center text-orange-200 group-hover:border-orange-300 transition-colors">
                                  <span className="material-symbols-outlined">add_circle</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
