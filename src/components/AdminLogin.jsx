// src/page/AdminLogin.jsx
import React, { useState } from "react";

const AdminLogin = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg("");

    // Frontend-only fixed credentials
    const VALID_EMAIL = "admin@gmail.com";
    const VALID_PASSWORD = "admin123";

    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        setSuccess(true);

        setTimeout(() => {
          onLoginSuccess(email);
        }, 900);
      } else {
        setIsSubmitting(false);
        setSuccess(false);
        setErrorMsg("Invalid admin email or password. Please try again.");
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      {/* background band + blur shapes */}
      <div className="fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-100 via-emerald-50/70 to-transparent pointer-events-none -z-10" />
      <div className="fixed -left-24 bottom-0 h-64 w-64 bg-sky-200/40 blur-3xl -z-10" />
      <div className="fixed -right-24 top-10 h-64 w-64 bg-emerald-200/40 blur-3xl -z-10" />

      <div className="max-w-5xl w-full mx-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 bg-white/90 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] overflow-hidden">
          {/* Left: brand / info */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900 text-white px-8 py-8 relative">
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-sky-500/40 blur-3xl" />
              <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-emerald-500/30 blur-3xl" />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white"
              >
                <span>← Back to home</span>
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-white">IH</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-200">
                    InnovaHire
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    Admin Workspace
                  </h2>
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2">
                Control hiring & placements with confidence.
              </h1>
              <p className="text-sm text-slate-200 max-w-sm">
                Sign in as an admin to configure job postings, track recruitment
                pipelines and oversee placement drives across the organization.
              </p>
            </div>

            <div className="relative mt-6 text-[11px] text-slate-300/90">
              <p>Admin access is restricted. Do not share your credentials.</p>
            </div>
          </div>

          {/* Right: login form */}
          <div className="px-6 py-7 md:px-8 md:py-8 bg-white">
            {/* back button on mobile */}
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex md:hidden items-center gap-2 text-xs text-slate-500 hover:text-slate-700"
            >
              ← Back to home
            </button>

            <div className="text-center mb-6 md:mb-7">
              <div className="relative mx-auto mb-4 h-16 w-16">
                <div className="absolute inset-0 -inset-1 rounded-2xl bg-sky-300/50 blur-md" />
                <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-2xl text-white shadow-md">
                  🔐
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                Admin sign in
              </h2>
              <p className="mt-1 text-xs md:text-sm text-slate-500">
                Use your authorized admin email and password to continue.
              </p>
              
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            {success ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                  ✓
                </div>
                <p className="text-sm font-semibold text-emerald-800">
                  Login successful
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Redirecting to admin dashboard…
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Admin email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@innovahire.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-sky-300/50 hover:shadow-sky-400/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "Signing in…" : "Login as Admin"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
