import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";
import { newsService } from "../api/newsService";
import { getStoredUser } from "../utils/session";

function getAvatarFallback(name = "User") {
  const initial = (name || "User").trim().charAt(0).toUpperCase() || "U";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#fff1eb" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#ad2c00">${initial}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function Home() {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [user, setUser] = useState(getStoredUser());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getHeadlines();
        setNews(data.data || []);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    const handlePointerDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("session:changed", syncUser);
    window.addEventListener("storage", syncUser);
    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("session:changed", syncUser);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleWishlist = (title) => {
    alert(`Added "${title}" to wishlist!`);
  };

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <div className="relative flex h-[480px] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=2000"
          alt="Delicious food background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 px-6 text-center text-white">
          {user && (
            <div className="mb-6 flex justify-center">
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md transition hover:bg-white/15"
                >
                  <img
                    src={user.avatar || getAvatarFallback(user.name)}
                    alt={user.name || "User avatar"}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-white/40"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                      Welcome back
                    </p>
                    <p className="text-lg font-bold text-white">{user.name || "Chef"}</p>
                  </div>
                  <span className="material-symbols-outlined text-white/80">expand_more</span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#fff8f5] text-left shadow-2xl">
                    <div className="border-b border-orange-100 px-4 py-4">
                      <p className="text-sm font-bold text-[#2d1b11]">{user.name}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-4 text-sm font-semibold text-[#2d1b11] transition hover:bg-orange-50"
                    >
                      <span className="material-symbols-outlined text-orange-600">settings</span>
                      Profile settings
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="mb-4 text-6xl font-bold tracking-tight">
            Discover delicious recipes
            <br />
            every day
          </h1>
          <p className="mx-auto max-w-md text-xl">
            Thousands of recipes • Save to collection • Cook today
          </p>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-20">
          <h2 className="mb-8 border-l-4 border-orange-600 pl-4 text-3xl font-bold text-[#2d1b11]">
            Culinary News & Trends
          </h2>
          {loadingNews ? (
            <p className="italic text-gray-500">Fetching latest food trends...</p>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((article, idx) => (
                <a
                  key={idx}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.urlToImage || "https://via.placeholder.com/600x400?text=Food+News"}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-orange-600">
                      {article.source?.name}
                    </span>
                    <h3 className="mb-3 line-clamp-2 text-lg font-bold transition-colors group-hover:text-orange-600">
                      {article.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4 text-xs text-gray-400">
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span className="font-bold text-orange-400">Read More</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No news articles found at the moment.</p>
          )}
        </div>

        <h2 className="mb-8 border-l-4 border-orange-600 pl-4 text-3xl font-bold text-[#2d1b11]">
          Featured Recipes
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <RecipeCard
            id="716429"
            title="Pasta with Garlic and Oil"
            image="https://spoonacular.com/recipeImages/716429-556x370.jpg"
            onWishlist={() => handleWishlist("Pasta with Garlic and Oil")}
          />
          <RecipeCard
            id="715538"
            title="What to Expect When You're Expecting"
            image="https://spoonacular.com/recipeImages/715538-556x370.jpg"
            onWishlist={() => handleWishlist("Pork Chops")}
          />
          <RecipeCard
            id="782585"
            title="Cannellini Bean and Kale Soup"
            image="https://spoonacular.com/recipeImages/782585-556x370.jpg"
            onWishlist={() => handleWishlist("Bean Soup")}
          />
          <RecipeCard
            id="715415"
            title="Red Lentil Soup with Chicken and Spinach"
            image="https://spoonacular.com/recipeImages/715415-556x370.jpg"
            onWishlist={() => handleWishlist("Red Lentil Soup")}
          />
        </div>
      </div>
    </div>
  );
}
