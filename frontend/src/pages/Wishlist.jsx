import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import { wishlistService } from "../api/wishlistService";
import { getAccessToken } from "../utils/session";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const data = await wishlistService.getAll();
        const itemsList = data.data?.items || [];
        const formattedItems = itemsList.map(item => ({
          id: item.recipe_id,
          title: item.recipe_title,
          image: item.recipe_image
        }));
        setWishlistItems(formattedItems);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError("Please login to view your saved recipes.");
      } finally {
        setLoading(false);
      }
    };

    if (getAccessToken()) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, []);

  const handleUnsaveAll = async () => {
    if (!window.confirm("Are you sure you want to remove ALL your saved recipes? This cannot be undone.")) return;
    try {
      await wishlistService.removeAll();
      setWishlistItems([]);
    } catch (err) {
      console.error("Failed to remove all items:", err);
      alert("Something went wrong while removing all recipes.");
    }
  };

  const handleItemUnsave = (recipeId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== recipeId));
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-[#2d1b11]/5 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-[#2d1b11]">Saved Recipes</h1>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {wishlistItems.length} Recipes
            </span>
          </div>
          {wishlistItems.length > 0 && !loading && !error && (
            <button 
              onClick={handleUnsaveAll} 
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              Unsave All
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <p className="text-orange-600 text-xl font-medium animate-pulse">Loading your saved recipes... 🍳</p>
          </div>
        ) : error && !getAccessToken() ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-orange-50">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800">{error}</h2>
            <a href="/login" className="mt-4 inline-block bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-700 transition-all">Go to Login</a>
          </div>
        ) : error ? (
           <div className="text-center py-20">
             <h2 className="text-xl font-bold text-red-500 mb-4">{error}</h2>
             <button onClick={() => window.location.reload()} className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
           </div>
        ) : wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((item) => (
              <RecipeCard 
                key={item.id} 
                id={item.id} 
                title={item.title} 
                image={item.image}
                onUnsave={() => handleItemUnsave(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-orange-50">
            <div className="text-8xl mb-8">🥘</div>
            <h2 className="text-3xl font-bold text-[#2d1b11]">You haven't saved any recipes yet.</h2>
            <p className="text-gray-500 mt-4 text-lg">Browse thousands of recipes and save your favorites here!</p>
            <a href="/search" className="mt-8 inline-block bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">Start Exploring</a>
          </div>
        )}
      </div>
    </div>
  );
}