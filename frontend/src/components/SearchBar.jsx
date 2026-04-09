import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-20">
      <form 
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-2 shadow-2xl flex items-center border border-orange-100 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 transition-all duration-500"
      >
        <div className="pl-6 text-2xl">🔍</div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to cook today? (pasta, salmon, dessert...)"
          className="flex-1 px-4 py-5 bg-transparent outline-none text-xl placeholder-gray-400 font-medium text-[#2d1b11]"
        />
        <button
          type="submit"
          className="px-12 py-5 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest rounded-[2rem] transition-all shadow-lg shadow-orange-200 active:scale-95"
        >
          Search
        </button>
      </form>
      
      {/* Popular Tags */}
      <div className="mt-4 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-tighter text-gray-400">
        <span>Popular:</span>
        {['Healthy', 'Italian', 'Quick', 'Vegan'].map(tag => (
          <button 
            key={tag}
            onClick={() => { setQuery(tag); onSearch(tag); }}
            className="hover:text-orange-500 transition-colors cursor-pointer"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}