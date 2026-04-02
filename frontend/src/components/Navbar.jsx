import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  // Check login status on every mount and when localStorage changes (in this tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    window.addEventListener("storage", handleStorageChange);
    // Periodically sync for the same tab (e.g. after login)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-orange-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-orange-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
            <span className="text-3xl text-white">🍳</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-[#2d1b11] uppercase italic">RecipeFinder</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-gray-500">
          <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
          <Link to="/search" className="hover:text-orange-600 transition-colors">Recipes</Link>
          <Link to="/wishlist" className="hover:text-orange-600 transition-colors">Collection</Link>
        </div>

        {/* Right side: Auth */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Welcome back</span>
                  <span className="text-sm font-bold text-orange-600">{user?.name || "User"}</span>
               </div>
               <button
                 onClick={handleLogout}
                 className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-gray-200"
               >
                 Logout
               </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#2d1b11] hover:text-orange-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-100"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}