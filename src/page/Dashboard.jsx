// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";

const Dashboard = ({ currentUserEmail }) => {
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminsRes, employeesRes, attendanceRes, sessionsRes] =
          await Promise.all([
            fetch(`${API_BASE}/admins`),
            fetch(`${API_BASE}/employees`),
            fetch(`${API_BASE}/attendance`),
            fetch(
              `${API_BASE}/sessions?email=${encodeURIComponent(
                currentUserEmail || ""
              )}`
            ),
          ]);

        setAdmins(await adminsRes.json());
        setEmployees(await employeesRes.json());
        setAttendance(await attendanceRes.json());
        setSessions(await sessionsRes.json());
      } catch (err) {
        console.error("Dashboard load failed", err);
        setAdmins([]);
        setEmployees([]);
        setAttendance([]);
        setSessions([]);
      }
    };

    if (currentUserEmail) fetchData();
  }, [currentUserEmail]);

  // totals from employees
  const totalEmployees = employees.length;
  const totalSalary = useMemo(
    () =>
      employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0),
    [employees]
  );
  const presentCount = useMemo(
    () => employees.filter((e) => e.status === "Present").length,
    [employees]
  );
  const absentCount = useMemo(
    () => employees.filter((e) => e.status === "Absent").length,
    [employees]
  );
  const lateCount = useMemo(
    () => employees.filter((e) => e.status === "Late").length,
    [employees]
  );

  // attendance aggregates (optional donuts)
  const last7DaysAbsents = useMemo(() => {
    const byDate = {};
    attendance.forEach((row) => {
      if (row.status === "Absent") {
        byDate[row.date] = (byDate[row.date] || 0) + 1;
      }
    });
    return Object.entries(byDate)
      .slice(-7)
      .map(([date, count]) => ({ label: date, value: count }));
  }, [attendance]);

  const byMonthAbsents = useMemo(() => {
    const byMonth = {};
    attendance.forEach((row) => {
      if (row.status === "Absent") {
        const month = row.date?.slice(0, 7) || "Unknown";
        byMonth[month] = (byMonth[month] || 0) + 1;
      }
    });
    return Object.entries(byMonth).map(([m, c]) => ({ label: m, value: c }));
  }, [attendance]);

  const last7DaysLate = useMemo(() => {
    const byDate = {};
    attendance.forEach((row) => {
      if (row.late) {
        byDate[row.date] = (byDate[row.date] || 0) + 1;
      }
    });
    return Object.entries(byDate)
      .slice(-7)
      .map(([date, count]) => ({ label: date, value: count }));
  }, [attendance]);

  const donutPercent = (items) => {
    const total = items.reduce((s, i) => s + i.value, 0);
    if (!totalEmployees) return 0;
    return Math.min(100, Math.round((total / totalEmployees) * 100));
  };

  // current admin + last session
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

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>

      <header className="relative z-10 h-16 border-b border-white/20 flex items-center justify-between px-6 md:px-12 bg-white/10 backdrop-blur-xl shadow-2xl">
        <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
          Employee Management System
        </h1>
        {currentUserEmail && (
          <p className="text-xs md:text-sm bg-gradient-to-r from-white/80 to-blue-100/80 bg-clip-text text-transparent font-medium tracking-wide">
            Logged in as {currentUserEmail}
          </p>
        )}
      </header>

      <main className="relative z-10 flex-1 px-6 md:px-12 py-8 md:py-10 max-w-7xl mx-auto space-y-8 md:space-y-10">
        {/* KPI row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Employees", value: totalEmployees, icon: "👥", color: "text-sky-500" },
            { label: "Present", value: presentCount, icon: "✅", color: "text-emerald-500" },
            { label: "Absent", value: absentCount, icon: "🚫", color: "text-rose-500" },
            {
              label: "Total Salary / month",
              value: `₹${totalSalary.toLocaleString()}`,
              icon: "💰",
              color: "text-amber-400"
            }
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg px-4 py-3 border border-slate-200"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl ${item.color}`}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  {item.label}
                </p>
                <p className="text-lg md:text-xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* donut style panels */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { title: "Absentees – last 7 days", items: last7DaysAbsents, color: "from-sky-400 to-sky-600" },
            { title: "Absentees – by month", items: byMonthAbsents, color: "from-amber-400 to-amber-600" },
            { title: "Late comers – last 7 days", items: last7DaysLate, color: "from-emerald-400 to-emerald-600" }
          ].map((block) => {
            const percent = donutPercent(block.items);
            return (
              <div
                key={block.title}
                className="rounded-3xl bg-white/95 shadow-xl border border-slate-200 p-4 flex flex-col gap-3"
              >
                <h3 className="text-sm md:text-base font-semibold text-slate-800">
                  {block.title}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28 md:w-32 md:h-32">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${block.color}`} />
                    <div className="absolute inset-2 md:inset-3 rounded-full bg-white" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Rate</p>
                        <p className="text-lg font-bold text-slate-900">
                          {percent}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 max-h-28 overflow-y-auto">
                    {block.items.slice(0, 6).map((itm, idx) => (
                      <div
                        key={itm.label + idx}
                        className="flex items-center justify-between text-[11px] text-slate-600"
                      >
                        <span className="truncate mr-2">
                          {itm.label ?? "N/A"}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {itm.value}
                        </span>
                      </div>
                    ))}
                    {block.items.length === 0 && (
                      <p className="text-[11px] text-slate-400">
                        No data available yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Admin (only current user + login/logout) */}
        <section
          className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)"
          }}
        >
          <div className="px-6 md:px-12 py-6 border-b border-white/20 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-lg">
              Current Admin Session
            </h2>
          </div>

          <div className="px-4 md:px-8 py-8 overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-white">
              <thead>
                <tr className="border-b-2 border-white/20 bg-white/5 backdrop-blur-xl">
                  <th className="text-left font-bold px-4 py-4 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left font-bold px-4 py-4 uppercase tracking-wide">
                    Session
                  </th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody>
                {!currentAdmin ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-white/80 font-semibold"
                    >
                      No admin record for this login.
                    </td>
                  </tr>
                ) : (
                  <tr className="border-b border-white/10 hover:bg-white/10 transition-all duration-300">
                    <td className="px-4 py-4 text-white/90 font-medium truncate max-w-xs">
                      {currentAdmin.email}
                    </td>
                    <td className="px-4 py-4 text-white/90 text-sm">
                      <div className="space-y-1">
                        <p>
                          <span className="font-semibold">Login:</span>{" "}
                          {formatTime(latestSession?.loginAt)}
                        </p>
                        
                      </div>
                    </td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
