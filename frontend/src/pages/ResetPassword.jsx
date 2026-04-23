import React from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
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
