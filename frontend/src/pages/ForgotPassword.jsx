import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage("If that email is registered, a reset link has been generated. Please check your developer console for the link.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex flex-col relative overflow-x-hidden">
      <header className="absolute top-0 w-full z-10 flex justify-between items-center px-8 py-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-3xl">🍳</span>
          <span className="text-2xl font-bold text-orange-950 font-headline tracking-tight">
            Recipe Finder
          </span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center relative p-4 md:p-8">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/96/6c/2a/come-on-in-for-good-food.jpg"
            alt="Interior of a cozy restaurant"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.8) contrast(1.1)" }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="container mx-auto z-10 flex justify-center">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 backdrop-blur-xl">
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-4">
              Lost your key?
            </h3>
            <p className="text-gray-600 mb-8 font-medium">
              Enter your email address and we'll help you get back into your kitchen.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                  🥗 Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@kitchen.com"
                  className="w-full bg-white/70 border border-stone-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              {message && (
                <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium animate-pulse">
                  {message}
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg transition-all active:scale-[0.98] shadow-lg disabled:opacity-70"
              >
                {loading ? "Thinking..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/20 text-center">
              <Link to="/login" className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-widest">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
