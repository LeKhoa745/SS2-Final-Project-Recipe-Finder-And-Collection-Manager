import { useEffect, useState } from "react";
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

  const currentQuery = searchParams.get("q")?.trim() || "";

  useEffect(() => {
    const fetchRecipes = async (query) => {
      setLoading(true);
      setError(null);
  
      try {
        // If no query, fetch a larger set of "default" recipes
        const params = query ? { q: query } : { limit: 24 };
        const data = await recipeService.search(params);
        
        const mainRecipes = data.data.results || [];
        const commRecipes = data.data.communityResults || [];
        
        setRecipes(mainRecipes);
        setCommunityRecipes(commRecipes);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // On initial mount or query change:
    // 1. If we have a query, always fetch fresh
    if (currentQuery) {
      fetchRecipes(currentQuery);
      return;
    }

    // 2. Otherwise fetch default recipes
    fetchRecipes("");
  }, [currentQuery]);

  const handleSearchSubmit = (query) => {
    const trimmedQuery = query?.trim() || "";
    // If empty query, we still update URL or just refetch everything
    setSearchParams(trimmedQuery ? { q: trimmedQuery } : {});
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-10">
      <SearchBar onSearch={handleSearchSubmit} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading && <p className="text-center text-orange-600 text-xl py-20">Searching recipes...</p>}

        {error && <p className="text-center text-red-500 text-xl py-20">{error}</p>}


        {!loading && !error && (communityRecipes.length > 0 || recipes.length > 0) ? (
          <>
            <div className="mb-10">
              <h2 className="mb-8 border-l-4 border-orange-600 pl-4 text-3xl font-black text-[#2d1b11] flex items-center gap-3">
                <span>{currentQuery ? `Results for "${currentQuery}"` : "All Recipes"}</span>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  {communityRecipes.length + recipes.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* 1. Community Recipes (if any) */}
                {communityRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    title={recipe.title}
                    image={recipe.image}
                    id={recipe.id}
                    readyInMinutes={recipe.readyInMinutes}
                    source={recipe.source}
                    authorName={recipe.authorName}
                  />
                ))}
                
                {/* 2. Main Recipes */}
                {recipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    title={recipe.title} 
                    image={recipe.image} 
                    id={recipe.id} 
                    readyInMinutes={recipe.readyInMinutes}
                  />
                ))}
              </div>
            </div>
          </>
        ) : !loading && !error && currentQuery ? (
          <p className="text-center text-gray-500 text-xl py-20">Recipe not found.</p>

        {!loading && !error && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((r) => (
              <RecipeCard key={r.id} title={r.title} image={r.image} id={r.id} readyInMinutes={r.readyInMinutes} />
            ))}
          </div>
        ) : !loading && !error && searchParams.get("q") ? (
          <p className="text-center text-gray-500 text-xl py-20">We don't have such dish/ingredient yet.</p>

        ) : !loading && !error && (
          <p className="text-center text-gray-500 text-xl py-20">No recipes available right now.</p>
        )}
      </div>
    </div>
  );
}
