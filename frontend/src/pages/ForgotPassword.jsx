import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Phone, 3: Success
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Request Reset Link (Traditional flow)
  const handleRequestLink = async (e) => {
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

      setMessage("If that email is registered, a reset link has been sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1 -> 2: Switch to Phone Verification
  const startPhoneVerification = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    setStep(2);
  };

  // Step 2: Verify Phone & Get Temp Token
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-reset-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      setToken(data.data.token);
      setStep(3); // Move to password entry
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Final Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
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
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-2 text-center">
              Reset Your Kitchen
            </h3>
            <p className="text-gray-300 mb-10 font-medium text-center">
              Complete the steps below to secure your account.
            </p>

            {/* ERROR / SUCCESS MESSAGES */}
            {message && (
              <div className="mb-8 p-4 rounded-2xl bg-green-500/20 border border-green-500/50 text-green-100 text-sm font-medium">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-8">
              {/* BLOCK 1: IDENTITY */}
              <div className={`space-y-4 p-6 rounded-3xl border transition-all duration-500 ${step === 1 ? 'bg-white/10 border-orange-500/50 shadow-lg' : 'bg-transparent border-white/10 opacity-60'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-white/20 text-white/50'}`}>1</div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm">Identity Verification</h4>
                </div>
                
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    🥗 Email or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    disabled={step > 1}
                    value={email} // repurposed variable for 'identity'
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chef@kitchen.com or 09xxxxxxx"
                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-500 text-white"
                  />
                </div>

                {step === 1 && (
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!email) return setError("Please enter your email or phone.");
                      setError("");
                      setLoading(true);
                      try {
                        const res = await fetch("/api/auth/verify-reset-identity", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ identity: email.trim() }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || "Identity not found");
                        setToken(data.data.token);
                        setStep(2);
                      } catch (err) { setError(err.message); }
                      finally { setLoading(false); }
                    }}
                    disabled={loading || !email}
                    className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Checking..." : "Verify Identity"}
                  </button>
                )}
              </div>

              {/* BLOCK 2: NEW PASSWORD */}
              <div className={`space-y-4 p-6 rounded-3xl border transition-all duration-500 ${step === 2 ? 'bg-white/10 border-orange-500/50 shadow-lg' : 'bg-transparent border-white/10 opacity-60'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-white/20 text-white/50'}`}>2</div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm">Set New Password</h4>
                </div>

                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    🔑 New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={step !== 2}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      disabled={step !== 2}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {step === 2 && (
                  <button
                    onClick={() => {
                      if (newPassword.length < 8) return setError("Password must be at least 8 characters.");
                      setError("");
                      setStep(3);
                    }}
                    disabled={!newPassword}
                    className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
                  >
                    Confirm Password Choice
                  </button>
                )}
              </div>

              {/* BLOCK 3: CONFIRMATION */}
              <div className={`space-y-4 p-6 rounded-3xl border transition-all duration-500 ${step === 3 ? 'bg-white/10 border-orange-500/50 shadow-lg' : 'bg-transparent border-white/10 opacity-60'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-white/20 text-white/50'}`}>3</div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm">Final Confirmation</h4>
                </div>

                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    🔄 Repeat Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      disabled={step !== 3}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      disabled={step !== 3}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-lg">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {step === 3 && (
                  <button
                    onClick={handleResetPassword}
                    disabled={loading || !confirmPassword}
                    className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20"
                  >
                    {loading ? "Updating..." : "Complete Reset"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/10 text-center flex flex-col gap-4">
              {step > 1 && (
                <button 
                  onClick={() => { setStep(step - 1); setError(""); }}
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Go Back to Step {step - 1}
                </button>
              )}
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
