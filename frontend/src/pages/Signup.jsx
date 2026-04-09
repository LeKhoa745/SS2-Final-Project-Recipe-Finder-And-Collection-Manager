import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setSession } from "../utils/session";

const REQUIREMENTS = [
  { id: "length",    text: "At least 8 characters",                test: (p) => p.length >= 8 },
  { id: "uppercase", text: "Contains uppercase (A-Z)",             test: (p) => /[A-Z]/.test(p) },
  { id: "number",    text: "Contains number (0-9)",                test: (p) => /[0-9]/.test(p) },
  { id: "special",   text: "Contains special character (!@#$%^&*)", test: (p) => /[!@#$%^&*]/.test(p) },
  { id: "match",     text: "Passwords match",                      test: () => false },
];

export default function Signup() {
  const nameRef     = useRef();
  const emailRef    = useRef();
  const passwordRef = useRef();
  const confirmRef  = useRef();

  const [reqStatus, setReqStatus] = useState(
    Object.fromEntries(REQUIREMENTS.map((r) => [r.id, false]))
  );
  const [allValid,  setAllValid]  = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const navigate = useNavigate();

  const checkPassword = () => {
    const password = passwordRef.current?.value || "";
    const confirm  = confirmRef.current?.value  || "";
    const newStatus = {};
    let valid = true;
    REQUIREMENTS.forEach((req) => {
      const ok =
        req.id === "match"
          ? password === confirm && password !== ""
          : req.test(password);
      newStatus[req.id] = ok;
      if (!ok) valid = false;
    });
    setReqStatus(newStatus);
    setAllValid(valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!allValid) {
      setErrorMsg("Password requirements not met. Please check all conditions.");
      return;
    }

    const name     = nameRef.current.value.trim();
    const email    = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
        credentials: "include", // needed for the refreshToken cookie
      });

      const data = await res.json();

      if (!res.ok) {
        // Server returned an error (409 duplicate, 422 validation, etc.)
        setErrorMsg(data.message || "Registration failed. Please try again.");
        return;
      }

      // Store the access token for authenticated requests later
      setSession({
        accessToken: data.data.accessToken,
        user: data.data.user,
      });

      alert(`✅ Account created successfully!\nWelcome, ${data.data.user.name}! You can now log in.`);
      navigate("/login");
    } catch (err) {
      // Network error – backend is probably not running
      setErrorMsg("⚠️ Cannot reach the server. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-transparent">
        <div className="text-2xl font-bold text-orange-900 flex items-center gap-2 font-headline tracking-tight">
          Recipe Finder 🍳
        </div>
      </header>

      <main className="relative min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/25 z-10" />
          <img
            alt="Roasted chicken with vegetables"
            className="w-full h-full object-cover"
            src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/3d/3a/cf/we-can-accommodate-up.jpg"
            style={{ filter: "brightness(0.90) contrast(1.05)" }}
          />
        </div>

        <div className="relative z-20 w-full max-w-6xl grid md:grid-cols-12 items-center gap-12 mt-16">
          {/* Left panel */}
          <div className="hidden md:block md:col-span-5 text-white">
            <span className="inline-block px-4 py-1 rounded-full border border-white/30 text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
              The Modern Gastronome
            </span>
            <h1 className="font-headline text-6xl font-extrabold leading-tight mb-6">
              Start <br />
              <span className="text-primary-fixed">Cooking</span> Today.
            </h1>
            <p className="text-lg text-white/80 max-w-md leading-relaxed font-light">
              Join thousands of home chefs discovering professional-grade recipes
              curated for the modern lifestyle.
            </p>
          </div>

          {/* Signup Card */}
          <div className="col-span-12 md:col-span-7 flex justify-center md:justify-end">
            <div className="glass-card w-full max-w-lg rounded-xl p-8 md:p-12 shadow-2xl border border-white/20">
              <div className="mb-8 text-center md:text-left">
                <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2">
                  Welcome to the Kitchen
                </h2>
                <p className="text-on-surface-variant font-medium">
                  Create your chef profile to get started.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-on-surface-variant font-label text-sm font-semibold uppercase tracking-wider px-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      person
                    </span>
                    <input
                      ref={nameRef}
                      id="signup-name"
                      type="text"
                      required
                      placeholder="Nguyen Van A"
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 outline-none transition-all duration-300 font-body text-on-surface"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-on-surface-variant font-label text-sm font-semibold uppercase tracking-wider px-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      alternate_email
                    </span>
                    <input
                      ref={emailRef}
                      id="signup-email"
                      type="email"
                      required
                      placeholder="customer123@gmail.com"
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 outline-none transition-all duration-300 font-body text-on-surface"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-on-surface-variant font-label text-sm font-semibold uppercase tracking-wider px-1">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      lock
                    </span>
                    <input
                      ref={passwordRef}
                      id="signup-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      onChange={checkPassword}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 outline-none transition-all font-body text-on-surface"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-on-surface-variant font-label text-sm font-semibold uppercase tracking-wider px-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      lock_reset
                    </span>
                    <input
                      ref={confirmRef}
                      id="signup-confirm"
                      type="password"
                      required
                      placeholder="••••••••"
                      onChange={checkPassword}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 outline-none transition-all font-body text-on-surface"
                    />
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-surface-container-high rounded-lg p-5">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Password Requirements
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {REQUIREMENTS.map((req) => (
                      <div key={req.id} className="flex items-center gap-2 text-on-surface-variant">
                        <span className={`material-symbols-outlined text-xl ${reqStatus[req.id] ? "valid" : ""}`}>
                          {reqStatus[req.id] ? "check_circle" : "circle"}
                        </span>
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ToS */}
                <div className="flex items-center gap-3 px-1">
                  <input
                    id="tos"
                    type="checkbox"
                    required
                    className="w-5 h-5 rounded border-outline-variant accent-primary"
                  />
                  <label htmlFor="tos" className="text-sm text-on-surface-variant font-medium">
                    I agree to the{" "}
                    <a href="#" className="text-primary font-bold underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-primary font-bold underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Error message */}
                {errorMsg && (
                  <p className="text-red-600 text-sm font-medium text-center bg-red-50 rounded-lg p-3">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!allValid || loading}
                  className="editorial-gradient w-full py-5 rounded-xl text-on-primary font-headline font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create My Account
                      <span className="material-symbols-outlined">restaurant</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-on-surface-variant font-medium">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-bold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
