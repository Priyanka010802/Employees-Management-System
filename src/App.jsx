// src/App.jsx
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import LoginPage from "./page/Login Page";
import Dashboard from "./page/Dashboard";
import ManageEmployees from "./page/Employees";
import CategoryPage from "./page/Categories";
import Tasks from "./page/Tasks";
import Attendance from "./page/Attendance";
import Goals from "./page/Goals";

const API_BASE = "http://localhost:3000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [currentSession, setCurrentSession] = useState(null);

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const handleLoginSuccess = async (email) => {
    setCurrentUserEmail(email);
    setIsLoggedIn(true);
    setActivePage("dashboard");

    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          loginAt: new Date().toISOString(),
          logoutAt: null,
        }),
      });
      const data = await res.json();
      setCurrentSession(data);
    } catch (e) {
      console.error("Failed to create session", e);
    }
  };

  const handleLogout = async () => {
    if (currentSession?.id) {
      try {
        await fetch(`${API_BASE}/sessions/${currentSession.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoutAt: new Date().toISOString() }),
        });
      } catch (e) {
        console.error("Failed to update session", e);
      }
    }

    setIsLoggedIn(false);
    setCurrentUserEmail("");
    setCurrentSession(null);
    setActivePage("dashboard");
  };

  const goToTasks = () => setActivePage("tasks");

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard", color: "from-indigo-400 to-blue-500" },
    { id: "employees", icon: "👥", label: "Manage Employees", color: "from-emerald-400 to-teal-500" },
    { id: "category", icon: "📂", label: "Departments", color: "from-purple-400 to-pink-500" },
    { id: "tasks", icon: "✅", label: "Task Management", color: "from-sky-400 to-indigo-500" },
    { id: "attendance", icon: "⏱️", label: "Time & Attendance", color: "from-amber-400 to-orange-500" },
    { id: "goals", icon: "🎯", label: "Goals", color: "from-pink-400 to-purple-500" },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">

      {/* Background Blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        data-aos="fade-in"
      >
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
      </div>

      {/* SIDEBAR */}
      <aside
        className="relative z-20 w-72 flex-shrink-0 bg-white/70 backdrop-blur-2xl border-r border-slate-200/70 shadow-xl"
        data-aos="fade-right"
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-7 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
              data-aos="zoom-in"
            >
              <span className="text-xl font-bold text-white">CY</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">InnovaHire</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Employee Management
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ id, icon, label, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePage(id)}
              data-aos="fade-up"
              className={`relative w-full flex items-center gap-3 px-5 py-3 rounded-2xl border
                        bg-white/60 backdrop-blur-xl shadow-sm text-left transition-all duration-300
                        ${
                          activePage === id
                            ? "border-indigo-400/70 shadow-lg shadow-indigo-200/80"
                            : "border-slate-200/70 hover:border-slate-300 hover:bg-white/80"
                        }
              `}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-base 
                             font-semibold text-white bg-gradient-to-br ${color}`}
              >
                {icon}
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {label}
              </span>

              {activePage === id && (
                <span
                  className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]"
                  data-aos="zoom-in"
                />
              )}
            </button>
          ))}
        </nav>

        {/* LOGOUT */}
        <div
          className="px-5 py-4 border-t border-slate-200/70 bg-white/80 backdrop-blur-2xl"
          data-aos="fade-up"
        >
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
                       bg-rose-500 text-white text-sm font-semibold shadow-sm hover:bg-rose-600 transition-colors"
          >
            <span className="text-lg">⏻</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className="relative z-10 flex-1 flex"
        data-aos="fade-left"
        data-aos-delay="200"
      >
        {activePage === "dashboard" && (
          <Dashboard currentUserEmail={currentUserEmail} onViewTasks={goToTasks} />
        )}
        {activePage === "employees" && <ManageEmployees />}
        {activePage === "category" && <CategoryPage />}
        {activePage === "tasks" && <Tasks />}
        {activePage === "attendance" && <Attendance />}
        {activePage === "goals" && <Goals />}
      </div>
    </div>
  );
}

export default App;
