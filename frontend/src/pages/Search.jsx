import { useState } from "react";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";

export default function Search() {
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    // Demo data (replace with real API later)
    setRecipes([
      { id: 1, title: "Pasta Carbonara", image: "https://picsum.photos/id/292/600/400" },
      { id: 2, title: "Beef Stir Fry", image: "https://picsum.photos/id/431/600/400" },
      { id: 3, title: "Shrimp Tacos", image: "https://picsum.photos/id/1080/600/400" },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-10">
      <SearchBar onSearch={handleSearch} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((r) => (
              <RecipeCard key={r.id} title={r.title} image={r.image} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-xl py-20">Nhập từ khóa để tìm công thức 🍳</p>
        )}
      </div>
    </div>
  );
}