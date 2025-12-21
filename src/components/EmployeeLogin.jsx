import React, { useState } from "react";

const EmployeeLogin = ({ onLoginSuccess }) => {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!empId || !password || isSubmitting) return;

    setIsSubmitting(true);

    // TODO: yahan future me real API call laga sakte ho
    setTimeout(() => {
      setLoginSuccess(true);

      // thoda subtle delay, fir parent ko notify
      setTimeout(() => {
        onLoginSuccess(empId);
      }, 1000);
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {/* top bluish band */}
      <div className="fixed inset-x-0 top-0 h-60 bg-gradient-to-b from-sky-100 via-emerald-50/70 to-transparent pointer-events-none -z-10" />

      <div className="max-w-md w-full mx-4">
        <div className="bg-white/95 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] rounded-3xl border border-slate-100 px-8 py-9">
          {/* Logo + heading */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4 h-20 w-20">
              <div className="absolute inset-0 -inset-1 rounded-3xl bg-emerald-300/60 blur-lg" />
              <div className="relative h-full w-full bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-400/40">
                <span className="text-2xl font-bold text-white">👷</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Employee Portal
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Login to mark today&apos;s attendance.
            </p>
          </div>

          {/* Success state */}
          {loginSuccess ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-5 text-center animate-fade-in">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                ✓
              </div>
              <p className="text-sm font-semibold text-emerald-800">
                Login successful
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Redirecting to your attendance dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="EMP001 or email"
                  required
                  className="w-full px-4 py-3 border border-emerald-200 rounded-xl bg-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
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
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 border border-emerald-200 rounded-xl bg-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-emerald-400/40 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? "Checking…" : "Login & Mark Attendance"}
              </button>
            </form>
          )}
        </div>

        {/* Small footer note */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Your credentials are used only to verify identity and link attendance to
          your employee account.
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
