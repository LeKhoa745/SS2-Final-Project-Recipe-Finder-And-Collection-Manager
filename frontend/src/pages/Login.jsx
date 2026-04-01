import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const emailRef    = useRef();
  const passwordRef = useRef();
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email    = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
        credentials: "include", // needed for the refreshToken httpOnly cookie
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "❌ Incorrect email or password. Please try again.");
        return;
      }

      // Store access token and user info for authenticated requests
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      alert(`🎉 Login successful!\nWelcome back, ${data.data.user.name}!`);
      navigate("/");
    } catch (err) {
      setError("⚠️ Cannot reach the server. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
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

      <main className="flex-grow flex items-center justify-center relative p-4 md:p-8 min-h-screen">
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
          {/* Login Card */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="glass-panel rounded-xl p-8 md:p-12 shadow-2xl border border-white/15">
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-8">
                Welcome Back
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-2">
                    <span>🥗</span> Email Address
                  </label>
                  <div className="relative group">
                    <input
                      ref={emailRef}
                      id="email"
                      type="email"
                      required
                      placeholder="customer123@gmail.com"
                      className="w-full bg-surface-container-low border-none rounded-md px-4 py-4 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-focus-within:w-full" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-2">
                    <span>🔑</span> Password
                  </label>
                  <div className="relative group">
                    <input
                      ref={passwordRef}
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low border-none rounded-md px-4 py-4 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-focus-within:w-full" />
                  </div>
                  <div className="flex justify-end mt-2">
                    <a href="#" className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-2">
                      Forgot password?
                    </a>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-red-600 text-sm font-medium bg-red-50 rounded-lg p-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-gradient w-full py-4 rounded-xl text-on-primary font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      Logging in...
                    </>
                  ) : (
                    "Login to Kitchen"
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 py-6">
                <div className="h-px flex-grow bg-outline-variant/30" />
                <span className="font-label text-xs text-on-surface-variant/60 uppercase">
                  New to Recipe Finder?
                </span>
                <div className="h-px flex-grow bg-outline-variant/30" />
              </div>

              <Link
                to="/signup"
                className="w-full py-4 rounded-xl bg-surface-container-high text-on-surface font-bold text-lg hover:bg-surface-container-highest transition-all active:scale-[0.98] flex items-center justify-center"
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