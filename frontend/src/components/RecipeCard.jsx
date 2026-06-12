import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { wishlistService } from "../api/wishlistService";

export default function RecipeCard({ id, title, image, readyInMinutes, onWishlist, onUnsave, source, authorName }) {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (!id) return false;
    try {
      const savedRecipes = JSON.parse(localStorage.getItem("saved_recipes") || "[]");
      return savedRecipes.some(r => String(r.id) === String(id));
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);

  const isCommunity = source === 'community';

  useEffect(() => {
    if (!id) return;
    
    // Sync state with local storage
    try {
      const savedRecipes = JSON.parse(localStorage.getItem("saved_recipes") || "[]");
      setIsWishlisted(savedRecipes.some(r => String(r.id) === String(id)));
    } catch {
      setIsWishlisted(false);
    }

    const checkWishlist = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const { data } = await wishlistService.check(id);
          setIsWishlisted(data.saved);
          
          // Sync with local storage
          const savedRecipesLatest = JSON.parse(localStorage.getItem("saved_recipes") || "[]");
          if (data.saved) {
            if (!savedRecipesLatest.some(r => String(r.id) === String(id))) {
              savedRecipesLatest.push({ id, title, image, readyInMinutes, timestamp: Date.now() });
              localStorage.setItem("saved_recipes", JSON.stringify(savedRecipesLatest));
            }
          } else {
            const updated = savedRecipesLatest.filter(r => String(r.id) !== String(id));
            localStorage.setItem("saved_recipes", JSON.stringify(updated));
          }
        }
      } catch {
        // Silently fail if not logged in or check fails
      }
    };
    checkWishlist();
  }, [id, title, image, readyInMinutes]);

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!id) return;

    setLoading(true);
    try {
      const savedRecipes = JSON.parse(localStorage.getItem("saved_recipes") || "[]");
      const token = localStorage.getItem("accessToken");
      
      if (isWishlisted) {
        if (token) {
          await wishlistService.remove(id);
        }
        setIsWishlisted(false);
        
        // Remove from local storage
        const updatedRecipes = savedRecipes.filter(r => String(r.id) !== String(id));
        localStorage.setItem("saved_recipes", JSON.stringify(updatedRecipes));
        
        if (onUnsave) onUnsave();
      } else {
        if (token) {
          await wishlistService.add({ recipeId: id, recipeTitle: title, recipeImage: image, readyInMinutes });
        }
        setIsWishlisted(true);
        
        // Add to local storage
        if (!savedRecipes.some(r => String(r.id) === String(id))) {
          savedRecipes.push({ id, title, image, readyInMinutes, timestamp: Date.now() });
          localStorage.setItem("saved_recipes", JSON.stringify(savedRecipes));
        }
        
        if (onWishlist) onWishlist();
      }
    } catch (err) {
      console.error("Wishlist operation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!id) return;
    // Community recipe IDs already have 'community-' prefix from the backend
    navigate(`/recipe/${id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-orange-50 flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={image || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Community badge */}
        {isCommunity && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-purple-600/90 text-white text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5">
            <span>👨‍🍳</span> {authorName || "Community"}
          </div>
        )}

        <button
          onClick={handleWishlistClick}
          disabled={loading}
          className={`absolute top-4 right-4 p-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-110 ${
            isWishlisted ? "bg-orange-600 text-white" : "bg-white/90 hover:bg-white text-orange-600"
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isWishlisted ? '🧡' : '🤍'}
        </button>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl line-clamp-2 mb-3 text-[#2d1b11] group-hover:text-orange-600 transition-colors leading-tight">{title}</h3>
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1.5"><span className="text-sm">⏱️</span> {readyInMinutes ? `${readyInMinutes} mins` : '25 mins'}</span>
          <span className="font-bold text-orange-500 flex items-center gap-0.5">
            {isCommunity ? "View Recipe" : "Explore"} <span className="translate-y-[0.5px]">→</span>
          </span>

        </div>
      </div>
    </div>
  );
}