// src/page/Goals.jsx
import { useMemo, useState } from "react";

const sampleGoals = [
  {
    id: "g1",
    employeeName: "Priya Sharma",
    role: "Frontend Developer",
    department: "Engineering",
    avatar: "",
    yearlyTarget: "Ship 4 major UI features",
    kpis: ["Improve Lighthouse score to 95+", "Reduce UI bugs by 40%"],
    progress: 82,
    achievements: [
      "Dark mode rollout for EMS",
      "Built animated employee directory dashboard"
    ],
    isEmployeeOfYear: true
  },
  {
    id: "g2",
    employeeName: "Raj Patel",
    role: "Backend Developer",
    department: "Engineering",
    avatar: "",
    yearlyTarget: "Stabilize API & performance",
    kpis: ["99.9% API uptime", "Average API latency < 250ms"],
    progress: 65,
    achievements: ["Refactored auth service", "Introduced rate limiting"],
    isEmployeeOfYear: false
  },
  {
    id: "g3",
    employeeName: "Anita Gupta",
    role: "DevOps Engineer",
    department: "IT Operations",
    avatar: "",
    yearlyTarget: "Automate infra & releases",
    kpis: ["CI/CD for all services", "Zero manual deployments"],
    progress: 48,
    achievements: ["Created EMS CI pipeline"],
    isEmployeeOfYear: false
  }
];

const Goals = () => {
  const [goals] = useState(sampleGoals);
  const [selectedYear] = useState("2025");
  const [viewMode, setViewMode] = useState("overview");

  const overallCompletion = useMemo(() => {
    if (!goals.length) return 0;
    return Math.round(
      goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
    );
  }, [goals]);

  const bestEmployee = goals.find((g) => g.isEmployeeOfYear) || goals[0];

  return (
    <div className="flex-1 min-h-screen bg-slate-50 relative">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-50" />
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-3 md:px-6 py-5 space-y-6">
        {/* Header */}
        <header className="rounded-3xl bg-white/90 border border-slate-200 shadow-sm px-4 md:px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500/10 to-emerald-500/10 border border-sky-200 flex items-center justify-center text-lg">
                🎯
              </div>
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">
                  Goals & Achievements
                </h1>
                <p className="text-xs md:text-sm text-slate-500">
                  Track employee yearly goals, completion and recognition.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-slate-700">
                  {overallCompletion}% goals completed
                </span>
              </div>

              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="overview">Overview</option>
                <option value="employee">By employee</option>
              </select>

              <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-900 text-white text-xs px-3 py-1.5">
                <span className="font-medium">Year</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10">
                  {selectedYear}
                </span>
              </div>
            </div>
          </div>

          {/* overall progress bar */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {overallCompletion}% of yearly goals completed
            </span>
          </div>
        </header>

        {/* Top row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Employee of the Year */}
          <div className="lg:col-span-2 rounded-3xl bg-white/90 border border-amber-200 shadow-sm px-4 md:px-6 py-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-100/80 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-lg font-semibold text-white shadow-md">
                    {bestEmployee?.employeeName?.charAt(0) || "E"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] text-white shadow-sm">
                    ⭐
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                    Employee of the Year
                  </p>
                  <h2 className="text-sm md:text-base font-semibold text-slate-900">
                    {bestEmployee?.employeeName}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {bestEmployee?.role} · {bestEmployee?.department}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-slate-400">Goal progress</p>
                <p className="text-lg font-semibold text-slate-900">
                  {bestEmployee?.progress ?? 0}%
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                  Yearly target
                </p>
                <p className="text-slate-800">
                  {bestEmployee?.yearlyTarget || "No target defined."}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                  Key KPIs
                </p>
                <ul className="text-slate-700 space-y-0.5 list-disc list-inside">
                  {(bestEmployee?.kpis || []).map((kpi) => (
                    <li key={kpi}>{kpi}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                Achievements
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(bestEmployee?.achievements || []).map((ach) => (
                  <span
                    key={ach}
                    className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[11px]"
                  >
                    {ach}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="space-y-3">
            <div className="rounded-2xl bg-white/90 border border-slate-200 px-4 py-3 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase">
                Total employees with goals
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {goals.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Each employee has at least one yearly goal assigned.
              </p>
            </div>

            <div className="rounded-2xl bg-white/90 border border-sky-200 px-4 py-3 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase">
                High performers
              </p>
              <p className="mt-1 text-xl font-semibold text-sky-600">
                {goals.filter((g) => g.progress >= 80).length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Employees with goal completion above 80%.
              </p>
            </div>

            <div className="rounded-2xl bg-white/90 border border-emerald-200 px-4 py-3 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase">
                On track (≥ 50%)
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-600">
                {goals.filter((g) => g.progress >= 50).length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Employees progressing at a healthy pace.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Goals;
