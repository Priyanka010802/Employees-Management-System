// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";

const Dashboard = ({ currentUserEmail }) => {
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminsRes, employeesRes, sessionsRes, tasksRes] =
          await Promise.all([
            fetch(`${API_BASE}/admins`),
            fetch(`${API_BASE}/employees`),
            fetch(
              `${API_BASE}/sessions?email=${encodeURIComponent(
                currentUserEmail || ""
              )}`
            ),
            fetch(`${API_BASE}/tasks`),
          ]);

        setAdmins(await adminsRes.json());
        setEmployees(await employeesRes.json());
        setSessions(await sessionsRes.json());
        setTasks(await tasksRes.json());
      } catch (err) {
        console.error("Dashboard load failed", err);
        setAdmins([]);
        setEmployees([]);
        setSessions([]);
        setTasks([]);
      }
    };

    if (currentUserEmail) fetchData();
  }, [currentUserEmail]);

  // EMPLOYEE METRICS
  const totalEmployees = employees.length;
  const totalSalary = useMemo(
    () => employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0),
    [employees]
  );

  // TASK / PROJECT HEALTH
  const normalizeStatus = (raw) => {
    const s = (raw || "").toLowerCase();
    if (s === "completed" || s === "done" || s === "finished") return "Completed";
    if (s === "inprogress" || s === "in progress" || s === "ongoing")
      return "In Progress";
    return "Pending";
  };

  const projectStatus = useMemo(() => {
    const statusCount = {};
    tasks.forEach((task) => {
      const status = normalizeStatus(task.status);
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: tasks.length ? Math.round((count / tasks.length) * 100) : 0,
    }));
  }, [tasks]);

  const totalProjects = tasks.length;
  const completedProjects =
    projectStatus.find((s) => s.status === "Completed")?.count || 0;
  const inProgressProjects =
    projectStatus.find((s) => s.status === "In Progress")?.count || 0;

  const projectCompletionRate = useMemo(() => {
    if (!tasks.length) return 0;
    const sum = tasks.reduce(
      (acc, t) => acc + (Number(t.progress) || 0),
      0
    );
    return Math.round(sum / tasks.length);
  }, [tasks]);

  const recentTasks = useMemo(
    () =>
      tasks
        .slice()
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, 6),
    [tasks]
  );

  // ADMIN SESSION
  const currentAdmin = useMemo(
    () => admins.find((a) => a.email === currentUserEmail),
    [admins, currentUserEmail]
  );

  const latestSession = useMemo(() => {
    if (!sessions.length) return null;
    return sessions[sessions.length - 1];
  }, [sessions]);

  const formatTime = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Active";

  const formatCurrency = (amount) => `₹${Math.abs(amount).toLocaleString()}`;

  const getStatusGradient = (status) => {
    const gradients = {
      Completed: "from-emerald-500 to-teal-600",
      "In Progress": "from-amber-500 to-orange-600",
      Pending: "from-slate-500 to-slate-700",
      Blocked: "from-rose-500 to-pink-600",
    };
    return gradients[status] || "from-slate-500 to-slate-700";
  };

  return (
    <div className="flex-1 min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),transparent)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-20 h-20 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-blue-100/20 rounded-2xl backdrop-blur-xl flex items-center justify-center shadow-xl">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent tracking-tight drop-shadow-2xl">
              Project Dashboard
            </h1>
            <p className="text-xs bg-white/80 text-slate-800 px-2 py-0.5 rounded-full font-bold tracking-wide">
              Real-time analytics • {totalProjects} active projects
            </p>
          </div>
        </div>
        {currentUserEmail && (
          <p className="text-xs bg-gradient-to-r from-white/70 to-blue-100/70 bg-clip-text text-transparent font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/30">
            {currentUserEmail}
          </p>
        )}
      </header>

      <main className="relative z-10 px-8 py-12 max-w-7xl mx-auto space-y-12">
        {/* Project Health Monitor */}
        <section className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/10 via-cyan-400/5 to-purple-500/10 blur-3xl -z-10" />
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_24px_80px_rgba(15,23,42,0.9)] p-8 lg:p-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8 gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-emerald-200 uppercase mb-2">
                  Overall Progress
                </p>
                <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                  Project Health Monitor
                </h2>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live synced with Tasks
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left: summary */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-white/70 mb-1">Average completion</p>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent leading-none">
                      {projectCompletionRate}%
                    </span>
                    <span className="text-sm text-white/60 mb-2">
                      across {totalProjects || 0} tasks
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-400/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-100">
                      Completed: {completedProjects}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold text-amber-100">
                      In Progress: {inProgressProjects}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-500/20 border border-slate-300/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-xs font-semibold text-slate-100">
                      Pending/Other:{" "}
                      {Math.max(
                        0,
                        totalProjects - completedProjects - inProgressProjects
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center: thermometer */}
              <div className="flex justify-center">
                <div className="relative h-56 w-16">
                  <div className="absolute inset-x-1 top-0 bottom-0 rounded-full bg-slate-900/60 border border-white/10 overflow-hidden">
                    <div
                      className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-emerald-400 via-emerald-300 to-cyan-300"
                      style={{ height: `${projectCompletionRate || 0}%` }}
                    />
                    {[20, 40, 60, 80].map((tick) => (
                      <div
                        key={tick}
                        className="absolute inset-x-0 h-px bg-white/10"
                        style={{ bottom: `${tick}%` }}
                      />
                    ))}
                  </div>
                  <div className="absolute -right-28 top-1/2 -translate-y-1/2 px-4 py-2 rounded-2xl bg-white/10 border border-white/25 backdrop-blur-xl shadow-xl">
                    <p className="text-[11px] text-white/70">On‑track score</p>
                    <p className="text-lg font-bold text-emerald-200">
                      {projectCompletionRate >= 80
                        ? "Excellent"
                        : projectCompletionRate >= 50
                        ? "Stable"
                        : "Needs focus"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: colorful mini distribution */}
              <div className="space-y-4">
                <p className="text-sm text-white/70 flex items-center gap-2">
                  Status distribution
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-wide text-white/60 border border-white/20">
                    Live
                  </span>
                </p>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Completed
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    In Progress
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-500/30 border border-slate-300/50 text-slate-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                    Pending / Other
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {projectStatus.map(({ status, percentage }) => (
                    <div
                      key={status}
                      className="relative flex flex-col items-center justify-end h-40 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-white/10 px-2 py-3 overflow-hidden group"
                    >
                      <div
                        className="absolute inset-x-4 bottom-6 h-20 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"
                        style={{
                          background:
                            status === "Completed"
                              ? "radial-gradient(circle at 50% 100%, rgba(16,185,129,0.9), transparent)"
                              : status === "In Progress"
                              ? "radial-gradient(circle at 50% 100%, rgba(245,158,11,0.9), transparent)"
                              : "radial-gradient(circle at 50% 100%, rgba(148,163,184,0.9), transparent)",
                        }}
                      />
                      <div className="relative flex-1 flex items-end w-full">
                        <div className="w-full rounded-full overflow-hidden bg-white/5 h-full flex items-end">
                          <div
                            className={`w-full rounded-full shadow-lg transition-all duration-500 ${
                              status === "Completed"
                                ? "bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 shadow-emerald-500/60"
                                : status === "In Progress"
                                ? "bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 shadow-amber-500/60"
                                : "bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200 shadow-slate-400/60"
                            }`}
                            style={{ height: `${Math.max(8, percentage)}%` }}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-white/90 text-center truncate w-full">
                        {status}
                      </p>
                      <p className="text-[11px] text-white/60">{percentage}%</p>
                    </div>
                  ))}
                  {projectStatus.length === 0 && (
                    <p className="col-span-3 text-xs text-white/60 text-center mt-4">
                      No task data yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Team Size",
              value: totalEmployees,
              icon: "👥",
              gradient: "from-sky-500 to-cyan-600",
            },
            {
              label: "Active Projects",
              value: inProgressProjects,
              icon: "⏳",
              gradient: "from-amber-500 to-orange-600",
            },
            {
              label: "Completed",
              value: completedProjects,
              icon: "✅",
              gradient: "from-emerald-500 to-teal-600",
            },
            {
              label: "Monthly Cost",
              value: formatCurrency(totalSalary),
              icon: "💰",
              gradient: "from-purple-500 to-violet-600",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`group relative rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 overflow-hidden border border-white/20 backdrop-blur-xl ${item.gradient}`}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 animate-shimmer" />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/30 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-all duration-500 mx-auto lg:mx-0">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="space-y-2 text-center lg:text-left">
                  <p className="text-3xl lg:text-4xl font-black group-hover:scale-105 transition-transform">
                    {item.value}
                  </p>
                  <p className="text-lg font-bold opacity-90 capitalize tracking-wide">
                    {item.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Breakdown + Recent projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/10">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Project Status Breakdown
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4 max-height-80 overflow-y-auto">
                {projectStatus.map(({ status, count, percentage }) => (
                  <div
                    key={status}
                    className="group p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/20 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br ${getStatusGradient(
                            status
                          )}`}
                        >
                          <span className="text-2xl font-bold">●</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-white capitalize">
                            {status}
                          </p>
                          <p className="text-sm text-white/70">
                            {percentage}% of total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-white">
                          {count}
                        </p>
                        <div className="w-24 h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full shadow-lg bg-gradient-to-r ${getStatusGradient(
                              status
                            )}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {projectStatus.length === 0 && (
                  <p className="text-sm text-white/70 text-center">
                    No projects yet.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Recent Projects – new professional layout */}
          <section className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/10">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Recent Projects
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/80">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentTasks.map((task) => {
                    const displayStatus = normalizeStatus(task.status);

                    const statusClasses =
                      displayStatus === "Completed"
                        ? "bg-emerald-500 text-white shadow-emerald-500/40"
                        : displayStatus === "In Progress"
                        ? "bg-amber-400 text-slate-900 shadow-amber-400/40"
                        : "bg-slate-600 text-white shadow-slate-500/40";

                    const priorityClasses =
                      task.priority === "High" || task.priority === "Most Urgent"
                        ? "bg-red-500 text-white shadow-red-500/40"
                        : task.priority === "Medium" || task.priority === "Normal"
                        ? "bg-amber-500 text-white shadow-amber-500/40"
                        : "bg-emerald-500 text-white shadow-emerald-500/40";

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-white/5 transition-all duration-300"
                      >
                        {/* Project */}
                        <td className="px-8 py-5 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-md">
                              <span className="text-lg">📄</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-sm md:text-base truncate">
                                {task.title}
                              </p>
                              {task.projectTitle && (
                                <p className="text-xs md:text-sm text-white/60 truncate">
                                  {task.projectTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status pill */}
                        <td className="px-6 py-5 align-middle">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-1.5 py-1">
                            <span
                              className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${statusClasses}`}
                            >
                              {displayStatus}
                            </span>
                          </div>
                        </td>

                        {/* Priority pill */}
                        <td className="px-8 py-5 align-middle">
                          <span
                            className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${priorityClasses}`}
                          >
                            {task.priority || "Normal"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {recentTasks.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-8 py-10 text-center text-white/70 text-sm"
                      >
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Admin Session */}
        <section className="bg-white/5 backdrop-blur-3xl rounded-3xl border border_WHITE/10 shadow-2xl overflow-hidden">
          <div className="px-8 py-8 border-b border-white/10">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Current Session
            </h2>
          </div>
          <div className="px-8 py-12">
            {!currentAdmin ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-6 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">👤</span>
                </div>
                <p className="text-xl text-white/80 font-bold">
                  No admin session active
                </p>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="flex items-center gap-6 p-8 bg_WHITE/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-bold text-white">A</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-white">
                      {currentAdmin.email}
                    </p>
                    <p className="text-sm text-white/70">Active Admin</p>
                    <p className="text-xs text_WHITE/60 mt-2">
                      <span className="font-semibold">Last Login:</span>{" "}
                      {formatTime(latestSession?.loginAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
