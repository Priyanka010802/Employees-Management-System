// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

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

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-out-quart" });
  }, []);

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

      {/* BG IMAGE WITH OVERLAY */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)),
            url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=2070&q=80')
          `,
        }}
      />

      {/* Floating Blobs (Soft Glowing Animation) */}
      <div className="absolute -top-32 -left-20 h-80 w-80 bg-indigo-500/30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute -bottom-32 -right-20 h-80 w-80 bg-purple-500/30 blur-3xl rounded-full animate-pulse" />

      {/* LOGIN CARD */}
      <div
        className="relative z-10 w-full max-w-md"
        data-aos="zoom-in"
      >
        <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-2xl shadow-2xl overflow-hidden
                        transition-all duration-300 hover:shadow-indigo-500/40 hover:border-indigo-400/60">

          {/* HEADER */}
          <div className="px-8 pt-8 pb-6 border-b border-white/20 bg-white/10 backdrop-blur-xl">
            <div
              className="w-16 h-16 rounded-2xl mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 
                         flex items-center justify-center shadow-xl animate-fadeIn"
            >
              <span className="text-3xl text-white">💻</span>
            </div>

            <h1 className="text-center text-xl font-semibold mt-3 text-indigo-100 animate-slideDown">
              Corporate Portal
            </h1>

            <p className="text-center text-sm text-slate-300">
              HR Management System
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5" data-aos="fade-up">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5 tracking-wider">
                Email Address
              </label>

              <input
                name="email"
                type="email"
                placeholder="priyankasangamkar@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/20 bg-white/10 
                           px-4 py-3 text-sm text-slate-100 placeholder-slate-400
                           backdrop-blur-xl focus:border-indigo-400 focus:ring-2 
                           focus:ring-indigo-500/40 transition-all"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5 tracking-wider">
                Password
              </label>

              <input
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/20 bg-white/10 
                           px-4 py-3 text-sm text-slate-100 placeholder-slate-400
                           backdrop-blur-xl focus:border-purple-400 focus:ring-2 
                           focus:ring-purple-500/40 transition-all"
                required
              />
            </div>

            {/* TERMS + BUTTON */}
            <div className="flex flex-col gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-indigo-400 focus:ring-indigo-400"
                />
                Accept Terms & Conditions
              </label>

              <button
                type="submit"
                disabled={!formData.agree}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 
                           py-3 text-sm font-semibold text-white shadow-lg hover:scale-[1.02]
                           active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                Login
              </button>
            </div>

            {/* MESSAGES */}
            {error && <p className="text-[12px] text-rose-300">{error}</p>}
            {success && <p className="text-[12px] text-emerald-300">{success}</p>}
          </form>

          {/* FOOTER */}
          <div className="px-8 pb-4 pt-2 border-t border-white/20 bg-white/5 backdrop-blur-xl">
            <p className="text-[11px] text-slate-400 text-center">
              © 2025 Code With Yousof • IT HR Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
