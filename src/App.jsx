// src/App.jsx
import { useState } from "react";
import LoginPage from "./page/Login Page";
import Dashboard from "./page/Dashboard";
import ManageEmployees from "./page/Employees";
import CategoryPage from "./page/Categories";
import Tasks from "./page/Tasks";
// import Chat from "./page/Chart"; // removed
// import Workflows from "./page/HRWorkflowsPage";
import Attendance from "./page/Attendance";
// import Reports from "./page/REport";
import Goals from "./page/Goals";

const API_BASE = "http://localhost:3000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [currentSession, setCurrentSession] = useState(null);

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
          logoutAt: null
        })
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
          body: JSON.stringify({ logoutAt: new Date().toISOString() })
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

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard", color: "from-indigo-400 to-blue-500" },
    { id: "employees", icon: "👥", label: "Manage Employees", color: "from-emerald-400 to-teal-500" },
    { id: "category", icon: "📂", label: "departments", color: "from-purple-400 to-pink-500" },
    { id: "tasks", icon: "✅", label: "Task Management", color: "from-sky-400 to-indigo-500" },
    // { id: "chat", icon: "💬", label: "Mobile App Chat", color: "from-cyan-400 to-blue-500" }, // removed
    // { id: "workflows", icon: "🔁", label: "HR Workflows", color: "from-fuchsia-400 to-purple-500" },
    { id: "attendance", icon: "⏱️", label: "Time & Attendance", color: "from-amber-400 to-orange-500" },
    // { id: "reports", icon: "📊", label: "Reports", color: "from-emerald-400 to-green-500" },
    { id: "goals", icon: "🎯", label: "Goals", color: "from-pink-400 to-purple-500" }
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.25),transparent_50%)]" />
      </div>

      <aside className="relative z-20 w-72 flex-shrink-0 bg-white/10 backdrop-blur-3xl border-r border-white/20 shadow-2xl">
        <div className="h-20 flex items-center px-8 border-b border-white/20 bg-white/5 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl">
              <span className="text-xl font-bold text-white">CY</span>
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-lg">
                InnovaHire
              </h1>
              <p className="text-xs text-white/70 font-medium tracking-wide">
                Employee Management
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
          {navItems.map(({ id, icon, label, color }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`
                group relative w-full flex items-center gap-4 px-6 py-4 rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-xl shadow-lg
                transition-all duration-500 hover:-translate-x-2 hover:scale-[1.02] hover:bg-white/15
                ${
                  activePage === id
                    ? "ring-4 ring-white/40 shadow-3xl shadow-indigo-500/50 bg-white/25 translate-x-1 scale-[1.02]"
                    : "hover:border-white/40"
                }
              `}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                {icon}
              </span>
              <span className="text-sm md:text-base font-bold text-white drop-shadow-lg whitespace-nowrap">
                {label}
              </span>

              {activePage === id && (
                <div className="absolute right-4 w-2 h-2 rounded-full bg-gradient-to-b from-white to-blue-200 shadow-lg animate-pulse" />
              )}

              <div
                className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  bg-gradient-to-r ${color} blur-xl -inset-1 scale-[1.1] animate-pulse
                `}
              />
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-4 px-6 py-4 rounded-2xl border-2 border-white/20 bg-gradient-to-r from-rose-400/80 to-red-500/80 backdrop-blur-xl text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-rose-500/50 hover:from-rose-500 hover:to-red-600 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 transform"
          >
            <span className="text-xl group-hover:rotate-180 transition-transform duration-300">
              ⏻
            </span>
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex">
        {activePage === "dashboard" && (
          <Dashboard currentUserEmail={currentUserEmail} />
        )}
        {activePage === "employees" && <ManageEmployees />}
        {activePage === "category" && <CategoryPage />}
        {activePage === "tasks" && <Tasks />}
        {/* {activePage === "chat" && <Chat />} // removed */}
        {activePage === "workflows" && <Workflows />}
        {activePage === "attendance" && <Attendance />}
        {activePage === "reports" && <Reports />}
        {activePage === "goals" && <Goals />}
      </div>
    </div>
  );
}

export default App;
