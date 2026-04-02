import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import { wishlistService } from "../api/wishlistService";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const data = await wishlistService.getAll();
        // Backend returns items with recipeId, recipeTitle, image
        const formattedItems = (data.data || []).map(item => ({
          id: item.recipeId,
          title: item.recipeTitle,
          image: item.image
        }));
        setWishlistItems(formattedItems);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError("Please login to view your saved recipes.");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-10">
            <h1 className="text-4xl font-bold text-[#2d1b11]">My Collection</h1>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                {wishlistItems.length} Recipes
            </span>
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <p className="text-orange-600 text-xl font-medium animate-pulse">Loading your collection... 🍳</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-orange-50">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800">{error}</h2>
            <a href="/login" className="mt-4 inline-block bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-700 transition-all">Go to Login</a>
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((item) => (
              <RecipeCard 
                key={item.id} 
                id={item.id} 
                title={item.title} 
                image={item.image} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-orange-50">
            <div className="text-8xl mb-8">🥘</div>
            <h2 className="text-3xl font-bold text-[#2d1b11]">Your collection is empty</h2>
            <p className="text-gray-500 mt-4 text-lg">Browse thousands of recipes and save your favorites here!</p>
            <a href="/search" className="mt-8 inline-block bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">Start Exploring</a>
          </div>
        )}
      </div>
    </div>
  );
}