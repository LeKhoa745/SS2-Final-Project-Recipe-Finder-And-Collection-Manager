import RecipeCard from "../components/RecipeCard";

export default function Wishlist() {
  // Demo data
  const wishlistItems = [
    { id: 1, title: "Creamy Garlic Pasta", image: "https://picsum.photos/id/292/600/400" },
  ];

  return (
    <div className="min-h-screen bg-[#fff8f5] pt-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Bộ sưu tập của tôi ❤️</h1>
        
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((item) => (
              <RecipeCard key={item.id} title={item.title} image={item.image} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">❤️</div>
            <h2 className="text-2xl font-medium">Chưa có món nào trong wishlist</h2>
            <p className="text-gray-500 mt-2">Hãy thêm những công thức yêu thích vào đây!</p>
          </div>
        )}
      </div>
    </div>
  );
}