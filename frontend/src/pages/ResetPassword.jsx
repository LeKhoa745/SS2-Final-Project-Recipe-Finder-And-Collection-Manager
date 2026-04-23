import React from "react";
import { Link, useSearchParams } from "react-router-dom";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("No reset token found in the URL.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
  const legacyToken = searchParams.get("token");

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
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-3">
              Reset password flow updated
            </h3>
            <p className="text-gray-600 mb-8 font-medium">
              Password reset now uses email and phone confirmation instead of email links or secret codes.
            </p>

            <div className="space-y-4">
              {legacyToken && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                  This older reset link is no longer used. Please start again from the forgot password page.
                </div>
              )}

                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    🔄 Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/70 border border-stone-200 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {message && (
                  <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-bold animate-bounce">
                    {message}
                    <p className="text-xs font-normal mt-1">Redirecting to login...</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}
              <div className="rounded-2xl border border-white/30 bg-white/70 px-5 py-5 text-sm text-stone-700">
                Enter your email, confirm the phone number stored on your account, then choose a new password.
              </div>

              <Link
                to="/forgot-password"
                className="block w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg text-center transition-all active:scale-[0.98] shadow-lg"
              >
                Continue to Forgot Password
              </Link>

              <Link
                to="/login"
                className="block w-full py-4 rounded-2xl border border-stone-300 bg-white/70 text-stone-700 font-bold text-lg text-center transition-all hover:bg-white"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
