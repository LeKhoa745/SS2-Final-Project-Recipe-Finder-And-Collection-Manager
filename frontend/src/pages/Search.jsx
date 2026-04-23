import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { recipeService } from "../api/recipeService";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      fetchRecipes(q);
    } else {
      setRecipes([]);
      setCommunityRecipes([]);
    }
  }, [searchParams]);

  const fetchRecipes = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.search({ q: query });
      setRecipes(data.data.results || []);
      setCommunityRecipes(data.data.communityResults || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('❌ Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (query) => {
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-10">
      <SearchBar onSearch={handleSearchSubmit} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading && <p className="text-center text-orange-600 text-xl py-20">Searching recipes... 🍳</p>}
        
        {error && <p className="text-center text-red-500 text-xl py-20">{error}</p>}

        {!loading && !error && (communityRecipes.length > 0 || recipes.length > 0) ? (
          <>
            {/* Community Results */}
            {communityRecipes.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 border-l-4 border-purple-500 pl-4 text-2xl font-bold text-[#2d1b11] flex items-center gap-2">
                  <span>👨‍🍳</span> Community Recipes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {communityRecipes.map((r) => (
                    <RecipeCard
                      key={r.id}
                      title={r.title}
                      image={r.image}
                      id={r.id}
                      source={r.source}
                      authorName={r.authorName}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Spoonacular Results */}
            {recipes.length > 0 && (
              <div>
                {communityRecipes.length > 0 && (
                  <h2 className="mb-6 border-l-4 border-orange-600 pl-4 text-2xl font-bold text-[#2d1b11]">
                    More Recipes
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {recipes.map((r) => (
                    <RecipeCard key={r.id} title={r.title} image={r.image} id={r.id} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : !loading && !error && searchParams.get("q") ? (
          <p className="text-center text-gray-500 text-xl py-20">Recipe not found.</p>
        ) : !loading && !error && (
          <p className="text-center text-gray-500 text-xl py-20">Enter keyword to search for recipes 🍳</p>
        )}
      </div>
    </div>
  );
}