export default function SearchBar({ onSearch }) {
  return (
    <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
      <div className="glass rounded-3xl p-2 shadow-xl flex">
        <input
          type="text"
          placeholder="Tìm món ăn yêu thích... (pasta, gà nướng, salad...)"
          className="flex-1 px-6 py-5 bg-transparent outline-none text-lg placeholder-gray-400"
        />
        <button
          onClick={onSearch}
          className="px-10 bg-[#ad2c00] hover:bg-[#d34011] text-white font-semibold rounded-3xl transition-all"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
}