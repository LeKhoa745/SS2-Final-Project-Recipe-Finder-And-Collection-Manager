import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setSession } from "../utils/session";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "❌ Incorrect email or password. Please try again.");
        return;
      }

      setSession({
        accessToken: data.data.accessToken,
        user: data.data.user,
      });

      alert(`🎉 Login successful!\nWelcome back, ${data.data.user.name || email}!`);
      navigate("/");
    } catch {
      setError("⚠️ Cannot reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint on your backend
    window.location.href = "http://localhost:5000/api/auth/google"; 
    // Hoặc nếu bạn deploy: "https://your-backend.com/api/auth/google"
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Top Navigation */}
      <header className="absolute top-0 w-full z-10 flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍳</span>
          <span className="text-2xl font-bold text-orange-950 font-headline tracking-tight">
            Recipe Finder
          </span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative p-4 md:p-8">
        {/* Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/96/6c/2a/come-on-in-for-good-food.jpg"
            alt="Delicious food"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.95) contrast(1.05)" }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="container mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Login Card - Thiết kế giống ảnh bạn gửi */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 backdrop-blur-xl">
              <h3 className="font-headline text-3xl font-bold text-on-surface mb-8">
                Welcome Back
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-2">
                    🥗 EMAIL ADDRESS
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    placeholder="customer123@gmail.com"
                    className="w-full bg-white/70 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none text-on-surface placeholder:text-gray-400"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-2">
                    🔑 PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/70 border border-gray-200 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none text-on-surface placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <a href="#" className="text-sm font-bold text-orange-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl">
                    {error}
                  </p>
                )}

                {/* Login Button - Màu cam đỏ giống ảnh */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg transition-all active:scale-[0.98] shadow-lg disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "Login to Kitchen"}
                </button>
              </form>

              {/* Google Login Button - Thêm ngay dưới nút Login */}
              <button
                onClick={handleGoogleLogin}
                className="mt-4 w-full py-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 text-sm font-semibold text-gray-700 transition-all"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 py-6">
                <div className="h-px flex-grow bg-gray-300" />
                <span className="font-label text-xs text-gray-500 uppercase">NEW TO RECIPE FINDER?</span>
                <div className="h-px flex-grow bg-gray-300" />
              </div>

              <Link
                to="/signup"
                className="w-full py-4 rounded-2xl bg-white border border-gray-300 text-on-surface font-bold text-lg hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
