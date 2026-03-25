import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";

export default function Home() {
  const handleWishlist = (title) => {
    alert(`✅ Added "${title}" to wishlist!`);
  };

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      {/* Hero */}
      <div className="relative h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src="https://picsum.photos/id/292/2000/1200"
          alt="Delicious food background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-6xl font-bold tracking-tight mb-4">Khám phá công thức<br />ngon mỗi ngày</h1>
          <p className="text-xl max-w-md mx-auto">Hàng ngàn công thức • Lưu vào bộ sưu tập • Nấu ngay hôm nay</p>
        </div>
      </div>

      <SearchBar onSearch={() => alert("Search feature ready!")} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Món ngon nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <RecipeCard title="Creamy Garlic Pasta" onWishlist={() => handleWishlist("Creamy Garlic Pasta")} />
          <RecipeCard title="Spicy Thai Basil Chicken" onWishlist={() => handleWishlist("Spicy Thai Basil Chicken")} />
          <RecipeCard title="Avocado Salmon Bowl" onWishlist={() => handleWishlist("Avocado Salmon Bowl")} />
          <RecipeCard title="Vietnamese Pho Beef" onWishlist={() => handleWishlist("Vietnamese Pho Beef")} />
        </div>
      </div>
    </div>
  );
}