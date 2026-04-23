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
        const params = query ? { q: query } : { limit: 24 };
        const data = await recipeService.search(params);
        
        const mainRecipes = data.data.results || [];
        const commRecipes = data.data.communityResults || [];
        
        setRecipes(mainRecipes);
        setCommunityRecipes(commRecipes);
        
        // Save to session storage
        sessionStorage.setItem("last_search_results", JSON.stringify({
          query,
          recipes: mainRecipes,
          communityRecipes: commRecipes,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (!currentQuery) {
      const saved = sessionStorage.getItem("last_search_results");
      if (saved) {
        try {
          const { recipes: savedRecipes, communityRecipes: savedComm } = JSON.parse(saved);
          setRecipes(savedRecipes);
          setCommunityRecipes(savedComm);
          return;
        } catch (e) {
          console.error("Failed to parse saved search", e);
        }
      }
    }
    
    fetchRecipes(currentQuery);
  }, [currentQuery]);

  const handleSearchSubmit = (query) => {
    const trimmedQuery = query?.trim() || "";
    if (trimmedQuery) {
      setSearchParams({ q: trimmedQuery });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-10">
      <SearchBar onSearch={handleSearchSubmit} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading && <p className="text-center text-orange-600 text-xl py-20">Searching recipes...</p>}

        {error && <p className="text-center text-red-500 text-xl py-20">{error}</p>}

        {!loading && !error && (communityRecipes.length > 0 || recipes.length > 0) ? (
          <>
            {!currentQuery && (
              <h2 className="mb-6 border-l-4 border-orange-600 pl-4 text-2xl font-bold text-[#2d1b11]">
                All Recipes
              </h2>
            )}

            {communityRecipes.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 border-l-4 border-purple-500 pl-4 text-2xl font-bold text-[#2d1b11] flex items-center gap-2">
                  <span>Community</span> Recipes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {communityRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      title={recipe.title}
                      image={recipe.image}
                      id={recipe.id}
                      source={recipe.source}
                      authorName={recipe.authorName}
                    />
                  ))}
                </div>
              </div>
            )}

            {recipes.length > 0 && (
              <div>
                {(communityRecipes.length > 0 || currentQuery) && (
                  <h2 className="mb-6 border-l-4 border-orange-600 pl-4 text-2xl font-bold text-[#2d1b11]">
                    {currentQuery ? `Results for "${currentQuery}"` : "More Recipes"}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} title={recipe.title} image={recipe.image} id={recipe.id} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : !loading && !error && currentQuery ? (
          <p className="text-center text-gray-500 text-xl py-20">Recipe not found.</p>
        ) : !loading && !error && (
          <p className="text-center text-gray-500 text-xl py-20">No recipes available right now.</p>
        )}
      </div>
    </div>
  );
}
