// src/page/Attendance.jsx
import { useEffect, useState } from "react";

// sample employees (fallback)
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
  // Main states
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

  // Safe API call
  const apiCall = async (endpoint, options = {}) => {
    try {
      setServerStatus("connected");
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      setServerStatus("offline");
      return null;
    }
  };

  // Load all data
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

  // Calculate comprehensive stats
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

  // CRUD Operations
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

  // Get employee attendance summary
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
      presentRate: total ? (present / total * 100).toFixed(1) : 0
    };
  };

  // top 3 employees by present rate (for creative cards)
  const topEmployees = employees
    .map((emp) => {
      const s = getEmployeeStats(emp.id);
      return { ...emp, ...s };
    })
    .filter((e) => e.total > 0)
    .sort((a, b) => b.presentRate - a.presentRate)
    .slice(0, 3);

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden p-6 md:p-10 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-2xl">
              Time & Attendance
            </h1>
            <div
              className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-2xl text-sm font-bold border ${
                serverStatus === "connected"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50"
                  : "bg-rose-500/20 text-rose-300 border-rose-400/50"
              }`}
            >
              {serverStatus === "connected" ? "🟢 Live Data" : "⚠️ Offline Mode"}
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-3xl shadow-2xl hover:shadow-3xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 hover:scale-[1.02]"
          >
            <span>➕ Mark Attendance</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-[1.02] shadow-2xl hover:shadow-3xl cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-3xl">📊</div>
              <div className="text-2xl font-black text-white mt-2">
                {stats.total}
              </div>
              <div className="text-slate-300 text-sm font-semibold mt-1">
                Total Records
              </div>
            </div>
          </div>

          <div className="group relative bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 hover:bg-emerald-500/20 transition-all duration-500 hover:scale-[1.02] shadow-2xl hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-3xl opacity-0 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="text-3xl">✅</div>
              <div className="text-2xl font-black text-emerald-300 mt-2">
                {stats.present}
              </div>
              <div className="text-emerald-200 text-sm font-semibold mt-1">
                Present
              </div>
            </div>
          </div>

          <div className="group relative bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 hover:bg-rose-500/20 transition-all duration-500 hover:scale-[1.02] shadow-2xl hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/30 to-rose-600/30 rounded-3xl opacity-0 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="text-3xl">❌</div>
              <div className="text-2xl font-black text-rose-300 mt-2">
                {stats.absent}
              </div>
              <div className="text-rose-200 text-sm font-semibold mt-1">
                Absent
              </div>
            </div>
          </div>

          <div className="group relative bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 hover:bg-amber-500/20 transition-all duration-500 hover:scale-[1.02] shadow-2xl hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-amber-600/30 rounded-3xl opacity-0 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="text-3xl">⏰</div>
              <div className="text-2xl font-black text-amber-300 mt-2">
                {stats.late}
              </div>
              <div className="text-amber-200 text-sm font-semibold mt-1">
                Late Comers
              </div>
            </div>
          </div>
        </div>

        {/* Employee Snapshot (creative cards) */}
        {topEmployees.length > 0 && (
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-black text-white">
                Employee Snapshot
              </h3>
              <p className="text-xs text-slate-300">
                Top performers by present rate
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topEmployees.map((emp, index) => (
                <div
                  key={emp.id}
                  className="relative bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-purple-900/60 border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-3"
                >
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-slate-100">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {emp.name}
                      </p>
                      <p className="text-xs text-indigo-200 truncate">
                        {emp.role || "—"}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {emp.department || "Department N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Present rate</span>
                      <span className="font-semibold text-emerald-300">
                        {emp.presentRate}% ({emp.present}/{emp.total} days)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${emp.presentRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Average Attendance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                📈
              </div>
              <h3 className="text-2xl font-black text-white">Weekly Average</h3>
            </div>
            <div className="text-4xl font-black text-blue-300">
              {stats.avgWeekly}%
            </div>
            <div className="text-slate-300 mt-2 text-lg">
              Present this week
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${stats.avgWeekly}%` }}
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                📅
              </div>
              <h3 className="text-2xl font-black text-white">Monthly Average</h3>
            </div>
            <div className="text-4xl font-black text-emerald-300">
              {stats.avgMonthly}%
            </div>
            <div className="text-slate-300 mt-2 text-lg">
              Present this month
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${stats.avgMonthly}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent">
              Latest Records ({attendance.length})
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => loadData()}
                className="px-6 py-2.5 bg-white/20 backdrop-blur-xl border border-white/30 text-white text-sm font-bold rounded-2xl hover:bg-white/30 transition-all"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 backdrop-blur-xl">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-white/90 text-sm uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-white/90 text-sm uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-white/90 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-white/90 text-sm uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-white/90 text-sm uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-white/90 text-sm uppercase tracking-wider">
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
                      className="border-b border-white/10 hover:bg-white/10 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white/90">
                          {record.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-xs">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                            {(record.employeeName || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white/90 truncate">
                              {record.employeeName}
                            </div>
                            <div className="text-[11px] text-slate-300 truncate">
                              {empMeta?.role || record.employeeRole || "—"} •{" "}
                              {empMeta?.department ||
                                record.employeeDepartment ||
                                "Dept"}
                            </div>
                            <div className="text-[10px] bg-white/5 text-emerald-200 px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {empStats.presentRate}% present
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-bold text-white ${
                            record.status === "Present"
                              ? "bg-emerald-500/90 shadow-emerald-500/50"
                              : record.status === "Absent"
                              ? "bg-rose-500/90 shadow-rose-500/50"
                              : "bg-amber-500/90 shadow-amber-500/50"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/80 font-mono text-sm">
                        {record.checkIn || "—"}
                      </td>
                      <td className="px-6 py-4 text-white/80 font-mono text-sm">
                        {record.checkOut || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(record)}
                            className="px-3 py-1.5 bg-sky-500/90 hover:bg-sky-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteAttendance(record.id)}
                            className="px-3 py-1.5 bg-rose-500/90 hover:bg-rose-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!attendance.length && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-6 text-white/60">
                        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-4xl animate-pulse">
                          ⏰
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-3">
                            No attendance records yet
                          </h3>
                          <p className="text-lg">
                            Click "Mark Attendance" to get started
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-3xl backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {editingRecord ? "Edit Record" : "Mark Attendance"}
              </h2>
              <button
                onClick={closeModal}
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xl transition-all"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingRecord ? updateAttendance : addAttendance}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white focus:border-emerald-400 focus:ring-emerald-500/50 transition-all"
                  >
                    <option value="Present">Present ✅</option>
                    <option value="Absent">Absent ❌</option>
                    <option value="Late">Late ⏰</option>
                    <option value="Half Day">Half Day ⏳</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Check-in
                  </label>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Check-out
                  </label>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 px-8 border border-white/30 bg-white/10 backdrop-blur-xl text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-8 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all text-lg"
                >
                  {editingRecord ? "Update Record" : "Mark Present"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Attendance;
