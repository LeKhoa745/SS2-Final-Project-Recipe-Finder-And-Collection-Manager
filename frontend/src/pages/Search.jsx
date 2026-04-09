import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { recipeService } from "../api/recipeService";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";

export default function Search() {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      handleSearch(q);
    }
  }, [searchParams]);

  const handleSearch = async (query) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.search({ q: query });
      setRecipes(data.data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('❌ Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-10">
      <SearchBar onSearch={handleSearch} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading && <p className="text-center text-orange-600 text-xl py-20">Searching recipes... 🍳</p>}
        
        {error && <p className="text-center text-red-500 text-xl py-20">{error}</p>}

        {!loading && !error && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((r) => (
              <RecipeCard key={r.id} title={r.title} image={r.image} id={r.id} readyInMinutes={r.readyInMinutes} />
            ))}
          </div>
        ) : !loading && !error && searchParams.get("q") ? (
          <p className="text-center text-gray-500 text-xl py-20">We don't have such dish/ingredient yet.</p>
        ) : !loading && !error && (
          <p className="text-center text-gray-500 text-xl py-20">Nhập từ khóa để tìm công thức 🍳</p>
        )}
      </div>
    </div>
  );
}