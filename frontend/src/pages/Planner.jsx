import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import { recipeService } from "../api/recipeService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];

const MEAL_ICONS = {
  breakfast: "☀️",
  lunch: "🌤️",
  dinner: "🌙",
  snack: "🍎",
};

/** Normalize a recipe object from any source (Spoonacular, wishlist, community) */
function normalizeRecipe(r) {
  return {
    id: r.recipe_id || r.id,
    title: r.recipe_title || r.title || "Untitled Recipe",
    image: r.recipe_image || r.image || null,
  };
}

export default function Planner() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  });

  // plan = { id, entries: [{ id, day_of_week, meal_type, recipe_id, recipe_title, recipe_image }] }
  const [plan, setPlan] = useState({ id: null, entries: [] });
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [draggedRecipe, setDraggedRecipe] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { day, meal }

  // ── Data fetching ──────────────────────────────────────────────

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      // Backend expects ?week= (not weekStart)
      const res = await apiClient.get(`/planner?week=${weekStart}`);
      const fetched = res.data?.plan;
      if (fetched) {
        fetched.entries = fetched.entries || [];
        fetched.id = fetched.id || fetched._id?.toString();
        setPlan(fetched);
      } else {
        setPlan({ id: null, entries: [] });
      }
    } catch (err) {
      console.error("Failed to fetch plan:", err);
      setPlan({ id: null, entries: [] });
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await apiClient.get("/wishlist");
      setWishlist(res.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
    fetchWishlist();
  }, [fetchPlan, fetchWishlist]);

  // ── Entry helpers ───────────────────────────────────────────────

  const getEntry = (day, meal) =>
    plan.entries.find(
      (e) => e.day_of_week === day && e.meal_type === meal
    );

  // ── Add entry: optimistic update + backend sync ─────────────────

  const handleAddEntry = async (day, meal, rawRecipe) => {
    const recipe = normalizeRecipe(rawRecipe);

    // 1. Optimistic update — show block immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticEntry = {
      id: tempId,
      day_of_week: day,
      meal_type: meal,
      recipe_id: String(recipe.id),
      recipe_title: recipe.title,
      recipe_image: recipe.image,
      servings: 1,
    };

    setPlan((prev) => {
      // Remove any existing entry for this cell first (upsert behaviour)
      const filtered = prev.entries.filter(
        (e) => !(e.day_of_week === day && e.meal_type === meal)
      );
      return { ...prev, entries: [...filtered, optimisticEntry] };
    });

    // 2. Sync to backend
    try {
      const res = await apiClient.post("/planner/entry", {
        weekStart,
        dayOfWeek: day,
        mealType: meal,
        recipeId: String(recipe.id),
        recipeTitle: recipe.title,
        recipeImage: recipe.image,
        servings: 1,
      });

      // Replace temp entry with real one from backend
      const realEntry = res.data?.entry;
      if (realEntry) {
        realEntry.id = realEntry.id || realEntry._id?.toString();
        const realPlanId = res.data?.planId;
        setPlan((prev) => ({
          ...prev,
          id: realPlanId || prev.id,
          entries: prev.entries.map((e) =>
            e.id === tempId ? { ...realEntry } : e
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to save entry:", err);
      // Rollback optimistic update on failure
      setPlan((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== tempId),
      }));
    }
  };

  // ── Remove entry ────────────────────────────────────────────────

  const handleRemoveEntry = async (entryId) => {
    if (!plan.id) return;
    // Optimistic remove
    setPlan((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== entryId),
    }));
    try {
      await apiClient.delete(`/planner/entry/${entryId}?planId=${plan.id}`);
    } catch (err) {
      console.error("Failed to remove entry:", err);
      fetchPlan(); // re-sync on error
    }
  };

  // ── Search ──────────────────────────────────────────────────────

  const handleSearchRecipes = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const data = await recipeService.search({ q: searchQuery.trim(), limit: 12 });
      setSearchResults(data.data?.results || data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Load default recipes when modal opens
  useEffect(() => {
    if (!isModalOpen || modalTab !== "search" || searchResults.length > 0) return;
    const fetchDefault = async () => {
      setSearchLoading(true);
      try {
        const data = await recipeService.search({ limit: 12 });
        setSearchResults(data.data?.results || data.results || []);
      } catch (err) {
        console.error("Default recipe fetch failed:", err);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchDefault();
  }, [isModalOpen, modalTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCell(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const openCell = (day, meal) => {
    setSelectedCell({ day, meal });
    setModalTab("search");
    setSearchQuery("");
    setSearchResults([]);
    setIsModalOpen(true);
  };

  const selectRecipe = (rawRecipe) => {
    if (!selectedCell) return;
    handleAddEntry(selectedCell.day, selectedCell.meal, rawRecipe);
    closeModal();
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fff9f6] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">

        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#2d1b11] mb-1 font-serif italic">
              Weekly Meal Planner
            </h1>
            <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">
              Plan your delicious journey — week of {weekStart}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-orange-100">
            <span className="material-symbols-outlined text-orange-400 text-[20px]">calendar_month</span>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-orange-600"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Wishlist Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-100/50 border border-orange-50 sticky top-24">
              <h2 className="text-base font-bold text-[#2d1b11] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">bookmark</span>
                Saved Recipes
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {wishlist.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">No saved recipes yet.</p>
                ) : (
                  wishlist.map((r) => {
                    const recipe = normalizeRecipe(r);
                    return (
                      <div
                        key={recipe.id}
                        draggable
                        onDragStart={() => setDraggedRecipe(r)}
                        className="group flex items-center gap-3 p-3 rounded-2xl bg-orange-50/60 hover:bg-orange-100 transition-all cursor-grab active:cursor-grabbing border border-orange-100/60"
                      >
                        {recipe.image ? (
                          <img
                            src={recipe.image}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-orange-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🍽️</span>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-[#2d1b11] line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                          {recipe.title}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <p className="mt-5 text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-center">
                Drag to calendar or click ＋
              </p>
            </div>
          </aside>

          {/* Calendar */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-3xl p-16 flex items-center justify-center shadow-xl shadow-orange-100/50 border border-orange-50">
                <div className="text-center">
                  <div className="text-4xl mb-3 animate-bounce">🍳</div>
                  <p className="text-orange-600 font-bold animate-pulse">Loading your plan…</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 border border-orange-50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                        <th className="p-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px] w-20">
                          Meal
                        </th>
                        {DAYS.map((day) => (
                          <th
                            key={day}
                            className="p-3 text-center font-black text-[#2d1b11] uppercase tracking-tighter text-xs min-w-[130px]"
                          >
                            {day.slice(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MEALS.map((meal) => (
                        <tr key={meal} className="border-b border-orange-50/80 last:border-0">
                          <td className="p-3 align-middle bg-orange-50/20">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-lg">{MEAL_ICONS[meal]}</span>
                              <span className="font-black text-orange-500 uppercase tracking-widest text-[9px]">
                                {meal}
                              </span>
                            </div>
                          </td>
                          {DAYS.map((day) => {
                            const entry = getEntry(day, meal);
                            const isTemp = entry?.id?.startsWith("temp-");
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
                                className="p-2 align-top"
                              >
                                {entry ? (
                                  <div className={`relative group transition-opacity ${isTemp ? "opacity-70" : "opacity-100"}`}>
                                    <div className="p-2 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 shadow-sm">
                                      {entry.recipe_image ? (
                                        <img
                                          src={entry.recipe_image}
                                          alt=""
                                          className="w-full h-16 rounded-xl object-cover mb-2 shadow-sm"
                                        />
                                      ) : (
                                        <div className="w-full h-16 rounded-xl bg-orange-200/50 flex items-center justify-center mb-2">
                                          <span className="text-2xl">🍽️</span>
                                        </div>
                                      )}
                                      <p className="text-[11px] font-bold text-[#2d1b11] line-clamp-2 leading-tight">
                                        {entry.recipe_title}
                                      </p>
                                      {isTemp && (
                                        <p className="text-[9px] text-orange-400 font-bold mt-1">Saving…</p>
                                      )}
                                    </div>
                                    {!isTemp && (
                                      <button
                                        onClick={() => handleRemoveEntry(entry.id)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                                        title="Remove"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">close</span>
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => openCell(day, meal)}
                                    className="w-full h-[90px] rounded-2xl border-2 border-dashed border-orange-100 flex flex-col items-center justify-center text-orange-200 hover:border-orange-400 hover:text-orange-400 hover:bg-orange-50/40 transition-all cursor-pointer group"
                                  >
                                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                                      add_circle
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      Add
                                    </span>
                                  </button>
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
            )}
          </div>
        </div>
      </div>

      {/* ── Recipe Picker Modal ── */}
      {isModalOpen && selectedCell && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-[#fffdfb] max-w-2xl w-full mx-4 rounded-[2rem] overflow-hidden shadow-2xl border border-orange-50 flex flex-col max-h-[88vh]">

            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-orange-50 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">
                  {MEAL_ICONS[selectedCell.meal]} {selectedCell.meal}
                </p>
                <h3 className="text-xl font-black text-[#2d1b11] leading-tight">
                  Add recipe for {selectedCell.day}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Click any recipe to add it to your plan</p>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors flex items-center justify-center text-gray-500 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-orange-50 bg-orange-50/20 px-6">
              <button
                onClick={() => setModalTab("search")}
                className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                  modalTab === "search"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-400 hover:text-orange-500"
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">search</span>
                Search
              </button>
              <button
                onClick={() => setModalTab("saved")}
                className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                  modalTab === "saved"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-400 hover:text-orange-500"
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">bookmark</span>
                Saved
                {wishlist.length > 0 && (
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black rounded-full px-1.5 py-0.5">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-grow space-y-4">
              {modalTab === "search" ? (
                <>
                  {/* Search Form */}
                  <form onSubmit={handleSearchRecipes} className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search recipes (e.g. Pasta, Salmon, Salad…)"
                      className="flex-grow px-4 py-3 rounded-xl bg-orange-50/60 border border-orange-100 outline-none focus:ring-2 focus:ring-orange-400 text-sm text-[#2d1b11] font-medium"
                    />
                    <button
                      type="submit"
                      disabled={searchLoading || !searchQuery.trim()}
                      className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-sm active:scale-[0.97] transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[17px]">search</span>
                      {searchLoading ? "…" : "Search"}
                    </button>
                  </form>

                  {/* Results */}
                  {searchLoading ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      <div className="text-3xl animate-bounce">🍳</div>
                      <p className="text-orange-500 font-bold text-sm animate-pulse">Finding recipes…</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-300">
                      <span className="material-symbols-outlined text-5xl">search_off</span>
                      <p className="text-sm font-semibold">No recipes found — try another search!</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {searchQuery ? `Results for "${searchQuery}"` : "Recommended for you"} — {searchResults.length} recipes
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchResults.map((recipe) => {
                          const norm = normalizeRecipe(recipe);
                          return (
                            <button
                              key={norm.id ?? Math.random()}
                              type="button"
                              onClick={() => selectRecipe(recipe)}
                              className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group text-left w-full"
                            >
                              {norm.image ? (
                                <img
                                  src={norm.image}
                                  alt=""
                                  className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0"
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-2xl">🍽️</span>
                                </div>
                              )}
                              <div className="min-w-0 flex-grow">
                                <h4 className="font-bold text-[#2d1b11] text-sm line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                                  {norm.title}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[11px]">add_circle</span>
                                  Tap to add
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* Saved Recipes Tab */
                wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-300">
                    <span className="material-symbols-outlined text-5xl">bookmark_border</span>
                    <p className="text-sm font-semibold">No saved recipes yet.</p>
                    <Link to="/search" onClick={closeModal} className="text-orange-500 text-xs font-bold hover:underline mt-1">
                      Browse recipes →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wishlist.map((r) => {
                      const recipe = normalizeRecipe(r);
                      return (
                        <button
                          key={recipe.id}
                          type="button"
                          onClick={() => selectRecipe(r)}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group text-left w-full"
                        >
                          {recipe.image ? (
                            <img
                              src={recipe.image}
                              alt=""
                              className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl">🍽️</span>
                            </div>
                          )}
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-bold text-[#2d1b11] text-sm line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                              {recipe.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[11px]">bookmark</span>
                              Saved
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
