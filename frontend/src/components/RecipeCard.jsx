export default function RecipeCard({ title, image, onWishlist }) {
  return (
    <div className="glass rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group">
      <div className="relative">
        <img
          src={image || "https://picsum.photos/id/292/600/400"}
          alt={title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={onWishlist}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-red-500 p-3 rounded-2xl shadow-md transition-all"
        >
          ❤️
        </button>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-xl line-clamp-2 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          Quick &amp; delicious • Ready in 25 minutes
        </p>
      </div>
    </div>
  );
}