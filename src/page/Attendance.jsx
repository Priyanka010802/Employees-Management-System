// src/page/Attendance.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    avgWeekly: 0,
    avgMonthly: 0,
  });

  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [status, setStatus] = useState("Present");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [serverStatus, setServerStatus] = useState("checking");

  // -------- API --------
  const apiCall = async (endpoint, options = {}) => {
    try {
      setServerStatus("connected");
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      setServerStatus("offline");
      return null;
    }
  };

  const loadData = async () => {
    const attData = await apiCall("/attendance");
    const empData = await apiCall("/employees");

    const attRecords = Array.isArray(attData) ? attData : [];
    setAttendance(attRecords);

    if (Array.isArray(empData) && empData.length > 0) {
      setEmployees(
        empData.map((e) => ({
          id: e.id || e.empId || e.email || e.employeeEmail,
          name: e.name || e.fullName || e.email || e.employeeEmail,
          role: e.role || e.position,
          department: e.department || e.dept,
          email: e.email || e.employeeEmail,
        }))
      );
    } else {
      setEmployees([]);
    }

    calculateStats(attRecords);
  };

  // -------- STATS --------
  const calculateStats = (records) => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = records.length;
    const presents = records.filter((r) => r.status === "Present").length;
    const absents = records.filter((r) => r.status === "Absent").length;
    const lates = records.filter((r) => r.status === "Late").length;
    const halfDays = records.filter((r) => r.status === "Half Day").length;

    const weeklyRecords = records.filter((r) => new Date(r.date) >= weekStart);
    const monthlyRecords = records.filter(
      (r) => new Date(r.date) >= monthStart
    );

    const avgWeekly =
      weeklyRecords.length > 0
        ? (
            (weeklyRecords.filter((r) => r.status === "Present").length /
              weeklyRecords.length) *
            100
          ).toFixed(1)
        : 0;

    const avgMonthly =
      monthlyRecords.length > 0
        ? (
            (monthlyRecords.filter((r) => r.status === "Present").length /
              monthlyRecords.length) *
            100
          ).toFixed(1)
        : 0;

    setStats({
      total,
      present: presents,
      absent: absents,
      late: lates,
      halfDay: halfDays,
      avgWeekly: +avgWeekly,
      avgMonthly: +avgMonthly,
    });
  };

  // -------- CRUD --------
  const addAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedDate) return;

    const emp = employees.find((e) => e.id === selectedEmployee);

    const newRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId: selectedEmployee,
      employeeEmail: emp?.email || emp?.id,
      employeeName: emp?.name || emp?.email || emp?.id || "",
      employeeRole: emp?.role || "",
      employeeDepartment: emp?.department || "",
      date: selectedDate,
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      createdAt: new Date().toISOString(),
    };

    const result = await apiCall("/attendance", {
      method: "POST",
      body: JSON.stringify(newRecord),
    });

    if (result) {
      loadData();
      closeModal();
    }
  };

  const updateAttendance = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updatedRecord = {
      ...editingRecord,
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      updatedAt: new Date().toISOString(),
    };

    const result = await apiCall(`/attendance/${editingRecord.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedRecord),
    });

    if (result) {
      loadData();
      closeModal();
    }
  };

  const deleteAttendance = async (id) => {
    if (!confirm("Delete this record?")) return;
    await apiCall(`/attendance/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  const openModal = (record = null) => {
    setEditingRecord(record);

    if (record) {
      setSelectedEmployee(record.employeeId);
      setSelectedDate(record.date);
      setStatus(record.status);
      setCheckIn(record.checkIn || "");
      setCheckOut(record.checkOut || "");
    } else {
      setSelectedEmployee("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setStatus("Present");
      setCheckIn("");
      setCheckOut("");
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeStats = (empId) => {
    const empRecords = attendance.filter((r) => r.employeeId === empId);
    const total = empRecords.length;
    const present = empRecords.filter((r) => r.status === "Present").length;
    const absent = empRecords.filter((r) => r.status === "Absent").length;
    const late = empRecords.filter((r) => r.status === "Late").length;
    const halfDay = empRecords.filter((r) => r.status === "Half Day").length;

    return {
      total,
      present,
      absent,
      late,
      halfDay,
      presentRate: total ? ((present / total) * 100).toFixed(1) : 0,
    };
  };

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyRecords = attendance.filter(
    (r) => new Date(r.date) >= weekStart
  );

  const calcHours = (records) =>
    records.reduce((sum, r) => {
      if (!r.checkIn || !r.checkOut) return sum;
      const [inH, inM] = r.checkIn.split(":").map(Number);
      const [outH, outM] = r.checkOut.split(":").map(Number);
      const diff = outH + outM / 60 - (inH + inM / 60);
      return sum + Math.max(diff, 0);
    }, 0);

  const weeklyHours = parseFloat(calcHours(weeklyRecords).toFixed(1));
  const totalHours = parseFloat(calcHours(attendance).toFixed(1));
  const avgHours =
    attendance.length > 0
      ? parseFloat((calcHours(attendance) / attendance.length).toFixed(1))
      : 0;

  const today = new Date().toISOString().split("T")[0];

  const statusBadgeClasses = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-100 text-emerald-800";
      case "Late":
        return "bg-amber-100 text-amber-800";
      case "Half Day":
        return "bg-indigo-100 text-indigo-800";
      case "Absent":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const totalStatusCount =
    stats.present + stats.absent + stats.late + stats.halfDay || 1;

  const todayRate = stats.total
    ? ((stats.present / stats.total) * 100).toFixed(1)
    : 0;

  // -------- UI --------
  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Attendance
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl">
            Track employee attendance and manage daily records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              serverStatus === "connected"
                ? "bg-emerald-50 text-emerald-700"
                : serverStatus === "offline"
                ? "bg-rose-50 text-rose-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                serverStatus === "connected"
                  ? "bg-emerald-500"
                  : serverStatus === "offline"
                  ? "bg-rose-500"
                  : "bg-amber-500"
              }`}
            />
            {serverStatus === "connected"
              ? "Server connected"
              : serverStatus === "offline"
              ? "Server offline - showing local data"
              : "Checking server..."}
          </span>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <span className="text-base">＋</span>
            Add attendance
          </button>
        </div>
      </div>

      {/* Top section: big left card + two right cards (responsive) */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Left large card: Today's Attendance (like screenshot) */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-6 flex flex-col gap-5">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <span className="text-lg">🗓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Today&apos;s Attendance
                </p>
                <p className="text-xs text-slate-400">
                  Attendance rate based on today&apos;s records.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 bg-slate-50">
              {today}
            </span>
          </div>

          {/* Rate + mini badge row */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-3xl md:text-4xl font-semibold text-slate-900">
                  {todayRate}%
                </p>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-100">
                  {stats.present} present
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Attendance rate
              </p>
            </div>
            <div className="flex gap-6 text-xs text-slate-500">
              <div className="flex flex-col items-end">
                <span className="font-semibold text-slate-900">
                  {stats.total}
                </span>
                <span>Total records</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-slate-900">
                  {stats.absent}
                </span>
                <span>Absent</span>
              </div>
            </div>
          </div>

          {/* Bar pattern similar to screenshot */}
          <div className="mt-2 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-3">
            <div className="flex items-end gap-[3px] h-24 overflow-hidden">
              {Array.from({ length: 24 }).map((_, idx) => {
                const isLate = idx >= 16 && idx < 20;
                const isFuture = idx >= 20;
                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full ${
                      isFuture
                        ? "bg-slate-200"
                        : isLate
                        ? "bg-amber-400"
                        : "bg-sky-500"
                    }`}
                    style={{
                      height: `${60 + (idx % 5) * 8}%`,
                    }}
                  />
                );
              })}
            </div>

            {/* Legend row */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-400">On‑time</p>
                <p className="text-sm font-semibold text-slate-900">
                  {stats.total
                    ? Math.round(
                        ((stats.present + stats.halfDay) / stats.total) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Late</p>
                <p className="text-sm font-semibold text-slate-900">
                  {stats.total
                    ? Math.round((stats.late / stats.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Not attended</p>
                <p className="text-sm font-semibold text-slate-900">
                  {stats.total
                    ? Math.round((stats.absent / stats.total) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: two stacked cards (Employee Attend + Total Log Hours style) */}
        <div className="space-y-4">
          {/* Employee attend (use weekly/monthly presence) */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Employee attend
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold">
                {stats.avgWeekly}% weekly
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {stats.present}/{stats.total || 0}
            </p>
            <p className="text-xs text-slate-500">
              Present employees out of total records.
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${
                    stats.total ? (stats.present / stats.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Working hour performance style – use weeklyHours & totalHours */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Working hour performance
              </p>
              <span className="text-[11px] text-slate-400">
                Weekly log hours
              </span>
            </div>

            {/* Semi-circle gauge using many small blocks */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-wrap justify-center gap-[3px]">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const fillRatio = totalHours
                    ? weeklyHours / totalHours
                    : 0;
                  const activeUntil = Math.round(fillRatio * 24);
                  const isActive = idx < activeUntil;
                  return (
                    <div
                      key={idx}
                      className={`h-5 w-2 rounded-full ${
                        isActive ? "bg-rose-400" : "bg-slate-200"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totalHours ? ((weeklyHours / totalHours) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-[11px] text-slate-500">
                Weekly hours contribution to total.
              </p>

              <div className="mt-1 flex justify-between w-full text-[11px] text-slate-500">
                <span>Weekly: {weeklyHours}h</span>
                <span>Total: {totalHours}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed records table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-100 px-4 md:px-6 py-3 md:py-4">
          <h2 className="text-sm md:text-base font-semibold text-slate-900">
            Attendance list
          </h2>
          <span className="text-xs text-slate-500">
            Today: <span className="font-medium text-slate-800">{today}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs md:text-sm">
            <thead className="bg-slate-50/60">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check‑in
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check‑out
                </th>
                <th className="px-4 md:px-6 py-3 text-right text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {attendance.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 md:px-6 py-6 text-center text-xs md:text-sm text-slate-500"
                  >
                    No attendance records yet. Use{" "}
                    <span className="font-semibold">“Add attendance”</span> to
                    create the first entry.
                  </td>
                </tr>
              )}

              {attendance
                .slice()
                .reverse()
                .map((record) => {
                  const empMeta = employees.find(
                    (e) =>
                      e.id === record.employeeId ||
                      e.email === record.employeeEmail
                  );
                  const empStats = getEmployeeStats(record.employeeId);

                  const name =
                    record.employeeName ||
                    empMeta?.name ||
                    record.employeeEmail ||
                    record.employeeId ||
                    "?";

                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/60">
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-slate-100 text-[10px] md:text-xs font-semibold text-slate-700">
                            {initials}
                          </div>
                          <div>
                            <div className="text-xs md:text-sm font-semibold text-slate-900">
                              {name}
                            </div>
                            <div className="text-[10px] md:text-xs text-slate-500">
                              {empMeta?.role ||
                                record.employeeRole ||
                                "—"}{" "}
                              ·{" "}
                              {empMeta?.department ||
                                record.employeeDepartment ||
                                "Dept"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {empStats.presentRate}% present rate
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-700">
                        {record.date}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] md:text-xs font-semibold ${statusBadgeClasses(
                            record.status
                          )}`}
                        >
                          {record.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-700">
                        {record.checkIn || "—"}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-700">
                        {record.checkOut || "—"}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs">
                        <button
                          onClick={() => openModal(record)}
                          className="mb-1 md:mb-0 rounded-full border border-slate-200 px-3 py-1 text-[10px] md:text-xs font-semibold text-slate-700 hover:bg-slate-50 mr-1 md:mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAttendance(record.id)}
                          className="rounded-full border border-rose-200 px-3 py-1 text-[10px] md:text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-3">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 md:px-6 py-3 md:py-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingRecord ? "Edit attendance" : "Add attendance"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingRecord ? updateAttendance : addAttendance}
              className="space-y-4 px-4 md:px-6 py-4"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || emp.id} · {emp.role || "Role"} ·{" "}
                      {emp.department || "Dept"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Check‑in time (HH:MM)
                  </label>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Check‑out time (HH:MM)
                  </label>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {editingRecord ? "Save changes" : "Add record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
