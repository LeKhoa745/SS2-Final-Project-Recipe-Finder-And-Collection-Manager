import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getAccessToken, getStoredUser } from "../utils/session";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAccessToken());
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const syncSession = () => {
      setIsLoggedIn(!!getAccessToken());
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncSession);
    window.addEventListener("session:changed", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("session:changed", syncSession);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-100 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <div className="rounded-2xl bg-orange-600 p-2 transition-transform duration-300 group-hover:rotate-12">
            <span className="text-3xl text-white">🍳</span>
          </div>
          <span className="text-2xl font-black uppercase italic tracking-tighter text-[#2d1b11]">
            RecipeFinder
          </span>
        </Link>

        <div className="hidden items-center gap-10 text-sm font-bold uppercase tracking-widest text-gray-500 md:flex">
          <Link to="/" className="transition-colors hover:text-orange-600">
            Home
          </Link>
          <Link to="/search" className="transition-colors hover:text-orange-600">
            Recipes
          </Link>
          <Link to="/collection" className="transition-colors hover:text-orange-600">
            Collection
          </Link>
          <Link to="/wishlist" className="transition-colors hover:text-orange-600">
            Saved Recipes
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link
                to="/settings"
                className="hidden items-center gap-3 rounded-2xl bg-orange-50 px-3 py-2 transition-colors hover:bg-orange-100 sm:flex"
              >
                <img
                  src={user?.avatar || "https://ui-avatars.com/api/?background=fff1eb&color=ad2c00&name=User"}
                  alt={user?.name || "User avatar"}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold uppercase tracking-tighter text-gray-400">
                    Welcome back
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    {user?.name || "User"}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-gray-900 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-black hover:shadow-gray-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#2d1b11] transition-colors hover:text-orange-600"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700"
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
