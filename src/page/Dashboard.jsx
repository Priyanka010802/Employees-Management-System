// src/page/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";

const Dashboard = ({ currentUserEmail, onViewTasks }) => {
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

  const normalizeStatus = (raw) => {
    const s = (raw || "").toLowerCase();
    if (s === "completed" || s === "done" || s === "finished") return "Completed";
    if (s === "in-progress" || s === "in progress" || s === "ongoing")
      return "In Progress";
    return "Pending";
  };

  const totalEmployees = employees.length;
  const totalSalary = useMemo(
    () => employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0),
    [employees]
  );

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

  // mini graph helpers
  const teamSizePercent = Math.min(100, (totalEmployees / 50) * 100 || 0); // assume 50 as a soft cap
  const inProgressPercent = Math.min(
    100,
    (inProgressProjects / (totalProjects || 1)) * 100
  );
  const costPercent = Math.min(100, (totalSalary / 500000) * 100 || 0); // assume 5L as soft cap

  return (
    <div className="min-h-screen w-full bg-slate-50 relative ">
      {/* animated background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-50" />
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 lg:py-8">
        {/* TOP BAR */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-sky-500 text-white font-bold shadow-lg animate-[float_6s_ease-in-out_infinite]">
              D
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">
                Welcome  {currentAdmin?.name || "Admin"}
              </p>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-800">
                Dashboard 
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="tracking-wide">
                {new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {currentUserEmail && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 shadow-sm border border-slate-100 backdrop-blur-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                  {currentUserEmail[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col text-xs">
                  <span className="text-slate-700 font-semibold">
                    {currentUserEmail}
                  </span>
                  <span className="text-emerald-500 font-medium">Admin</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* TOP SUMMARY ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
          {/* Today / completion ring */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Today</p>
                <p className="text-sm text-slate-400">
                  Overall project completion
                </p>
              </div>
              <span className="px-2 py-1 text-[11px] rounded-full bg-rose-50 text-rose-500 font-semibold">
                {projectCompletionRate >= 80
                  ? "Excellent"
                  : projectCompletionRate >= 50
                  ? "On track"
                  : "Attention"}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="stroke-slate-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="stroke-emerald-500 transition-all duration-700"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={
                      2 * Math.PI * 32 * (1 - projectCompletionRate / 100)
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-slate-800">
                    {projectCompletionRate || 0}%
                  </span>
                </div>
              </div>
              <div className="flex-1 text-xs text-slate-500">
                <p className="mb-1">
                  You have{" "}
                  <span className="font-semibold text-slate-700">
                    {totalProjects}
                  </span>{" "}
                  active tasks.
                </p>
                <p>
                  Completed{" "}
                  <span className="font-semibold text-emerald-600">
                    {completedProjects}
                  </span>{" "}
                  • In progress{" "}
                  <span className="font-semibold text-amber-500">
                    {inProgressProjects}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onViewTasks}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold py-2.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>View full tasks board</span>
              <span className="text-xs">↗</span>
            </button>
          </div>

          {/* KPI cards with animated mini graphs */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4">
            {/* Team size */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm px-4 py-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Team size
              </p>
              <p className="text-lg font-semibold text-slate-800 mb-1">
                {totalEmployees || 0}
              </p>
              <p className="text-[11px] text-emerald-500 font-medium mb-3">
                Active employees
              </p>
              {/* mini bar */}
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-700"
                  style={{ width: `${Math.max(4, teamSizePercent)}%` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.5)_0,transparent_40%,transparent_60%,rgba(255,255,255,0.5)_100%)] bg-[length:200%_100%] animate-[gradientSlide_3s_linear_infinite]" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Approx capacity usage {Math.round(teamSizePercent)}%
              </p>
            </div>

            {/* Active projects */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm px-4 py-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Active projects
              </p>
              <p className="text-lg font-semibold text-slate-800 mb-1">
                {inProgressProjects}
              </p>
              <p className="text-[11px] text-amber-500 font-medium mb-3">
                In progress
              </p>
              {/* mini stacked column */}
              <div className="flex items-end gap-1.5 h-10">
                <div className="flex-1 h-full rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-amber-500 via-amber-400 to-orange-400 transition-all duration-700"
                    style={{ height: `${Math.max(10, inProgressPercent)}%` }}
                  />
                  <div className="absolute inset-0 bg-white/10" />
                </div>
                <div className="w-1.5 h-3 rounded-full bg-slate-200" />
                <div className="w-1.5 h-5 rounded-full bg-slate-200" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {Math.round(inProgressPercent)}% of all tasks
              </p>
            </div>

            {/* Monthly cost */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm px-4 py-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Monthly cost
              </p>
              <p className="text-lg font-semibold text-slate-800 mb-1">
                {formatCurrency(totalSalary)}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mb-3">
                Approx salary payroll
              </p>
              {/* mini sparkline */}
              <div className="h-14 w-full relative">
                <svg
                  viewBox="0 0 100 40"
                  className="absolute inset-0 text-sky-400/80"
                >
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    points="0,30 20,25 35,28 50,18 65,22 80,15 100,18"
                    className="animate-[dash_3s_ease-in-out_infinite]"
                    strokeDasharray="140"
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-x-0 bottom-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Utilization {Math.round(costPercent)}% of planned budget
              </p>
            </div>
          </div>

          {/* donut */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">
                Task completion
              </p>
              <button
                type="button"
                onClick={onViewTasks}
                className="text-[11px] text-sky-500 font-semibold hover:text-sky-600 transition-colors"
              >
                View stats
              </button>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="34"
                    className="stroke-slate-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="34"
                    className="stroke-emerald-500 transition-all duration-700"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      34 *
                      (1 - completedProjects / (totalProjects || 1))
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold text-slate-800">
                    {completedProjects}/{totalProjects || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Completed</span>
                </div>
              </div>

              <div className="flex-1 text-xs text-slate-500 space-y-1.5">
                <p>
                  On time tasks:{" "}
                  <span className="font-semibold text-emerald-600">
                    {completedProjects}
                  </span>
                </p>
                <p>
                  In progress:{" "}
                  <span className="font-semibold text-amber-500">
                    {inProgressProjects}
                  </span>
                </p>
                <p>
                  Pending/other:{" "}
                  <span className="font-semibold text-slate-600">
                    {Math.max(
                      0,
                      totalProjects - completedProjects - inProgressProjects
                    )}
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-emerald-500 font-medium flex items-center gap-1">
              ↑ Performing better than last week
            </p>
          </div>
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project status distribution */}
          <section className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Project status distribution
              </h2>
              <span className="px-2 py-1 rounded-full bg-emerald-50 text-[11px] text-emerald-600 font-medium">
                Live synced
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {projectStatus.map(({ status, percentage }) => (
                <div
                  key={status}
                  className="flex flex-col items-center justify-end h-40 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-100 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex-1 flex items-end w-full px-4 pb-4">
                    <div className="w-full bg-slate-100 rounded-full h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-full ${
                          status === "Completed"
                            ? "bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300"
                            : status === "In Progress"
                            ? "bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300"
                            : "bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200"
                        } transition-all duration-700`}
                        style={{ height: `${Math.max(10, percentage)}%` }}
                      />
                    </div>
                  </div>
                  <div className="relative pb-3 text-center">
                    <p className="text-xs font-semibold text-slate-800">
                      {status}
                    </p>
                    <p className="text-[11px] text-slate-400">{percentage}%</p>
                  </div>
                </div>
              ))}
              {projectStatus.length === 0 && (
                <p className="col-span-3 text-xs text-slate-400 text-center py-8">
                  No task data yet.
                </p>
              )}
            </div>
          </section>

          {/* Recent tasks */}
          <section className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Working history (recent tasks)
              </h2>
              <button
                type="button"
                onClick={onViewTasks}
                className="text-[11px] text-sky-500 font-semibold hover:text-sky-600 transition-colors"
              >
                Show all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] text-slate-400">
                    <th className="py-2 pr-4 font-medium">Task</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTasks.map((task) => {
                    const displayStatus = normalizeStatus(task.status);

                    const statusClasses =
                      displayStatus === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : displayStatus === "In Progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700";

                    const priorityClasses =
                      task.priority === "High" || task.priority === "Most Urgent"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "Medium" ||
                          task.priority === "Normal"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700";

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 pr-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-2xl bg-slate-100 flex items-center justify-center text-sm">
                              📄
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {task.title}
                              </p>
                              {task.projectTitle && (
                                <p className="text-[11px] text-slate-400 truncate">
                                  {task.projectTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 align-middle">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${statusClasses}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4 align-middle">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${priorityClasses}`}
                          >
                            {task.priority || "Normal"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!recentTasks.length && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 text-center text-xs text-slate-400"
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

        {/* BOTTOM ROW: focus card + admin session */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          <section className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-5 overflow-hidden relative transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl">
            <div className="pointer-events-none absolute -inset-x-40 -top-1/2 h-full bg-gradient-to-r from-transparent via-sky-100/60 to-transparent animate-[pulse_5s_ease-in-out_infinite]" />
            <div className="relative flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Focus this week
              </h2>
              <span className="text-[11px] text-slate-400">
                summary of current workload
              </span>
            </div>

            <div className="relative grid grid-cols-3 gap-3 text-xs text-slate-600 mt-2">
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-3 flex flex-col gap-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <span className="text-[11px] text-slate-400">Completed</span>
                <span className="text-base font-semibold text-emerald-600">
                  {completedProjects}
                </span>
                <span className="text-[11px] text-emerald-500">
                  Keep this momentum
                </span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-3 flex flex-col gap-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <span className="text-[11px] text-slate-400">In progress</span>
                <span className="text-base font-semibold text-amber-500">
                  {inProgressProjects}
                </span>
                <span className="text-[11px] text-amber-500">
                  Prioritize critical tasks
                </span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-3 flex flex-col gap-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <span className="text-[11px] text-slate-400">Pending</span>
                <span className="text-base font-semibold text-slate-700">
                  {Math.max(
                    0,
                    totalProjects - completedProjects - inProgressProjects
                  )}
                </span>
                <span className="text-[11px] text-slate-500">
                  Plan for next sprint
                </span>
              </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <p>
                You are currently at{" "}
                <span className="font-semibold text-slate-800">
                  {projectCompletionRate || 0}%
                </span>{" "}
                completion across all active project tasks.
              </p>
              <button
                type="button"
                onClick={onViewTasks}
                className="inline-flex items-center gap-1 text-sky-600 font-semibold hover:text-sky-700 transition-colors"
              >
                Review tasks
                <span>↗</span>
              </button>
            </div>
          </section>

          <section className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">
              Current admin session
            </h2>
            {!currentAdmin ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  👤
                </div>
                <p className="text-xs text-slate-500">
                  No active admin session.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <div className="h-10 w-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-sm font-semibold">
                  {currentAdmin.email[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-800 mb-1">
                    {currentAdmin.email}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Active since{" "}
                    <span className="font-medium text-slate-700">
                      {formatTime(latestSession?.loginAt)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

