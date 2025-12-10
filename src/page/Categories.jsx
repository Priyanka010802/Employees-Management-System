// src/page/Departments.jsx
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  status: "active",
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewDept, setViewDept] = useState(null);

  const loadDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE}/departments`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsPanelOpen(true);
  };

  const openEdit = (dept) => {
    setForm({
      name: dept.name || "",
      code: dept.code || "",
      description: dept.description || "",
      status: dept.status || "active",
    });
    setEditingId(dept.id);
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    };

    try {
      if (editingId) {
        await fetch(`${API_BASE}/departments/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_BASE}/departments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // ignore
    }

    setIsPanelOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    await loadDepartments();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await fetch(`${API_BASE}/departments/${id}`, { method: "DELETE" });
      await loadDepartments();
    } catch {
      // ignore
    }
  };

  const activeCount = departments.filter((d) => d.status === "active").length;

  const filtered = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.code || "").toLowerCase().includes(q) ||
      (d.description || "").toLowerCase().includes(q)
    );
  });

  // simple synthetic “trend” just to drive animated lines visually
  const trendPoints = useMemo(() => {
    const total = departments.length || 1;
    const active = activeCount;
    const inactive = total - active;
    return [
      { label: "Mon", active: active * 0.4, inactive: inactive * 0.5 },
      { label: "Tue", active: active * 0.6, inactive: inactive * 0.7 },
      { label: "Wed", active: active * 0.8, inactive: inactive * 0.6 },
      { label: "Thu", active: active * 0.9, inactive: inactive * 0.4 },
      { label: "Fri", active, inactive },
    ];
  }, [departments.length, activeCount]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 relative">
      {/* soft page background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-50" />
      <div className="pointer-events-none absolute -left-28 top-8 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        {/* header row */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">
              Departments
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Manage department structure and status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center text-[11px] text-slate-500 bg-white/80 border border-slate-200 rounded-full px-3 py-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              {activeCount} active / {departments.length} total
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="pl-7 pr-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 text-white text-xs font-semibold px-4 py-1.5 shadow-md hover:bg-sky-600 transition"
              >
                <span className="text-sm">＋</span>
                <span>Add</span>
              </button>
            </div>
          </div>
        </header>

        {/* main card */}
        <section className="rounded-[26px] bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.08)] overflow-hidden">
          {/* animated overview */}
          <div className="px-4 md:px-6 pt-4 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mb-1">
                  Overview
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Active departments
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-300" />
                    Inactive departments
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-500">
                <span>Today</span>
                <span className="font-semibold text-slate-800">
                  {activeCount} active / {departments.length} total
                </span>
              </div>
            </div>

            <div className="relative h-32 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-cyan-50 overflow-hidden border border-slate-100">
              {/* grid lines */}
              <div className="absolute inset-3 flex flex-col justify-between">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full border-t border-dashed border-slate-100"
                  />
                ))}
              </div>

              <svg
                viewBox="0 0 100 40"
                className="relative w-full h-full text-sky-400"
              >
                <defs>
                  <linearGradient
                    id="activeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <linearGradient
                    id="inactiveGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#a5b4fc" />
                  </linearGradient>
                </defs>

                {/* active line */}
                <polyline
                  fill="none"
                  stroke="url(#activeGradient)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="animate-[dashDraw_3s_ease-in-out_infinite]"
                  strokeDasharray="220"
                  strokeDashoffset="220"
                  points={trendPoints
                    .map((p, i) => {
                      const x =
                        (i / (trendPoints.length - 1 || 1)) * 100;
                      const y = 40 - (p.active || 0) * 3;
                      return `${x},${Math.max(6, Math.min(34, y))}`;
                    })
                    .join(" ")}
                />

                {/* inactive line */}
                <polyline
                  fill="none"
                  stroke="url(#inactiveGradient)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="animate-[dashDrawSlow_4s_ease-in-out_infinite]"
                  strokeDasharray="220"
                  strokeDashoffset="220"
                  points={trendPoints
                    .map((p, i) => {
                      const x =
                        (i / (trendPoints.length - 1 || 1)) * 100;
                      const y = 40 - (p.inactive || 0) * 3;
                      return `${x},${Math.max(8, Math.min(36, y))}`;
                    })
                    .join(" ")}
                />

                {/* pulsing dot at last active point */}
                {trendPoints.length > 0 && (() => {
                  const last = trendPoints[trendPoints.length - 1];
                  const x =
                    ((trendPoints.length - 1) /
                      (trendPoints.length - 1 || 1)) *
                    100;
                  const y = Math.max(
                    6,
                    Math.min(34, 40 - (last.active || 0) * 3)
                  );
                  return (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        className="fill-sky-500"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        className="fill-sky-400/30 animate-[pingSoft_1.8s_ease-out_infinite]"
                      />
                    </>
                  );
                })()}
              </svg>

              {/* x-axis labels */}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] text-slate-400">
                {trendPoints.map((p) => (
                  <span key={p.label}>{p.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* table area */}
          <div className="px-3 md:px-6 py-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600">
                Department overview
              </p>
              <button className="inline-flex items-center gap-1 text-[11px] text-slate-400 border border-slate-200 rounded-full px-2.5 py-1 bg-white/70">
                <span>Sort by</span>
                <span className="text-[9px]">▾</span>
              </button>
            </div>

            <table className="w-full text-[11px] md:text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="text-left py-2 pr-2 font-medium">
                    Department name
                  </th>
                  <th className="text-left py-2 pr-2 font-medium">Code</th>
                  <th className="text-left py-2 pr-2 font-medium">
                    Status
                  </th>
                  <th className="text-left py-2 pr-2 font-medium">
                    Description
                  </th>
                  <th className="text-right py-2 pl-2 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="py-2.5 pr-2 align-middle">
                      <span className="text-[11px] md:text-xs font-semibold text-slate-900">
                        {dept.name}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 align-middle text-slate-600">
                      {dept.code || "-"}
                    </td>
                    <td className="py-2.5 pr-2 align-middle">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                          dept.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {dept.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 align-middle text-slate-500">
                      <span className="line-clamp-1">
                        {dept.description || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 pl-2 align-middle">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewDept(dept)}
                          className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(dept)}
                          className="px-2 py-1 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(dept.id)}
                          className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-slate-400 text-xs py-6"
                    >
                      No departments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* slide-over panel */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div
              className="flex-1 bg-black/30"
              onClick={() => {
                setIsPanelOpen(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            />
            <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border-l border-slate-200 shadow-2xl p-5 md:p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {editingId ? "Edit department" : "Add department"}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Maintain your organization structure with clear, consistent
                department records.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Department name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    placeholder="e.g. Human Resources"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Code
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    placeholder="e.g. HR"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none"
                    placeholder="What does this department own, and who does it support?"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPanelOpen(false);
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-sky-500 text-xs font-semibold text-white hover:bg-sky-600"
                  >
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* view modal */}
        {viewDept && (
          <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setViewDept(null)}
            />
            <div className="relative max-w-lg w-full rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 p-5 md:p-6 text-slate-900 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {viewDept.code || "DEPT"}
                  </div>
                  <h3 className="mt-2 text-lg md:text-xl font-semibold">
                    {viewDept.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {viewDept.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={() => setViewDept(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      viewDept.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {viewDept.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 text-xs">
                <button
                  onClick={() => setViewDept(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    openEdit(viewDept);
                    setViewDept(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
