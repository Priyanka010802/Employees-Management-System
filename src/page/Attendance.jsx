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

      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-7">
        {/* top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 rounded-2xl bg-white/80 border border-slate-200 shadow-sm backdrop-blur-xl px-2 sm:px-4 py-2 sm:py-3 md:py-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-300" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-400" />
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
            Attendance · {today}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs sm:text-[11px] border ${
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
        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-slate-900 leading-tight">
              Attendance
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Track employee presence, working hours and performance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm sm:text-base">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-slate-200 shadow-sm min-w-[90px] sm:min-w-0 flex-shrink-0">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs sm:text-[11px] text-indigo-500">
                %
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 truncate">
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
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 rounded-xl bg-sky-500 text-white text-sm sm:text-base font-semibold shadow-sm hover:bg-sky-600 flex-1 sm:flex-none min-w-[120px]"
            >
              <span className="text-base sm:text-xl leading-none">＋</span>
              <span className="hidden sm:inline ml-1">Add attendance</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </section>

        {/* analytics row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* today card */}
          <div className="lg:col-span-1 xl:col-span-2 rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 text-slate-600 text-lg sm:text-xl">
                  ⏱
                </span>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    Today's attendance
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Attendance rate and check-in pattern.
                  </p>
                </div>
              </div>
              <span className="text-xs sm:text-sm px-3 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 self-start sm:self-auto">
                Period: Today
              </span>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
              {/* numbers */}
              <div className="flex flex-col justify-between gap-3 sm:gap-4 lg:gap-5">
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-slate-500">Attendance rate</p>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-bold text-slate-900">
                      {stats.total
                        ? ((stats.present / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                    <span className="text-sm sm:text-base px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                      +2.8%
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    {stats.present} present · {stats.absent} absent · {stats.late} late
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 sm:p-4">
                    <p className="text-slate-500 text-sm">Weekly</p>
                    <p className="mt-1 font-bold text-emerald-600 text-lg">
                      {stats.avgWeekly}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 sm:p-4">
                    <p className="text-slate-500 text-sm">Monthly</p>
                    <p className="mt-1 font-bold text-indigo-600 text-lg">
                      {stats.avgMonthly}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 sm:p-4">
                    <p className="text-slate-500 text-sm">Records</p>
                    <p className="mt-1 font-bold text-slate-800 text-lg">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              {/* bar strip */}
              <div className="flex flex-col justify-between gap-3 sm:gap-4 lg:gap-3 order-first lg:order-none">
                <p className="text-sm sm:text-base text-slate-500">Check-in distribution</p>
                <div className="h-20 sm:h-24 md:h-28 rounded-xl bg-slate-50 border border-slate-200 flex items-end justify-between px-2 sm:px-3 overflow-hidden">
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const phase = idx < 22 ? "on" : idx < 26 ? "late" : "na";
                    return (
                      <span
                        key={idx}
                        className={`w-1.5 sm:w-2 rounded-t-full flex-shrink-0 ${
                          phase === "on"
                            ? "bg-indigo-400/90"
                            : phase === "late"
                            ? "bg-amber-400/80"
                            : "bg-slate-300"
                        }`}
                        style={{ height: `${30 + (idx % 8) * 5}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-slate-500">
                  <span className="truncate">On-time</span>
                  <span>Late</span>
                  <span className="truncate">Not marked</span>
                </div>
              </div>

              {/* working hours */}
              <div className="flex flex-col justify-between gap-3 sm:gap-4">
                <p className="text-sm sm:text-base text-slate-500">
                  Working hour performance
                </p>
                <div className="relative mx-auto mt-3 sm:mt-2 w-32 sm:w-40 h-24 sm:h-28 md:h-32">
                  <div className="absolute inset-x-1 bottom-0 h-3/4 rounded-t-full border-4 sm:border-6 border-dashed border-slate-200" />
                  <div
                    className="absolute inset-x-1 bottom-0 h-3/4 rounded-t-full border-4 sm:border-6 border-t-sky-400 border-x-transparent border-b-transparent origin-bottom"
                    style={{
                      transform: `rotate(${Math.min((avgHours / 8) * 180, 180) - 90}deg)`
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 sm:pt-6">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                      {avgHours}h
                    </span>
                    <span className="text-sm sm:text-base text-slate-500 mt-1">
                      Avg per record
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm sm:text-base text-slate-500">
                  <span>Target 90h</span>
                  <span>Total {totalHours}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* weekly hours card */}
          <div className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-xl p-4 sm:p-5 md:p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-semibold text-slate-800 leading-tight">
                Weekly total log hours
              </p>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                Last 7 days across all employees.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-none">
                {weeklyHours}h
              </p>
              <p className="text-base sm:text-lg text-slate-500 mt-2">
                Approx{" "}
                {weeklyRecords.length
                  ? (weeklyHours / weeklyRecords.length).toFixed(1)
                  : 0}
                h / record
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 sm:h-4 mt-6 sm:mt-8 overflow-hidden">
              <div
                className="h-3 sm:h-4 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                style={{
                  width: `${Math.min((weeklyHours / 120) * 100, 100)}%`
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm sm:text-base text-slate-500 mt-3">
              <span>Target 120h</span>
              <span>{weeklyRecords.length} records</span>
            </div>
          </div>
        </section>

        {/* Mobile Cards View - Hidden on larger screens */}
        <div className="lg:hidden space-y-4">
          {attendance.slice(0, 5).map((record) => {
            const empStats = getEmployeeStats(record.employeeId);
            const empMeta = employees.find((e) => e.id === record.employeeId);
            return (
              <div key={record.id} className="bg-white/90 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-700 flex-shrink-0">
                    {(record.employeeName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-lg text-slate-900 truncate">{record.employeeName}</p>
                        <p className="text-sm text-slate-500">
                          {empMeta?.role || record.employeeRole || "—"} · {record.date}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                          record.status === "Present"
                            ? "bg-emerald-100 text-emerald-800"
                            : record.status === "Absent"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-slate-500 mb-3">
                      <span>Present rate: <span className="font-semibold text-emerald-600">{empStats.presentRate}%</span></span>
                      {record.checkIn && (
                        <span>Check-in: <span className="font-mono font-semibold">{record.checkIn}</span></span>
                      )}
                      {record.checkOut && (
                        <span>Check-out: <span className="font-mono font-semibold">{record.checkOut}</span></span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(record)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors h-11"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAttendance(record.id)}
                        className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors h-11"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* attendance table - Only visible on larger screens */}
        <section className="hidden lg:block rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-xl overflow-hidden">
          <header className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="space-y-1">
              <p className="text-lg md:text-xl font-semibold text-slate-900">
                Attendance list
              </p>
              <p className="text-sm md:text-base text-slate-500">
                Total records: {attendance.length}
              </p>
            </div>
            <span className="text-sm md:text-base text-slate-500 self-start lg:self-center">
              Period: last 30 days
            </span>
          </header>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr className="text-xs uppercase text-slate-500 font-semibold tracking-wide">
                  <th className="px-6 py-4 text-left min-w-[200px]">Employee</th>
                  <th className="px-6 py-4 text-left w-32">Date</th>
                  <th className="px-6 py-4 text-left w-28">Status</th>
                  <th className="px-6 py-4 text-left w-28">Check-in</th>
                  <th className="px-6 py-4 text-left w-28">Check-out</th>
                  <th className="px-6 py-4 text-left w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((record) => {
                  const empStats = getEmployeeStats(record.employeeId);
                  const empMeta = employees.find(
                    (e) => e.id === record.employeeId
                  );
                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-base font-bold text-slate-700 flex-shrink-0">
                            {(record.employeeName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-lg text-slate-900 truncate">{record.employeeName}</p>
                            <p className="text-sm text-slate-500">
                              {empMeta?.role || record.employeeRole || "—"} · {empMeta?.department || record.employeeDepartment || "Dept"}
                            </p>
                            <p className="text-xs inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {empStats.presentRate}% present rate
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-base text-slate-900">{record.date}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-semibold inline-block ${
                            record.status === "Present"
                              ? "bg-emerald-100 text-emerald-800"
                              : record.status === "Absent"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-700 font-mono text-sm">
                        {record.checkIn || "—"}
                      </td>
                      <td className="px-6 py-5 text-slate-700 font-mono text-sm">
                        {record.checkOut || "—"}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openModal(record)}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAttendance(record.id)}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors whitespace-nowrap"
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
                    <td colSpan={6} className="py-20 text-center text-slate-500 text-lg">
                      No attendance records yet. Use "Add attendance" to create the first entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Show more records button for mobile */}
        {attendance.length > 5 && (
          <div className="lg:hidden text-center">
            <button className="px-8 py-3 rounded-2xl bg-sky-500 text-white text-lg font-semibold hover:bg-sky-600 transition-colors">
              View All Records ({attendance.length})
            </button>
          </div>
        )}
      </div>

      {/* modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white/95 rounded-3xl border border-slate-200 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-6 sm:px-8 py-6 border-b border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                  {editingRecord ? "Edit Attendance" : "Add Attendance"}
                </h2>
                <p className="text-sm sm:text-base text-slate-500">
                  Choose employee, date, status and working hours.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xl font-bold ml-4 flex-shrink-0 transition-colors"
              >
                ×
              </button>
            </header>

            <form
              onSubmit={editingRecord ? updateAttendance : addAttendance}
              className="p-6 sm:p-8 space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-semibold text-slate-700 block">
                    Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:py-5 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-sm"
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

                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-semibold text-slate-700 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:py-5 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-semibold text-slate-700 block">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:py-5 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
                  >
                    <option value="Present">Present ✅</option>
                    <option value="Absent">Absent ❌</option>
                    <option value="Late">Late ⏰</option>
                    <option value="Half Day">Half day ⏳</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-semibold text-slate-700 block">
                    Check-in
                  </label>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:py-5 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-semibold text-slate-700 block">
                    Check-out
                  </label>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:py-5 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-8 sm:px-10 py-4 rounded-2xl border-2 border-slate-200 bg-white text-base sm:text-lg font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-400/50 transition-all shadow-sm h-14 sm:h-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-base sm:text-lg font-semibold hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transition-all shadow-lg h-14 sm:h-auto"
                >
                  {editingRecord ? "Update Record" : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @media (max-width: 1024px) {
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Attendance;
