import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

function RequirementItem({ met, label }) {
  return (
    <div className={`flex items-center gap-2 transition-all duration-300 ${met ? "text-green-400" : "text-gray-500"}`}>
      <span className={`material-symbols-outlined text-[18px] transition-transform ${met ? "scale-110" : "scale-100"}`}>
        {met ? "check_circle" : "radio_button_unchecked"}
      </span>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("No reset token found in the URL. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("No reset token found.");
      return;
    }

    const isLengthMet = password.length >= 8;
    const isUpperMet = /[A-Z]/.test(password);
    const isNumberMet = /[0-9]/.test(password);
    const isSpecialMet = /[!@#$%^&*]/.test(password);
    const isMatchMet = password === confirmPassword;

    if (!isLengthMet || !isUpperMet || !isNumberMet || !isSpecialMet || !isMatchMet) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      setMessage("Success! Your password has been updated.");
      setTimeout(() => navigate("/login"), 3000);
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
            src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/41/d0/25/kitchen-view.jpg"
            alt="Delicious close up of a chef's dish"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.7) blur(2px)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20" />
        </div>

        <div className="container mx-auto z-10 flex justify-center">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 backdrop-blur-xl">
            <h3 className="font-headline text-3xl font-bold text-white mb-3 text-center">
              Create New Password
            </h3>
            <p className="text-gray-300 mb-8 font-medium text-center">
              Please enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-gray-400">
                  🔑 New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-500 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-gray-400">
                  🔄 Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-500 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Password Requirements</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <RequirementItem met={password.length >= 8} label="At least 8 characters" />
                  <RequirementItem met={/[A-Z]/.test(password)} label="Contains uppercase (A-Z)" />
                  <RequirementItem met={/[0-9]/.test(password)} label="Contains number (0-9)" />
                  <RequirementItem met={/[!@#$%^&*]/.test(password)} label="Contains special character" />
                  <RequirementItem met={password === confirmPassword && password.length > 0} label="Passwords match" />
                </div>
              </div>

              {message && (
                <div className="p-4 rounded-2xl bg-green-500/20 border border-green-500/50 text-green-100 text-sm font-bold animate-bounce">
                  {message}
                  <p className="text-xs font-normal mt-1 text-green-200">Redirecting to login...</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-100 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !tokenValid}
                className="block w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg text-center transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <Link
                to="/login"
                className="block w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-gray-300 font-bold text-lg text-center transition-all hover:bg-white/10"
              >
                Back to Login
              </Link>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
