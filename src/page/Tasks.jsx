// src/page/Tasks.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const emptyTask = {
  projectTitle: "",
  title: "",
  description: "",
  assignDate: "",
  finishDate: "",
  priority: "Normal",
  status: "pending",
  progress: 0,
  team: [] // array of employee objects {id,name,role,department}
};

const sampleEmployees = [
  { id: "emp_john", name: "John Doe", role: "Developer", department: "IT" },
  { id: "emp_sarah", name: "Sarah Lee", role: "Manager", department: "HR" },
  { id: "emp_david", name: "David Kim", role: "Analyst", department: "Finance" }
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [serverStatus, setServerStatus] = useState("idle");

  const [employees, setEmployees] = useState([]);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  // add form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyTask);
  const [selectedEmployeeIdsAdd, setSelectedEmployeeIdsAdd] = useState([]);

  // edit form
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployeeIdsEdit, setSelectedEmployeeIdsEdit] = useState([]);

  // view modal
  const [viewingTask, setViewingTask] = useState(null);

  // ---------- API helpers ----------

  const apiCall = async (path, options = {}) => {
    try {
      setServerStatus("loading");
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json().catch(() => null);
      setServerStatus("connected");
      return data;
    } catch (err) {
      console.error(err);
      setServerStatus("error");
      throw err;
    }
  };

  const loadTasks = async () => {
    try {
      const data = await apiCall("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setEmployees(
          data.map((e, i) => ({
            id: e.id ?? `emp_api_${i}`,
            name: e.name ?? e.fullName ?? "Unknown",
            role: e.role ?? e.position ?? "",
            department: e.department ?? ""
          }))
        );
      } else {
        setEmployees(sampleEmployees);
      }
    } catch {
      setEmployees(sampleEmployees);
    }
    setEmployeesLoaded(true);
  };

  useEffect(() => {
    loadTasks();
    loadEmployees();
  }, []);

  // ---------- helpers ----------

  const teamCount = (task) =>
    Array.isArray(task.team) ? task.team.length : 0;

  const addSelectedEmployeesToForm = (ids, setForm) => {
    const selected = employees
      .filter((e) => ids.includes(String(e.id)))
      .map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role || "",
        department: e.department || ""
      }));

    setForm((prev) => {
      const existingIds = new Set(prev.team.map((m) => m.id));
      const added = selected.filter((s) => !existingIds.has(s.id));
      return { ...prev, team: [...prev.team, ...added] };
    });
  };

  const removeMemberFromForm = (memberId, setForm) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m.id !== memberId)
    }));
  };

  const departmentSummary = (task) => {
    if (!Array.isArray(task.team) || task.team.length === 0) return "No team";
    const map = {};
    task.team.forEach((m) => {
      if (!m.department) return;
      map[m.department] = (map[m.department] || 0) + 1;
    });
    return Object.entries(map)
      .map(([d, c]) => `${d} (${c})`)
      .join(", ");
  };

  // ---------- Add form ----------

  const startAddTask = () => {
    setAddForm(emptyTask);
    setSelectedEmployeeIdsAdd([]);
    setIsAddOpen(true);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]:
        name === "progress"
          ? Math.min(100, Math.max(0, Number(value) || 0))
          : value
    }));
  };

  const toggleSelectEmpAdd = (id) => {
    setSelectedEmployeeIdsAdd((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return Array.from(s);
    });
  };

  const submitAddTask = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim()) return;

    const now = new Date().toISOString().slice(0, 16).replace("T", " ");

    const payload = {
      ...addForm,
      title: addForm.title.trim(),
      description: (addForm.description || "").trim(),
      assignDate: addForm.assignDate || now,
      time: now,
      team: Array.isArray(addForm.team) ? addForm.team : []
    };

    try {
      await apiCall("/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setIsAddOpen(false);
      setAddForm(emptyTask);
      setSelectedEmployeeIdsAdd([]);
      await loadTasks();
    } catch {
      /* handled in apiCall */
    }
  };

  // ---------- Edit form ----------

  const startEditTask = (task) => {
    setEditingId(task.id);
    setEditForm({
      projectTitle: task.projectTitle || "",
      title: task.title || "",
      description: task.description || "",
      assignDate: task.assignDate || "",
      finishDate: task.finishDate || "",
      priority: task.priority || "Normal",
      status: task.status || "pending",
      progress: task.progress ?? 0,
      team: Array.isArray(task.team) ? task.team : []
    });
    setSelectedEmployeeIdsEdit([]);
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === "progress"
          ? Math.min(100, Math.max(0, Number(value) || 0))
          : value
    }));
  };

  const toggleSelectEmpEdit = (id) => {
    setSelectedEmployeeIdsEdit((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return Array.from(s);
    });
  };

  const submitEditTask = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editingId) return;

    const payload = {
      projectTitle: editForm.projectTitle || "",
      title: editForm.title.trim(),
      description: (editForm.description || "").trim(),
      assignDate: editForm.assignDate || "",
      finishDate: editForm.finishDate || "",
      priority: editForm.priority || "Normal",
      status: editForm.status || "pending",
      progress: editForm.progress ?? 0,
      team: Array.isArray(editForm.team) ? editForm.team : []
    };

    try {
      await apiCall(`/tasks/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setIsEditOpen(false);
      setEditingId(null);
      setEditForm(emptyTask);
      setSelectedEmployeeIdsEdit([]);
      await loadTasks();
    } catch {
      /* handled in apiCall */
    }
  };

  // ---------- View modal ----------

  const openView = (task) => setViewingTask(task);
  const closeView = () => setViewingTask(null);

  // ---------- UI ----------

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
                Task
                <br />
                Management
              </h1>
              <button className="mt-4 inline-flex items-center gap-2 bg-white text-[#6C4CFF] text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {tasks.length} task{tasks.length === 1 ? "" : "s"} active
              </button>
            </div>

            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
              <div className="flex items-center gap-3 w-full justify-end">
                <span
                  className={`px-3 py-2 rounded-2xl text-xs font-semibold ${
                    serverStatus === "connected"
                      ? "bg-emerald-400/20 text-emerald-100 border border-emerald-300/70"
                      : serverStatus === "error"
                      ? "bg-rose-500/20 text-rose-100 border border-rose-300/70"
                      : "bg-white/15 text-white border border-white/40"
                  }`}
                >
                  API:{" "}
                  {serverStatus === "connected"
                    ? "Online"
                    : serverStatus === "error"
                    ? "Offline"
                    : "Checking..."}
                </span>
              </div>
              <button
                onClick={startAddTask}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-400 text-slate-900 text-sm font-bold shadow-xl hover:shadow-2xl hover:bg-emerald-300 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="text-lg leading-none">＋</span>
                <span>Add Task</span>
                <div className="absolute inset-0 rounded-2xl border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </section>

        {/* task list card */}
        <section className="rounded-[28px] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_24px_60px_rgba(15,23,42,0.45)] p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-semibold text-white">
              Project Tasks ({tasks.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => openView(task)}
                className="group text-left rounded-2xl bg-white/10 border border-white/10 hover:border-white/40 hover:bg-white/15 transition-all duration-300 p-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {task.projectTitle && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[11px] text-white/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
                        {task.projectTitle}
                      </div>
                    )}
                    <h3 className="mt-2 text-base font-semibold text-white">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-white/80 line-clamp-2">
                      {task.description || "No description"}
                    </p>
                    <p className="mt-1 text-[11px] text-white/70">
                      {task.assignDate} → {task.finishDate || "TBD"}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full border capitalize ${
                      task.status === "completed"
                        ? "border-emerald-300 bg-emerald-500/20 text-emerald-100"
                        : task.status === "inprogress"
                        ? "border-amber-300 bg-amber-500/20 text-amber-100"
                        : "border-white/30 bg-white/10 text-white/80"
                    }`}
                  >
                    {task.status || "pending"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-white/80">
                  <div className="flex flex-col gap-1 w-2/3">
                    <div className="w-full bg-slate-900/60 rounded-2xl h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl transition-all duration-700"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-[10px]">
                      {task.progress || 0}% complete • {teamCount(task)}{" "}
                      member{teamCount(task) === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditTask(task);
                      }}
                      className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] hover:bg-white/30"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm("Delete this task?")) return;
                        try {
                          await apiCall(`/tasks/${task.id}`, {
                            method: "DELETE"
                          });
                          loadTasks();
                        } catch {
                          /* ignore */
                        }
                      }}
                      className="px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] hover:bg-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </button>
            ))}

            {tasks.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center text-white/80 py-10">
                No tasks yet. Click “Add Task” to create your first one.
              </div>
            )}
          </div>
        </section>

        {/* ADD PANEL */}
        {isAddOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div
              className="flex-1 bg-black/40"
              onClick={() => {
                setIsAddOpen(false);
                setAddForm(emptyTask);
                setSelectedEmployeeIdsAdd([]);
              }}
            />
            <div className="w-full max-w-md bg-slate-950/95 border-l border-white/10 shadow-2xl p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-1">Add Task</h3>
              <p className="text-xs text-white/70 mb-4">
                Create a new project task and pick team members from Employees.
              </p>

              <form onSubmit={submitAddTask} className="space-y-4 text-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Project Title
                  </label>
                  <input
                    name="projectTitle"
                    value={addForm.projectTitle}
                    onChange={handleAddChange}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    placeholder="e.g. Employee Portal Revamp"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Task Title *
                  </label>
                  <input
                    name="title"
                    value={addForm.title}
                    onChange={handleAddChange}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    placeholder="e.g. Prepare bill for laptop"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Description / Remark
                  </label>
                  <textarea
                    name="description"
                    value={addForm.description}
                    onChange={handleAddChange}
                    rows={3}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white resize-none"
                    placeholder="Short summary of this task"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Assign Date
                    </label>
                    <input
                      name="assignDate"
                      value={addForm.assignDate}
                      onChange={handleAddChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                      placeholder="YYYY-MM-DD HH:MM"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Finish Date
                    </label>
                    <input
                      name="finishDate"
                      value={addForm.finishDate}
                      onChange={handleAddChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={addForm.priority}
                      onChange={handleAddChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Most Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={addForm.status}
                      onChange={handleAddChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="inprogress">Inprogress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Progress %
                    </label>
                    <input
                      name="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={addForm.progress}
                      onChange={handleAddChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* employees selection */}
                <div className="border-t border-white/10 pt-3 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/80">
                      Assign from Employees
                    </span>
                    <span className="text-[11px] text-white/60">
                      Select cards then click Add
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {employeesLoaded ? (
                      employees.map((emp) => {
                        const selected = selectedEmployeeIdsAdd.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => toggleSelectEmpAdd(emp.id)}
                            className={`text-left px-3 py-2 rounded-xl border text-slate-100 text-xs ${
                              selected
                                ? "border-emerald-400 bg-emerald-900/30"
                                : "border-white/10 bg-slate-900/30"
                            }`}
                          >
                            <div className="font-semibold text-sm">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {emp.role} • {emp.department}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-slate-300 text-xs">
                        Loading employees…
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addSelectedEmployeesToForm(
                          selectedEmployeeIdsAdd,
                          setAddForm
                        );
                        setSelectedEmployeeIdsAdd([]);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-600 text-xs font-semibold text-white hover:bg-sky-500"
                    >
                      Add Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeIdsAdd([])}
                      className="px-4 py-2 rounded-xl border border-white/20 text-xs text-white hover:bg-white/5"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="text-[11px] text-slate-300 font-semibold">
                      Assigned Members ({addForm.team.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {addForm.team.map((m) => (
                        <div
                          key={m.id}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs"
                        >
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-[11px] text-slate-300">
                            {m.role} • {m.department}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeMemberFromForm(m.id, setAddForm)
                            }
                            className="mt-1 text-[11px] px-2 py-0.5 rounded bg-rose-500 text-white"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {addForm.team.length === 0 && (
                        <div className="text-slate-400 text-[12px]">
                          No members assigned yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setAddForm(emptyTask);
                      setSelectedEmployeeIdsAdd([]);
                    }}
                    className="px-6 py-2 rounded-xl border border-white/30 bg-white/10 text-xs font-semibold text-slate-100 hover:bg-white/25"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-500 text-xs font-bold text-slate-950 shadow-2xl"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT PANEL */}
        {isEditOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div
              className="flex-1 bg-black/40"
              onClick={() => {
                setIsEditOpen(false);
                setEditingId(null);
                setEditForm(emptyTask);
                setSelectedEmployeeIdsEdit([]);
              }}
            />
            <div className="w-full max-w-md bg-slate-950/95 border-l border-white/10 shadow-2xl p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-1">Edit Task</h3>
              <p className="text-xs text-white/70 mb-4">
                Update project details, status and team members.
              </p>

              <form onSubmit={submitEditTask} className="space-y-4 text-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Project Title
                  </label>
                  <input
                    name="projectTitle"
                    value={editForm.projectTitle}
                    onChange={handleEditChange}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Task Title *
                  </label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1">
                    Description / Remark
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Assign Date
                    </label>
                    <input
                      name="assignDate"
                      value={editForm.assignDate}
                      onChange={handleEditChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Finish Date
                    </label>
                    <input
                      name="finishDate"
                      value={editForm.finishDate}
                      onChange={handleEditChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={editForm.priority}
                      onChange={handleEditChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Most Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="inprogress">Inprogress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 mb-1">
                      Progress %
                    </label>
                    <input
                      name="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.progress}
                      onChange={handleEditChange}
                      className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* employees selection */}
                <div className="border-t border-white/10 pt-3 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/80">
                      Assign from Employees
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {employeesLoaded ? (
                      employees.map((emp) => {
                        const selected =
                          selectedEmployeeIdsEdit.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => toggleSelectEmpEdit(emp.id)}
                            className={`text-left px-3 py-2 rounded-xl border text-slate-100 text-xs ${
                              selected
                                ? "border-emerald-400 bg-emerald-900/30"
                                : "border-white/10 bg-slate-900/30"
                            }`}
                          >
                            <div className="font-semibold text-sm">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {emp.role} • {emp.department}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-slate-300 text-xs">
                        Loading employees…
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addSelectedEmployeesToForm(
                          selectedEmployeeIdsEdit,
                          setEditForm
                        );
                        setSelectedEmployeeIdsEdit([]);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-600 text-xs font-semibold text-white hover:bg-sky-500"
                    >
                      Add Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeIdsEdit([])}
                      className="px-4 py-2 rounded-xl border border-white/20 text-xs text-white hover:bg-white/5"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="text-[11px] text-slate-300 font-semibold">
                      Assigned Members ({editForm.team.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.team.map((m) => (
                        <div
                          key={m.id}
                          className="px-3 py-1.5 rounded-lg bg_WHITE/5 border border-white/10 text-xs"
                        >
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-[11px] text-slate-300">
                            {m.role} • {m.department}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeMemberFromForm(m.id, setEditForm)
                            }
                            className="mt-1 text-[11px] px-2 py-0.5 rounded bg-rose-500 text-white"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {editForm.team.length === 0 && (
                        <div className="text-slate-400 text-[12px]">
                          No members assigned yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setEditingId(null);
                      setEditForm(emptyTask);
                      setSelectedEmployeeIdsEdit([]);
                    }}
                    className="px-6 py-2 rounded-xl border border-white/30 bg-white/10 text-xs font-semibold text-slate-100 hover:bg-white/25"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-500 text-xs font-bold text-slate-950 shadow-2xl"
                  >
                    Update Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {viewingTask && (
          <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={closeView}
            />
            <div className="relative max-w-4xl w-full rounded-2xl bg-slate-950/95 border border-white/15 p-6 md:p-8 text-white shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {viewingTask.projectTitle && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
                      {viewingTask.projectTitle}
                    </div>
                  )}
                  <h3 className="mt-2 text-xl md:text-2xl font-black">
                    {viewingTask.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-100/80">
                    {viewingTask.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={closeView}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* left: timeline + team */}
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-slate-400 text-xs">Timeline</p>
                    <p className="mt-1 text-slate-100 text-sm">
                      Start: {viewingTask.assignDate || "—"}
                    </p>
                    <p className="text-slate-100 text-sm">
                      Finish: {viewingTask.finishDate || "—"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Team Members</h4>
                      <span className="text-xs text-slate-300">
                        {teamCount(viewingTask)} member
                        {teamCount(viewingTask) === 1 ? "" : "s"} •{" "}
                        {departmentSummary(viewingTask)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Array.isArray(viewingTask.team) &&
                      viewingTask.team.length > 0 ? (
                        viewingTask.team.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-sm">
                                  {m.name}
                                </div>
                                <div className="text-[11px] text-slate-300">
                                  {m.role}
                                </div>
                              </div>
                              <div className="text-[11px] text-slate-300">
                                {m.department}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 text-xs">
                          No members assigned.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* right: progress card */}
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-400/30 rounded-2xl">
                    <h3 className="font-bold text-xl mb-4 text-emerald-300 flex items-center gap-2">
                      <span>📊</span> Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="w-full bg-slate-800/60 rounded-2xl h-7 overflow-hidden shadow-inner">
                        <div
                          className="h-7 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl shadow-lg transition-all duration-700 flex items-center justify-center text-xs font-bold text-slate-900"
                          style={{
                            width: `${viewingTask.progress || 0}%`
                          }}
                        >
                          {viewingTask.progress || 0}%
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400">Status</p>
                          <p className="mt-1 font-semibold text-emerald-300 capitalize">
                            {viewingTask.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Priority</p>
                          <p className="mt-1 font-semibold text-purple-300">
                            {viewingTask.priority}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Team size</p>
                          <p className="mt-1 font-semibold text-slate-100">
                            {teamCount(viewingTask)} members
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 text-xs">
                <button
                  onClick={closeView}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    startEditTask(viewingTask);
                    closeView();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300"
                >
                  Edit Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
