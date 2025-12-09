// src/page/Departments.jsx
import { useEffect, useState } from "react";

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

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#5A6BFF] via-[#A455FF] to-[#FF5BC0] px-4 md:px-10 py-8 relative overflow-hidden">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-8">
        {/* hero card */}
        <section className="mt-4">
          <div className="rounded-[32px] bg-white/10 backdrop-blur-3xl border border-white/25 shadow-[0_32px_80px_rgba(15,23,42,0.4)] px-6 md:px-10 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80 mb-2">
                HR SPACE
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-white drop-shadow-lg">
                Department
                <br />
                Management
              </h1>
              <button className="mt-4 inline-flex items-center gap-2 bg-white text-[#6C4CFF] text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {activeCount} active department{activeCount === 1 ? "" : "s"}
              </button>
            </div>

            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
              
              <div className="flex items-center gap-3 w-full">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, code, or description"
                  className="flex-1 rounded-2xl bg-white/15 border border-white/30 px-4 py-3 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300/80"
                />
              </div>
              <button
                onClick={openCreate}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-400 text-slate-900 text-sm font-bold shadow-xl hover:shadow-2xl hover:bg-emerald-300 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="text-lg leading-none">＋</span>
                <span>Add Department</span>
                <div className="absolute inset-0 rounded-2xl border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </section>

        {/* list card */}
        <section className="rounded-[28px] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_24px_60px_rgba(15,23,42,0.45)] p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-semibold text-white">
              Departments ({filtered.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setViewDept(dept)}
                className="group text-left rounded-2xl bg-white/10 border border-white/10 hover:border-white/40 hover:bg-white/15 transition-all duration-300 p-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[11px] text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {dept.code || "DEPT"}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-white">
                      {dept.name}
                    </h3>
                    <p className="mt-1 text-[12px] text-white/80 line-clamp-2">
                      {dept.description || "No description"}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full border ${
                      dept.status === "active"
                        ? "border-emerald-300 bg-emerald-500/20 text-emerald-100"
                        : "border-white/30 bg-white/10 text-white/80"
                    }`}
                  >
                    {dept.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-white/80">
                  <span className="opacity-80">
                    Click to view details
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(dept);
                      }}
                      className="px-3 py-1 rounded-full bg-white/20 text-white hover:bg-white/30"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dept.id);
                      }}
                      className="px-3 py-1 rounded-full bg-rose-500 text-white hover:bg-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center text-white/80 py-10">
                No departments found.
              </div>
            )}
          </div>
        </section>

        {/* slide-over panel for create/edit */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div
              className="flex-1 bg-black/40"
              onClick={() => {
                setIsPanelOpen(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            />
            <div className="w-full max-w-md bg-slate-950/95 border-l border-white/10 shadow-2xl p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-1">
                {editingId ? "Edit Department" : "Add Department"}
              </h3>
              <p className="text-xs text-white/70 mb-4">
                Maintain your organization structure with clear, consistent department records.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Department Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                    placeholder="e.g. Human Resources"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Code
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                    placeholder="e.g. HR"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/80 resize-none"
                    placeholder="What does this department own, and who does it support?"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
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
                    className="px-4 py-2 rounded-xl border border-white/20 text-xs text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-emerald-400 text-xs font-bold text-slate-900 hover:bg-emerald-300"
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
              className="absolute inset-0 bg-black/60"
              onClick={() => setViewDept(null)}
            />
            <div className="relative max-w-lg w-full rounded-2xl bg-slate-950/95 border border-white/15 p-6 text-white shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {viewDept.code || "DEPT"}
                  </div>
                  <h3 className="mt-2 text-xl font-bold">{viewDept.name}</h3>
                  <p className="mt-2 text-sm text-white/80">
                    {viewDept.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={() => setViewDept(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      viewDept.status === "active"
                        ? "bg-emerald-500/20 text-emerald-200 border border-emerald-300/60"
                        : "bg-white/10 text-white border border-white/30"
                    }`}
                  >
                    {viewDept.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 text-xs">
                <button
                  onClick={() => setViewDept(null)}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    openEdit(viewDept);
                    setViewDept(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300"
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
