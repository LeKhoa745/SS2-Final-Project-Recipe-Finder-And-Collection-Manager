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
  
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STEPS = {
  email: "email",
  phone: "phone",
  password: "password",
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.email);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneHint, setPhoneHint] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Request Reset Link (Traditional flow)
  const handleRequestLink = async (e) => {
    e.preventDefault();
  const normalizedEmail = useMemo(() => email.trim(), [email]);
  const normalizedPhone = useMemo(() => phone.trim(), [phone]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to verify email.");

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
      setPhoneHint(data?.data?.phoneHint || "");
      setStep(STEPS.phone);
      setMessage("Email found. Please confirm the phone number attached to this account.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-reset-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, phone: normalizedPhone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to verify phone number.");

      setStep(STEPS.password);
      setMessage("Phone number confirmed. You can now set a new password.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          phone: normalizedPhone,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const items = [
      { id: STEPS.email, label: "Email" },
      { id: STEPS.phone, label: "Phone" },
      { id: STEPS.password, label: "New Password" },
    ];

    const currentIndex = items.findIndex((item) => item.id === step);

    return (
      <div className="mb-8 grid grid-cols-3 gap-3">
        {items.map((item, index) => {
          const active = index <= currentIndex;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                active
                  ? "border-orange-500 bg-orange-100 text-orange-700"
                  : "border-white/30 bg-white/40 text-stone-500"
              }`}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    );
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
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-3">
              Reset your password
            </h3>
            <p className="text-gray-600 mb-8 font-medium">
              Enter your email, confirm your phone number, then create a fresh password for your account.
            </p>

            {renderStepIndicator()}

            {step === STEPS.email && (
              <form onSubmit={handleCheckEmail} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    Email Address
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg transition-all active:scale-[0.98] shadow-lg disabled:opacity-70"
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
              </form>
            )}

            {step === STEPS.phone && (
              <form onSubmit={handleVerifyPhone} className="space-y-6">
                <div className="rounded-2xl border border-orange-200 bg-orange-50/90 px-4 py-3 text-sm text-orange-800">
                  Confirm the phone number linked to <span className="font-bold">{normalizedEmail}</span>
                </div>

                {phoneHint && (
                  <div className="rounded-2xl border border-white/30 bg-white/70 px-4 py-3 text-sm text-stone-700">
                    Phone on file: <span className="font-bold">{phoneHint}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+84912345678"
                    className="w-full bg-white/70 border border-stone-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(STEPS.email);
                      setPhoneHint("");
                      clearFeedback();
                    }}
                    className="flex-1 py-4 rounded-2xl border border-stone-300 bg-white/70 text-stone-700 font-bold transition-all hover:bg-white"
                  >
                    Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all active:scale-[0.98] shadow-lg disabled:opacity-70"
                  >
                    {loading ? "Confirming..." : "Confirm Phone"}
                  </button>
                </div>
              </form>
            )}

            {step === STEPS.password && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="rounded-2xl border border-green-200 bg-green-50/90 px-4 py-3 text-sm text-green-800">
                  Phone confirmed for <span className="font-bold">{normalizedEmail}</span>
                </div>

                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    New Password
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/70 border border-stone-200 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
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
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    Confirm New Password
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

                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/70 border border-stone-200 rounded-2xl px-5 py-4 pr-12 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg transition-all active:scale-[0.98] shadow-lg disabled:opacity-70"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {message && (
              <div className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

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
