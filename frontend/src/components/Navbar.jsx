import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <span className="text-4xl">🍳</span>
          <span className="text-2xl font-bold tracking-tight text-[#ad2c00]">Recipe Finder</span>
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-8 text-lg">
          <Link to="/" className="hover:text-[#ad2c00] transition-colors font-medium">Home</Link>
          <Link to="/search" className="hover:text-[#ad2c00] transition-colors font-medium">Search</Link>
          <Link to="/wishlist" className="hover:text-[#ad2c00] transition-colors font-medium">Wishlist</Link>
        </div>

        {/* Right side */}
        <Link
          to="/login"
          className="px-6 py-3 bg-[#ad2c00] hover:bg-[#d34011] text-white font-semibold rounded-2xl transition-all shadow-md"
        >
          Đăng nhập
        </Link>
      </div>
    </nav>
  );
}