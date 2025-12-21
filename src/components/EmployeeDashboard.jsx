// EmployeeDashboard.jsx
import React, { useState } from "react";

const EmployeeDashboard = ({ currentUserEmail }) => {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [loginTime, setLoginTime] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const EMP_CHECKIN_LIMIT = 10; // 10:00
  const EMP_CHECKOUT_LIMIT = 18; // 18:00

  const formatDisplayTime = (dateObj) =>
    dateObj.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatHHMM = (dateObj) =>
    dateObj
      .toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .slice(0, 5);

  const getCheckInStatus = (dateObj) => {
    const hour = dateObj.getHours();
    if (hour > EMP_CHECKIN_LIMIT) return "Late";
    return "Present";
  };

  const getFinalStatus = (checkInDate, checkOutDate) => {
    if (!checkInDate && !checkOutDate) return "Absent";
    const baseStatus = getCheckInStatus(checkInDate);
    const outHour = checkOutDate.getHours();
    if (outHour < EMP_CHECKOUT_LIMIT) return "Half Day";
    return baseStatus;
  };

  // CHECK-IN
  const handleCheckIn = async () => {
    if (attendanceMarked) return;

    const now = new Date();
    const display = formatDisplayTime(now);
    const checkInHHMM = formatHHMM(now);
    const status = getCheckInStatus(now);

    setLoginTime(display);
    setAttendanceMarked(true);

    const todayDate = new Date().toISOString().split("T")[0];

    await fetch("http://localhost:3000/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `att_${todayDate}_${currentUserEmail}`,
        employeeId: currentUserEmail,
        employeeEmail: currentUserEmail,
        employeeName: currentUserEmail,
        date: todayDate,
        status,
        checkIn: checkInHHMM,
        checkOut: null,
        createdFrom: "employee-dashboard",
        createdAt: new Date().toISOString(),
      }),
    });
  };

  // CHECK-OUT
  const handleCheckOut = async () => {
    if (!attendanceMarked || hasCheckedOut) return;

    const now = new Date();
    const display = formatDisplayTime(now);
    const checkOutHHMM = formatHHMM(now);

    setCheckoutTime(display);
    setHasCheckedOut(true);

    const todayDate = new Date().toISOString().split("T")[0];
    const recordId = `att_${todayDate}_${currentUserEmail}`;

    const res = await fetch(`http://localhost:3000/attendance/${recordId}`);
    const existing = res.ok ? await res.json() : null;

    const checkInDate = existing?.checkIn
      ? (() => {
          const [h, m] = existing.checkIn.split(":").map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          return d;
        })()
      : now;

    const finalStatus = getFinalStatus(checkInDate, now);

    const updatedRecord = {
      ...(existing || {}),
      id: recordId,
      employeeId: currentUserEmail,
      employeeEmail: currentUserEmail,
      employeeName: existing?.employeeName || currentUserEmail,
      date: todayDate,
      checkIn: existing?.checkIn || formatHHMM(checkInDate),
      checkOut: checkOutHHMM,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    };

    await fetch(`http://localhost:3000/attendance/${recordId}`, {
      method: existing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRecord),
    });
  };

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const currentTimeLabel = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusChipColor =
    !attendanceMarked
      ? "bg-slate-100 border-slate-200 text-slate-700"
      : hasCheckedOut
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-amber-50 border-amber-200 text-amber-700";

  const statusChipText =
    !attendanceMarked
      ? "Status: Not marked"
      : hasCheckedOut
      ? "Status: Day completed"
      : "Status: Checked‑in";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* top bluish fade band */}
      <div className="fixed inset-x-0 top-0 h-60 bg-gradient-to-b from-sky-100 via-emerald-50/60 to-transparent pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              My Attendance
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Mark your check‑in and check‑out for today and keep your attendance up to date.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
            <div className="rounded-2xl bg-white/90 border border-slate-100 px-3 py-2 shadow-sm backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">
                Today
              </div>
              <div className="text-xs font-semibold text-slate-800">
                {todayLabel}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Local time:{" "}
                <span className="font-medium text-emerald-600">
                  {currentTimeLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main card */}
        <section className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.07)] p-5 md:p-7 space-y-6">
          {/* Employee + status */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* glow ring */}
                <div className="absolute inset-0 -inset-1 rounded-3xl bg-emerald-300/50 blur-md pointer-events-none" />
                {/* avatar */}
                <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-emerald-400/50">
                  {currentUserEmail?.[0]?.toUpperCase() || "E"}
                </div>
                {/* online dot */}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm shadow-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-500/90">
                  Employee ID
                </p>
                <p className="font-mono text-sm md:text-base text-slate-900">
                  {currentUserEmail}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border ${statusChipColor}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusChipText}
              </span>

              {attendanceMarked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] text-slate-600">
                  ⏱ Check‑in:
                  <span className="font-semibold text-slate-900">
                    {loginTime.split(", ").slice(-1)[0] || "--"}
                  </span>
                </span>
              )}

              {hasCheckedOut && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] text-slate-600">
                  🔚 Check‑out:
                  <span className="font-semibold text-slate-900">
                    {checkoutTime.split(", ").slice(-1)[0] || "--"}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Left: daily summary */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Daily attendance
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Complete both check‑in and check‑out for a full work day.
                  </p>
                </div>
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center text-lg text-white shadow-md">
                  ⏰
                </div>
              </div>

              {/* progress */}
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        !attendanceMarked
                          ? "bg-slate-400"
                          : hasCheckedOut
                          ? "bg-gradient-to-r from-emerald-400 to-sky-400"
                          : "bg-gradient-to-r from-amber-300 to-orange-400"
                      }`}
                      style={{
                        width: !attendanceMarked
                          ? "25%"
                          : hasCheckedOut
                          ? "100%"
                          : "60%",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {hasCheckedOut
                      ? "Day completed"
                      : attendanceMarked
                      ? "Check‑out pending"
                      : "Check‑in pending"}
                  </span>
                </div>
              </div>

              {/* timeline cards */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-slate-100 p-3 flex flex-col gap-1 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">
                      Check‑in
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Before 10:00
                    </span>
                  </div>
                  <div className="text-base font-semibold text-slate-900">
                    {attendanceMarked
                      ? loginTime.split(", ").slice(-1)[0]
                      : "--:--"}
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                    {attendanceMarked ? "Recorded today" : "Waiting for check‑in"}
                  </span>
                </div>

                <div className="rounded-xl bg-white border border-slate-100 p-3 flex flex-col gap-1 hover:border-sky-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">
                      Check‑out
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      After 18:00
                    </span>
                  </div>
                  <div className="text-base font-semibold text-slate-900">
                    {hasCheckedOut
                      ? checkoutTime.split(", ").slice(-1)[0]
                      : "--:--"}
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                    {hasCheckedOut ? "Recorded today" : "Waiting for check‑out"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: action card */}
            <div className="group rounded-2xl bg-gradient-to-br from-emerald-50 via-sky-50 to-white border border-emerald-100 p-4 md:p-5 flex flex-col justify-between gap-4 shadow-[0_14px_32px_rgba(15,118,110,0.15)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Quick action
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Use the buttons below to mark today&apos;s attendance in real time.
                </p>
              </div>

              <div className="space-y-3">
                {!attendanceMarked && (
                  <button
                    onClick={handleCheckIn}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-sm font-semibold text-white shadow-md shadow-emerald-400/40 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Mark check‑in
                  </button>
                )}

                {attendanceMarked && (
                  <button
                    onClick={handleCheckOut}
                    disabled={hasCheckedOut}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                      hasCheckedOut
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white shadow-md shadow-amber-300/50 hover:shadow-amber-400/60 hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    {hasCheckedOut ? "Check‑out recorded" : "Mark check‑out"}
                  </button>
                )}
              </div>

              <div className="mt-1 text-[11px] text-slate-500">
                Attendance is synced with the system as soon as you mark check‑in or
                check‑out. Avoid refreshing immediately after clicking.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
