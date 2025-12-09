// src/pages/LoginPage.jsx
import { useState } from "react";

const VALID_EMAIL = "priyankasangamkar@gmail.com";
const VALID_PASSWORD = "admin";

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.agree) {
      setError("Please accept the terms to continue.");
      return;
    }

    const isValidEmail = formData.email === VALID_EMAIL;
    const isValidPassword = formData.password === VALID_PASSWORD;

    if (isValidEmail && isValidPassword) {
      setSuccess("Login successful. Redirecting...");
      setError("");
      setTimeout(() => {
        if (typeof onLoginSuccess === "function") {
          onLoginSuccess(formData.email);
        }
      }, 1200);
    } else {
      setError("Invalid email or password.");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden bg-slate-950">
      {/* Software/IT Sector Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), 
                           url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      />

      {/* Center card - unchanged */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-800/70 bg-gradient-to-br from-indigo-500/50 via-slate-900/70 to-purple-600/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl mb-4 mx-auto">
              <span className="text-xl">💻</span>
            </div>
            <h1 className="text-center text-xl font-semibold text-slate-50">
              Corporate Portal
            </h1>
            <p className="text-center text-xs text-slate-300 mt-1">
              HR Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-200 mb-1.5 uppercase tracking-wide"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="priyankasangamkar@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-200 mb-1.5 uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Terms + button row */}
            <div className="flex flex-col gap-3 pt-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-200">
                <input
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Accept terms & conditions</span>
              </label>

              <button
                type="submit"
                disabled={!formData.agree}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Login
              </button>
            </div>

            {/* Messages */}
            {error && (
              <p className="text-[11px] text-rose-300 pt-1">{error}</p>
            )}
            {success && (
              <p className="text-[11px] text-emerald-300 pt-1">{success}</p>
            )}
          </form>

          {/* Footer */}
          <div className="px-8 pb-4 pt-2 border-t border-slate-800/70">
            <p className="text-[10px] text-slate-500 text-center">
              © 2025 Code With Yousof • IT HR Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
