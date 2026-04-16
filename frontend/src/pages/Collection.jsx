import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collectionService } from "../api/collectionService";
import { getAccessToken, getStoredUser } from "../utils/session";

/* ───────────── helpers ───────────── */
const emptyRecipe = () => ({
  title: "",
  description: "",
  imageUrl: "",
  cuisine: "",
  cookTimeMinutes: "",
  servings: "",
  isPublic: true,
  ingredients: [{ name: "", amount: "", unit: "" }],
  instructions: [""],
});

/* ───────────── Component ───────────── */
export default function Collection() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isLoggedIn = !!getAccessToken();

  /* state */
  const [tab, setTab] = useState("my");           // "my" | "create"
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyRecipe());
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* ── fetch my recipes ───────────── */
  useEffect(() => {
    if (isLoggedIn && tab === "my") fetchMyRecipes();
  }, [tab, isLoggedIn]);

  const fetchMyRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await collectionService.getMyRecipes();
      setRecipes(res.data?.recipes || []);
    } catch (err) {
      setError("Failed to load your recipes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── form helpers ───────────────── */
  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const updateIngredient = (idx, field, value) => {
    setForm(f => {
      const ingredients = [...f.ingredients];
      ingredients[idx] = { ...ingredients[idx], [field]: value };
      return { ...f, ingredients };
    });
  };
  const addIngredient = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: "", amount: "", unit: "" }] }));
  const removeIngredient = (idx) => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));

  const updateInstruction = (idx, value) => {
    setForm(f => {
      const instructions = [...f.instructions];
      instructions[idx] = value;
      return { ...f, instructions };
    });
  };
  const addInstruction = () => setForm(f => ({ ...f, instructions: [...f.instructions, ""] }));
  const removeInstruction = (idx) => setForm(f => ({ ...f, instructions: f.instructions.filter((_, i) => i !== idx) }));

  /* ── submit ─────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    if (form.ingredients.filter(i => i.name.trim()).length === 0) return setError("At least one ingredient is required.");
    if (form.instructions.filter(s => s.trim()).length === 0) return setError("At least one instruction step is required.");

    setSaving(true);
    setError(null);
    setSuccessMsg("");
    try {
      const payload = {
        ...form,
        cookTimeMinutes: form.cookTimeMinutes ? parseInt(form.cookTimeMinutes) : null,
        servings: form.servings ? parseInt(form.servings) : 2,
        ingredients: form.ingredients.filter(i => i.name.trim()),
        instructions: form.instructions.filter(s => s.trim()),
      };

      if (editingId) {
        await collectionService.updateRecipe(editingId, payload);
        setSuccessMsg("Recipe updated successfully! 🎉");
      } else {
        await collectionService.createRecipe(payload);
        setSuccessMsg("Recipe created and shared! 🎉");
      }

      setForm(emptyRecipe());
      setEditingId(null);
      setTab("my");
      fetchMyRecipes();
    } catch (err) {
      setError(err.message || "Failed to save recipe.");
    } finally {
      setSaving(false);
    }
  };

  /* ── edit ────────────────────────── */
  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setForm({
      title: recipe.title || "",
      description: recipe.description || "",
      imageUrl: recipe.imageUrl || "",
      cuisine: recipe.cuisine || "",
      cookTimeMinutes: recipe.cookTimeMinutes || "",
      servings: recipe.servings || "",
      isPublic: recipe.isPublic ?? true,
      ingredients: recipe.ingredients?.length ? recipe.ingredients : [{ name: "", amount: "", unit: "" }],
      instructions: recipe.instructions?.length ? recipe.instructions : [""],
    });
    setTab("create");
    window.scrollTo(0, 0);
  };

  /* ── delete ─────────────────────── */
  const handleDelete = async (id) => {
    try {
      await collectionService.deleteRecipe(id);
      setDeleteConfirm(null);
      fetchMyRecipes();
      setSuccessMsg("Recipe deleted.");
    } catch (err) {
      setError("Failed to delete recipe.");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL your created recipes? This cannot be undone.")) return;
    try {
      await collectionService.deleteAll();
      setRecipes([]);
      setSuccessMsg("All created recipes deleted. 🗑️");
    } catch (err) {
      setError("Failed to delete all recipes.");
    }
  };

  /* ── not logged in ──────────────── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#fff8f5] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-7xl mb-6">👨‍🍳</div>
          <h1 className="text-3xl font-extrabold text-[#2d1b11] mb-3">Your Recipe Collection</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Sign in to create your own recipes, share them with the community, and build your personal cookbook.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      {/* ── Header ─────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 px-6 pt-16 pb-20 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">
            My Collection
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Create your signature recipes and share your culinary masterpieces with the world.
          </p>
        </div>
      </div>

      {/* ── Tabs ───────────────────────── */}
      <div className="mx-auto max-w-5xl -mt-8 px-6 relative z-10">
        <div className="flex gap-2 bg-white rounded-2xl shadow-xl p-2 border border-orange-100">
          <button
            onClick={() => { setTab("my"); setEditingId(null); setForm(emptyRecipe()); setError(null); setSuccessMsg(""); }}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              tab === "my"
                ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            📖 My Recipes
          </button>
          <button
            onClick={() => { setTab("create"); setError(null); setSuccessMsg(""); }}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              tab === "create"
                ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            ✍️ {editingId ? "Edit Recipe" : "Create Recipe"}
          </button>
        </div>
      </div>

      {/* ── Alerts ─────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl mb-4 font-medium flex items-center gap-2">
            <span>❌</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl mb-4 font-medium flex items-center gap-2">
            <span>✅</span> {successMsg}
            <button onClick={() => setSuccessMsg("")} className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        {tab === "my" && (
          <MyRecipesTab
            recipes={recipes}
            loading={loading}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteConfirm(id)}
            onCreate={() => setTab("create")}
            onDeleteAll={handleDeleteAll}
          />
        )}

        {tab === "create" && (
          <CreateRecipeForm
            form={form}
            editingId={editingId}
            saving={saving}
            updateField={updateField}
            updateIngredient={updateIngredient}
            addIngredient={addIngredient}
            removeIngredient={removeIngredient}
            updateInstruction={updateInstruction}
            addInstruction={addInstruction}
            removeInstruction={removeInstruction}
            onSubmit={handleSubmit}
            onCancel={() => { setTab("my"); setEditingId(null); setForm(emptyRecipe()); }}
          />
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-[#2d1b11] mb-2">Delete Recipe?</h3>
            <p className="text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MY RECIPES TAB
   ═══════════════════════════════════════════════════════════════ */
function MyRecipesTab({ recipes, loading, onEdit, onDelete, onCreate, onDeleteAll }) {
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-orange-200 border-t-orange-600" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-7xl mb-6">📝</div>
        <h2 className="text-2xl font-bold text-[#2d1b11] mb-2">No recipes yet</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Start building your collection! Create your first recipe and share it with the community.
        </p>
        <button
          onClick={onCreate}
          className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
        >
          Create Your First Recipe
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={onDeleteAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          Delete All Recipes
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-50 flex flex-col group"
        >
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
            )}
            {/* Public / Private badge */}
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
              recipe.isPublic
                ? "bg-green-500/90 text-white"
                : "bg-gray-700/80 text-gray-200"
            }`}>
              {recipe.isPublic ? "🌐 Public" : "🔒 Private"}
            </div>
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-bold text-lg text-[#2d1b11] mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
            )}

            <div className="mt-auto flex items-center gap-4 text-xs text-gray-400 font-medium pt-3 border-t border-gray-50">
              {recipe.cookTimeMinutes && (
                <span className="flex items-center gap-1"><span>⏱️</span> {recipe.cookTimeMinutes} min</span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1"><span>👥</span> {recipe.servings} servings</span>
              )}
              {recipe.cuisine && (
                <span className="flex items-center gap-1"><span>🌍</span> {recipe.cuisine}</span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onEdit(recipe)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDelete(recipe.id)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-50 text-red-500 hover:bg-red-100 transition"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   CREATE / EDIT RECIPE FORM
   ═══════════════════════════════════════════════════════════════ */
function CreateRecipeForm({
  form, editingId, saving,
  updateField,
  updateIngredient, addIngredient, removeIngredient,
  updateInstruction, addInstruction, removeInstruction,
  onSubmit, onCancel,
}) {
  const fileInputRef = useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("recipeImage", file);

    setUploading(true);
    setError("");

    try {
      const res = await collectionService.uploadImage(formData);
      updateField("imageUrl", res.data.imageUrl);
    } catch (err) {
      setError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* ── Basic Info ─────────────── */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50">
        <h2 className="text-2xl font-bold text-[#2d1b11] mb-6 flex items-center gap-2">
          <span className="text-orange-500">📋</span> Basic Information
        </h2>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-[#2d1b11] mb-2">Recipe Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Grandma's Classic Beef Stew"
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#2d1b11] mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell the community about your recipe..."
              rows={3}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400 resize-none"
            />
          </div>

          {/* Image Upload / URL */}
          <div>
            <label className="block text-sm font-bold text-[#2d1b11] mb-2 font-headline uppercase tracking-widest">Recipe Picture</label>
            
            {!showUrlInput ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center p-8 text-center
                  ${form.imageUrl 
                    ? "border-orange-200 bg-orange-50/30" 
                    : "border-stone-200 bg-stone-50/50 hover:border-orange-400 hover:bg-orange-50/50"}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-2"></div>
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-widest">Uploading...</p>
                  </div>
                ) : form.imageUrl ? (
                  <div className="w-full">
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-inner bg-white mb-3">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-4xl">edit</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Click to change picture</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#2d1b11] mb-1">Upload a delicious photo</h4>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">JPG, PNG up to 5MB</p>
                  </>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3 animation-slide-down">
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder="https://example.com/my-recipe-photo.jpg"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
                />
                {form.imageUrl && (
                  <div className="h-40 w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Invalid+URL"; }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center px-1">
              <p className="text-xs text-red-500 font-bold">{error}</p>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700 underline underline-offset-4"
              >
                {showUrlInput ? "Back to upload" : "Use image link instead"}
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#2d1b11] mb-2">Cuisine</label>
              <input
                type="text"
                value={form.cuisine}
                onChange={(e) => updateField("cuisine", e.target.value)}
                placeholder="e.g. Italian"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2d1b11] mb-2">Cook Time (min)</label>
              <input
                type="number"
                min="1"
                value={form.cookTimeMinutes}
                onChange={(e) => updateField("cookTimeMinutes", e.target.value)}
                placeholder="30"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2d1b11] mb-2">Servings</label>
              <input
                type="number"
                min="1"
                value={form.servings}
                onChange={(e) => updateField("servings", e.target.value)}
                placeholder="4"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
              />
            </div>
          </div>

          {/* Public toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => updateField("isPublic", !form.isPublic)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                form.isPublic ? "bg-orange-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  form.isPublic ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span className="text-sm font-bold text-[#2d1b11]">
              {form.isPublic ? "🌐 Public — anyone can find this recipe" : "🔒 Private — only you can see this"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Ingredients ────────────── */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50">
        <h2 className="text-2xl font-bold text-[#2d1b11] mb-6 flex items-center gap-2">
          <span className="text-orange-500">🥕</span> Ingredients *
        </h2>

        <div className="space-y-3">
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-3 items-start group">
              <span className="mt-3.5 text-sm font-bold text-gray-300 w-6 flex-shrink-0 text-center">
                {idx + 1}
              </span>
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                placeholder="Ingredient name"
                className="flex-[3] px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
              />
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                placeholder="Amount"
                className="flex-[1] px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                placeholder="Unit"
                className="flex-[1] px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400"
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="mt-2 text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100 text-xl flex-shrink-0"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIngredient}
          className="mt-4 flex items-center gap-2 text-orange-600 font-bold text-sm hover:text-orange-700 transition"
        >
          <span className="text-lg">➕</span> Add Ingredient
        </button>
      </section>

      {/* ── Instructions ───────────── */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50">
        <h2 className="text-2xl font-bold text-[#2d1b11] mb-6 flex items-center gap-2">
          <span className="text-orange-500">📝</span> Instructions *
        </h2>

        <div className="space-y-3">
          {form.instructions.map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start group">
              <div className="mt-3 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {idx + 1}
              </div>
              <textarea
                value={step}
                onChange={(e) => updateInstruction(idx, e.target.value)}
                placeholder={`Step ${idx + 1}...`}
                rows={2}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-[#2d1b11] font-medium placeholder-gray-400 resize-none"
              />
              {form.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(idx)}
                  className="mt-2 text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100 text-xl flex-shrink-0"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addInstruction}
          className="mt-4 flex items-center gap-2 text-orange-600 font-bold text-sm hover:text-orange-700 transition"
        >
          <span className="text-lg">➕</span> Add Step
        </button>
      </section>

      {/* ── Submit ──────────────────── */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`flex-[2] py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-white shadow-lg transition-all ${
            saving
              ? "bg-orange-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700 shadow-orange-200 active:scale-[0.98]"
          }`}
        >
          {saving ? "Saving..." : editingId ? "💾 Update Recipe" : "🚀 Share Recipe"}
        </button>
      </div>
    </form>
  );
}
