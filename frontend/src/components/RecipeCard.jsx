import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { wishlistService } from "../api/wishlistService";

export default function RecipeCard({ id, title, image, onWishlist, onUnsave, source, authorName }) {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCommunity = source === 'community';

  useEffect(() => {
    if (!id || isCommunity) return;
    const checkWishlist = async () => {
      try {
        const { data } = await wishlistService.check(id);
        setIsWishlisted(data.saved);
      } catch {
        // Silently fail if not logged in or check fails
      }
    };
    checkWishlist();
  }, [id]);

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!id || isCommunity) {
      if (onWishlist) onWishlist();
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        await wishlistService.remove(id);
        setIsWishlisted(false);
        if (onUnsave) onUnsave();
      } else {
        await wishlistService.add({ recipeId: id, recipeTitle: title, recipeImage: image });
        setIsWishlisted(true);
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

        {!isCommunity && (
          <button
            onClick={handleWishlistClick}
            disabled={loading}
            className={`absolute top-4 right-4 p-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-110 ${
              isWishlisted ? "bg-orange-600 text-white" : "bg-white/90 hover:bg-white text-orange-600"
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isWishlisted ? '🧡' : '🤍'}
          </button>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl line-clamp-2 mb-3 text-[#2d1b11] group-hover:text-orange-600 transition-colors leading-tight">{title}</h3>
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1.5"><span className="text-sm">⏱️</span> 25 mins</span>
          <span className="font-bold text-orange-500 flex items-center gap-0.5">
            {isCommunity ? "View Recipe" : "Explore"} <span className="translate-y-[0.5px]">→</span>
          </span>
        </div>
      </div>
    </div>
  );
}