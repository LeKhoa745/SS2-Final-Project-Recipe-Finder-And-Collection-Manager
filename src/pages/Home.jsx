import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";

export default function Home() {
    return (
    <div>
        <h1>Home</h1>
        <SearchBar />
        <RecipeCard />
        <RecipeCard />
    </div>
    );
}