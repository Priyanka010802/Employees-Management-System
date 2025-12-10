// src/page/Attendance.jsx
import { useEffect, useState } from "react";

const sampleEmployees = [
  { id: "emp_john", name: "John Doe", role: "Developer", department: "IT" },
  { id: "emp_sarah", name: "Sarah Lee", role: "HR Manager", department: "HR" },
  { id: "emp_david", name: "David Kim", role: "Financial Analyst", department: "Finance" },
  { id: "emp_mike", name: "Mike Chen", role: "Senior Developer", department: "IT" },
  { id: "emp_lisa", name: "Lisa Patel", role: "Team Lead", department: "Engineering" },
  { id: "emp_priya", name: "Priya Sharma", role: "Frontend Developer", department: "IT" },
  { id: "emp_raj", name: "Raj Patel", role: "Backend Developer", department: "IT" },
  { id: "emp_anita", name: "Anita Gupta", role: "DevOps Engineer", department: "IT" },
  { id: "emp_karan", name: "Karan Singh", role: "Full Stack Developer", department: "IT" },
  { id: "emp_rachel", name: "Rachel Green", role: "Recruitment Specialist", department: "HR" }
];

const API_BASE = "http://localhost:3000";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState(sampleEmployees);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    avgWeekly: 0,
    avgMonthly: 0
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [status, setStatus] = useState("Present");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [serverStatus, setServerStatus] = useState("checking");

  const apiCall = async (endpoint, options = {}) => {
    try {
      setServerStatus("connected");
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
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
          id: e.id,
          name: e.name || e.fullName,
          role: e.role,
          department: e.department
        }))
      );
    }

    calculateStats(attRecords);
  };

  const calculateStats = (records) => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = records.length;
    const presents = records.filter((r) => r.status === "Present").length;
    const absents = records.filter((r) => r.status === "Absent").length;
    const lates = records.filter((r) => r.status === "Late").length;

    const weeklyRecords = records.filter(
      (r) => new Date(r.date) >= weekStart
    );
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
      avgWeekly: +avgWeekly,
      avgMonthly: +avgMonthly
    });
  };

  const addAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedDate) return;

    const emp = employees.find((e) => e.id === selectedEmployee);
    const newRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId: selectedEmployee,
      employeeName: emp?.name || "",
      employeeRole: emp?.role || "",
      employeeDepartment: emp?.department || "",
      date: selectedDate,
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      createdAt: new Date().toISOString()
    };

    const result = await apiCall("/attendance", {
      method: "POST",
      body: JSON.stringify(newRecord)
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
      updatedAt: new Date().toISOString()
    };

    const result = await apiCall(`/attendance/${editingRecord.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedRecord)
    });

    if (result) {
      loadData();
      closeModal();
    }
  };

  const deleteAttendance = async (id) => {
    if (!confirm("Delete this record?")) return;
    await apiCall(`/attendance/${id}`, { method: "DELETE" });
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
    return {
      total,
      present,
      absent,
      late,
      presentRate: total ? ((present / total) * 100).toFixed(1) : 0
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

  const weeklyHours = calcHours(weeklyRecords).toFixed(1);
  const totalHours = calcHours(attendance).toFixed(1);
  const avgHours =
    attendance.length > 0
      ? (calcHours(attendance) / attendance.length).toFixed(1)
      : 0;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex-1 min-h-screen bg-slate-50 relative">
      {/* soft background like other pages */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-50" />
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-5 md:space-y-6">
        {/* top bar */}
        <div className="flex items-center justify-between rounded-2xl bg-white/80 border border-slate-200 shadow-sm backdrop-blur-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Attendance · {today}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${
              serverStatus === "connected"
                ? "border-emerald-400/70 bg-emerald-50/90 text-emerald-600"
                : "border-rose-400/70 bg-rose-50/90 text-rose-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                serverStatus === "connected" ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            {serverStatus === "connected" ? "Live" : "Offline"}
          </span>
        </div>

        {/* header */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">
              Attendance
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Track employee presence, working hours and performance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-slate-200 shadow-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[11px] text-indigo-500">
                %
              </span>
              <div>
                <p className="font-semibold text-slate-800">
                  {stats.total
                    ? ((stats.present / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-[10px] text-slate-400">Today rate</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs md:text-sm font-semibold shadow-sm hover:bg-sky-600"
            >
              <span className="text-base leading-none">＋</span>
              Add attendance
            </button>
          </div>
        </section>

        {/* analytics row */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
          {/* today card */}
          <div className="xl:col-span-2 rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-xl p-4 md:p-5 space-y-4">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-100 text-slate-600">
                  ⏱
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Today&apos;s attendance
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Attendance rate and check‑in pattern.
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
                Period: Today
              </span>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {/* numbers */}
              <div className="flex flex-col justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Attendance rate</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl md:text-3xl font-semibold text-slate-900">
                      {stats.total
                        ? ((stats.present / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      +2.8%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {stats.present} present · {stats.absent} absent ·{" "}
                    {stats.late} late
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
                    <p className="text-slate-500">Weekly</p>
                    <p className="mt-1 font-semibold text-emerald-600">
                      {stats.avgWeekly}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
                    <p className="text-slate-500">Monthly</p>
                    <p className="mt-1 font-semibold text-indigo-600">
                      {stats.avgMonthly}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
                    <p className="text-slate-500">Records</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              {/* bar strip */}
              <div className="flex flex-col justify-between gap-3">
                <p className="text-xs text-slate-500">Check‑in distribution</p>
                <div className="h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-end justify-between px-1 overflow-hidden">
                  {Array.from({ length: 40 }).map((_, idx) => {
                    const phase = idx < 30 ? "on" : idx < 35 ? "late" : "na";
                    return (
                      <span
                        key={idx}
                        className={`w-[5px] rounded-t-full ${
                          phase === "on"
                            ? "bg-indigo-400/90"
                            : phase === "late"
                            ? "bg-amber-400/80"
                            : "bg-slate-300"
                        }`}
                        style={{ height: `${35 + (idx % 10) * 4}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>On‑time</span>
                  <span>Late</span>
                  <span>Not marked</span>
                </div>
              </div>

              {/* working hours */}
              <div className="flex flex-col justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Working hour performance
                </p>
                <div className="relative mx-auto mt-1 w-40 h-24">
                  <div className="absolute inset-x-1 bottom-0 h-3/4 rounded-t-full border-[8px] border-dashed border-slate-200" />
                  <div
                    className="absolute inset-x-1 bottom-0 h-3/4 rounded-t-full border-[8px] border-t-sky-400 border-x-transparent border-b-transparent origin-bottom"
                    style={{
                      transform: `rotate(${
                        Math.min((avgHours / 8) * 180, 180) - 90
                      }deg)`
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                    <span className="text-sm font-semibold text-slate-900">
                      {avgHours}h
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Avg per record
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Target 8h</span>
                  <span>Total {totalHours}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* weekly hours card */}
          <div className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-800">
              Weekly total log hours
            </p>
            <p className="text-[11px] text-slate-500">
              Last 7 days across all employees.
            </p>
            <div className="mt-2">
              <p className="text-3xl font-semibold text-slate-900">
                {weeklyHours}h
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Approx{" "}
                {weeklyRecords.length
                  ? (weeklyHours / weeklyRecords.length).toFixed(1)
                  : 0}
                h / record
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all"
                style={{
                  width: `${Math.min((weeklyHours / 40) * 100, 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2">
              <span>Target 40h</span>
              <span>{weeklyRecords.length} records</span>
            </div>
          </div>
        </section>

        {/* attendance table */}
        <section className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-xl overflow-hidden">
          <header className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Attendance list
              </p>
              <p className="text-[11px] text-slate-500">
                Total records: {attendance.length}
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              Period: last 30 days
            </span>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] uppercase text-slate-500">
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">
                    Employee
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">
                    Date
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">
                    Check‑in
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">
                    Check‑out
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const empStats = getEmployeeStats(record.employeeId);
                  const empMeta = employees.find(
                    (e) => e.id === record.employeeId
                  );
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex items-center gap-3 max-w-xs">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                            {(record.employeeName || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {record.employeeName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {empMeta?.role || record.employeeRole || "—"} ·{" "}
                              {empMeta?.department ||
                                record.employeeDepartment ||
                                "Dept"}
                            </p>
                            <p className="text-[10px] inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {empStats.presentRate}% present
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 md:px-6 py-3">
                        <div className="font-medium text-slate-800">
                          {record.date}
                        </div>
                      </td>

                      <td className="px-4 md:px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                            record.status === "Present"
                              ? "bg-emerald-50 text-emerald-700"
                              : record.status === "Absent"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="px-4 md:px-6 py-3 text-slate-700 font-mono text-xs">
                        {record.checkIn || "—"}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-slate-700 font-mono text-xs">
                        {record.checkOut || "—"}
                      </td>

                      <td className="px-4 md:px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(record)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAttendance(record.id)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-rose-500 text-white hover:bg-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!attendance.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-14 text-center text-slate-500 text-sm"
                    >
                      No attendance records yet. Use &quot;Add attendance&quot;
                      to create the first entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white/95 rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm md:text-base font-semibold text-slate-900">
                  {editingRecord ? "Edit attendance" : "Add attendance"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Choose employee, date, status and working hours.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm"
              >
                ×
              </button>
            </header>

            <form
              onSubmit={editingRecord ? updateAttendance : addAttendance}
              className="px-5 py-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} · {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  >
                    <option value="Present">Present ✅</option>
                    <option value="Absent">Absent ❌</option>
                    <option value="Late">Late ⏰</option>
                    <option value="Half Day">Half day ⏳</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Check‑in
                  </label>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Check‑out
                  </label>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="md:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="md:flex-1 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs md:text-sm font-semibold hover:bg-sky-600"
                >
                  {editingRecord ? "Update record" : "Save attendance"}
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
