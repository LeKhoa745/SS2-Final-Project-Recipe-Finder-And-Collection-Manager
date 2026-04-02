import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";
import { newsService } from "../api/newsService";

export default function Home() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

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

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleWishlist = (title) => {
    alert(`✅ Added "${title}" to wishlist!`);
  };

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      {/* Hero */}
      <div className="relative h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=2000"
          alt="Delicious food background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-6xl font-bold tracking-tight mb-4">Khám phá công thức<br />ngon mỗi ngày</h1>
          <p className="text-xl max-w-md mx-auto">Hàng ngàn công thức • Lưu vào bộ sưu tập • Nấu ngay hôm nay</p>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* News Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-[#2d1b11] border-l-4 border-orange-600 pl-4">Culinary News & Trends</h2>
          {loadingNews ? (
            <p className="text-gray-500 italic">Fetching latest food trends...</p>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.slice(0, 3).map((article, idx) => (
                <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-100 flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img src={article.urlToImage || 'https://via.placeholder.com/600x400?text=Food+News'} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 block">{article.source?.name}</span>
                    <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">{article.title}</h3>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span className="font-bold text-orange-400">Read More →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No news articles found at the moment.</p>
          )}
        </div>

        <h2 className="text-3xl font-bold mb-8 text-[#2d1b11] border-l-4 border-orange-600 pl-4">Món ngon nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <RecipeCard id="716429" title="Pasta with Garlic and Oil" image="https://spoonacular.com/recipeImages/716429-556x370.jpg" onWishlist={() => handleWishlist("Pasta with Garlic and Oil")} />
          <RecipeCard id="715538" title="What to Expect When You're Expecting" image="https://spoonacular.com/recipeImages/715538-556x370.jpg" onWishlist={() => handleWishlist("Pork Chops")} />
          <RecipeCard id="782585" title="Cannellini Bean and Kale Soup" image="https://spoonacular.com/recipeImages/782585-556x370.jpg" onWishlist={() => handleWishlist("Bean Soup")} />
          <RecipeCard id="715415" title="Red Lentil Soup with Chicken and Spinach" image="https://spoonacular.com/recipeImages/715415-556x370.jpg" onWishlist={() => handleWishlist("Red Lentil Soup")} />
        </div>
      </div>
    </div>
  );
}