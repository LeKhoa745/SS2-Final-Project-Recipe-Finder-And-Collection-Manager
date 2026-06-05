import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setDevLink("");
    setError("");
    
    if (!email) return setError("Please enter your email.");
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      
      if (data.data?.devResetUrl) {
        setDevLink(data.data.devResetUrl);
        setMessage("[Development Mode] SMTP is not configured. You can reset your password using the link below:");
      } else {
        setMessage("A password reset link has been sent to your email. Please check your inbox (and spam folder).");
      }
      setSubmitted(true);
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
          <span className="text-3xl" role="img" aria-label="Recipe Finder">
            🍳
          </span>
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
            <h3 className="font-headline text-3xl font-bold text-white mb-2 text-center">
              Reset Your Kitchen
            </h3>
            <p className="text-gray-300 mb-10 font-medium text-center">
              {submitted 
                ? "Check your email for the reset instructions." 
                : "Enter your email to receive a password reset link."}
            </p>
 
            {message && (
              <div className="mb-8 p-4 rounded-2xl bg-green-500/20 border border-green-500/50 text-green-100 text-sm font-medium">
                {message}
                {devLink && (
                  <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20 select-all font-mono break-all text-xs">
                    <a href={devLink} className="underline text-orange-400 hover:text-orange-300 font-bold block">{devLink}</a>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    🥗 Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chef@kitchen.com"
                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-500 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 rounded-2xl bg-white text-orange-600 font-bold text-sm transition-all hover:bg-gray-100"
              >
                Back to Login
              </button>
            )}

            <div className="mt-12 pt-6 border-t border-white/10 text-center">
              <Link to="/login" className="text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-widest">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
