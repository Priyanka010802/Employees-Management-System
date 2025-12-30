// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const VALID_EMAIL = "admin@gmail.com";
const VALID_PASSWORD = "admin123";

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-out-quart",
    });
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
    <div
      className="min-h-screen w-full flex items-center justify-center px-3 sm:px-6 lg:px-10 relative"
      style={{
        backgroundImage:
          "url('https://static.vecteezy.com/system/resources/previews/001/180/980/non_2x/abstract-geometric-3d-textured-shape-white-background-vector.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/50 sm:bg-slate-950/45 lg:bg-slate-950/40 pointer-events-none" />

      {/* centered content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* outer browser-like frame */}
        <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.7)] overflow-hidden border border-white/40">
          {/* fake browser top bar */}
          <div className="h-9 flex items-center px-4 border-b border-white/40 bg-white/70 backdrop-blur-xl">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="ml-3 h-5 flex-1 rounded-full bg-slate-100/80" />
          </div>

          {/* main layout */}
          <div
            className="flex flex-col lg:flex-row min-h-[480px] bg-slate-50/80"
            data-aos="fade-up"
          >
            {/* left side: text / branding */}
            <div className="w-full lg:w-1/2 px-6 sm:px-10 py-6 sm:py-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200/70">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-xs sm:text-sm text-emerald-700 shadow-sm shadow-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Secure HR Admin Portal
              </p>

              <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                HR Management System
              </h1>

              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md">
                Manage employees, attendance, tasks, and workflows from a
                single, modern admin dashboard optimized for laptop, tablet,
                and mobile.
              </p>

              <ul className="mt-4 space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-4 rounded-full bg-emerald-400/80 animate-[pulse_2s_ease-in-out_infinite]" />
                  Real-time employee overview and status.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-4 rounded-full bg-sky-400/80 animate-[pulse_2.4s_ease-in-out_infinite]" />
                  Task management with visual progress tracking.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-4 rounded-full bg-violet-400/80 animate-[pulse_2.8s_ease-in-out_infinite]" />
                  Optimized for desktop, tablet, and mobile views.
                </li>
              </ul>
            </div>

            {/* right side: login card */}
            <div className="w-full lg:w-1/2 px-6 sm:px-10 py-6 sm:py-10 flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50 relative">
              {/* subtle decorative shapes */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-10 right-4 h-32 w-32 rounded-[32px] border border-sky-200/60" />
                <div className="absolute bottom-6 left-10 h-20 w-20 rounded-[28px] border border-emerald-200/60" />
                <div className="absolute -bottom-16 right-10 h-40 w-40 bg-sky-300/25 blur-3xl rounded-full" />
              </div>

              <div className="relative w-full max-w-md">
                {/* animated gradient border */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-tr from-emerald-400/70 via-white to-sky-400/70 opacity-90 blur-sm" />

                <div className="relative w-full rounded-3xl bg-white border border-slate-200 px-5 sm:px-6 lg:px-7 py-5 sm:py-6 lg:py-7 shadow-2xl shadow-slate-300/70">
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                        Admin Login
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Sign in with your authorized admin credentials.
                      </p>
                    </div>
                    <div className="h-9 w-9 flex items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-lg shadow shadow-emerald-100">
                      HR
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-xs sm:text-sm font-medium text-slate-700"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
                        placeholder="admin@company.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs sm:text-sm font-medium text-slate-700"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700">
                        <input
                          type="checkbox"
                          name="agree"
                          checked={formData.agree}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                        />
                        <span className="select-none">
                          I agree to the admin usage policy.
                        </span>
                      </label>

                      <button
                        type="button"
                        className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-500 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {error && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs sm:text-sm text-rose-700 flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span>{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs sm:text-sm text-emerald-700 flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>{success}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full inline-flex justify-center items-center rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg shadow-emerald-300/70 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-100"
                    >
                      Sign in as Admin
                    </button>
                  </form>

                  <p className="mt-4 sm:mt-5 text-[11px] sm:text-xs text-slate-500 text-center">
                    © 2025 Code With Yousof • IT HR Portal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
