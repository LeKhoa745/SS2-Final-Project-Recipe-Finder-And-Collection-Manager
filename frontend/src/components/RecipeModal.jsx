export default function RecipeModal({ recipe, isOpen, onClose }) {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="glass max-w-2xl w-full mx-4 rounded-3xl overflow-hidden" onClick={(e) => e.stopImmediatePropagation()}>
        <img src={recipe.image} alt={recipe.title} className="w-full h-64 object-cover" />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-3">{recipe.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">A delicious recipe that will make your day better! Ready in 25 minutes.</p>
          <div className="mt-8 flex gap-4">
            <button className="flex-1 py-4 bg-[#ad2c00] text-white rounded-2xl font-semibold">Add to Wishlist ❤️</button>
            <button onClick={onClose} className="flex-1 py-4 border border-gray-300 rounded-2xl font-semibold">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}