import { useState } from "react";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";

export default function Search() {
    const [recipes, setRecipes] = useState([]);
    const handleSearch = async () => {
    const res = await fetch(
        "https://api.spoonacular.com/recipes/complexSearch?query=pasta&apiKey=YOUR_API_KEY"
    );
    const data = await res.json();
    setRecipes(data.results);
};
return (
    <div>
        <h1>Search</h1>
        <SearchBar onSearch={handleSearch} />
        {recipes.map((r) => (
        <RecipeCard key={r.id} title={r.title} image={r.image} />
        ))}
    </div>
);
}