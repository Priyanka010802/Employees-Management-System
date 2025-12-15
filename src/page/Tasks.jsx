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

const statusGroups = [
  { key: "pending", label: "To‑do", color: "bg-emerald-500" },
  { key: "in-progress", label: "In Progress", color: "bg-amber-400" },
  { key: "completed", label: "Completed", color: "bg-rose-500" }
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

  const overallProgress =
    tasks.length > 0
      ? Math.round(
          tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) /
            tasks.length
        )
      : 0;

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

    addSelectedEmployeesToForm(selectedEmployeeIdsAdd, setAddForm);

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
      // handled in apiCall
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

    addSelectedEmployeesToForm(selectedEmployeeIdsEdit, setEditForm);

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
      // handled in apiCall
    }
  };

  // ---------- View modal ----------
  const openView = (task) => setViewingTask(task);
  const closeView = () => setViewingTask(null);

  // ---------- UI ----------
  const groupedTasks = statusGroups.map((group) => ({
    ...group,
    items: tasks.filter((t) => t.status === group.key)
  }));

  const priorityClass = (p) => {
    if (p === "High")
      return "bg-rose-50 text-rose-700 border-rose-100";
    if (p === "Low")
      return "bg-sky-50 text-sky-700 border-sky-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-slate-100" />
      <div className="relative max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-5 md:space-y-6">
        {/* header */}
        <header className="rounded-3xl bg-white border border-slate-200 shadow-sm px-4 md:px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500 text-xl animate-pulse">
                📌
              </div>
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">
                  Project Tasks
                </h1>
                <p className="text-xs md:text-sm text-slate-500">
                  Add project tasks and assign members in a clean table view.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="hidden md:flex items-center -space-x-2">
                {employees.slice(0, 4).map((e) => (
                  <div
                    key={e.id}
                    className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 text-[11px] flex items-center justify-center text-slate-700"
                  >
                    {e.name.charAt(0)}
                  </div>
                ))}
                {employees.length > 4 && (
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 text-[11px] flex items-center justify-center text-slate-600">
                    +{employees.length - 4}
                  </div>
                )}
              </div>
              <button
                onClick={startAddTask}
                className="group inline-flex items-center gap-2 rounded-full bg-sky-500 text-white text-xs md:text-sm font-semibold px-4 py-2 shadow-sm hover:bg-sky-600 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="text-sm">＋</span>
                <span>Add Project Task</span>
                <span className="ml-1 h-1.5 w-6 rounded-full bg-white/60 group-hover:w-8 transition-all duration-300" />
              </button>
            </div>
          </div>

          {/* overall progress + status */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {overallProgress}% Completed
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${
                serverStatus === "connected"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : serverStatus === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  serverStatus === "connected"
                    ? "bg-emerald-500"
                    : serverStatus === "error"
                    ? "bg-rose-500"
                    : "bg-amber-400"
                }`}
              />
              API {serverStatus}
            </span>
          </div>
        </header>

        {/* grouped table sections (no sort / label / filters / board / timeline) */}
        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {statusGroups.map((group) => {
              const items = groupedTasks.find((g) => g.key === group.key)
                ?.items || [];
              return (
                <div key={group.key} className="bg-white">
                  {/* group header */}
                  <div className="px-4 md:px-6 py-3 flex items-center justify-between bg-slate-50/60">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-6 rounded-full ${group.color}`}
                      />
                      <p className="text-sm font-semibold text-slate-900">
                        {group.label}
                      </p>
                      <span className="text-xs text-slate-400 animate-pulse">
                        {items.length}
                      </span>
                    </div>
                    <button
                      onClick={startAddTask}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      + Add task
                    </button>
                  </div>

                  {/* header row */}
                  <div className="px-4 md:px-6 py-2 border-t border-slate-100 text-[11px] text-slate-400 uppercase hidden md:grid md:grid-cols-[16px_minmax(0,2fr)_minmax(0,2fr)_130px_150px_150px_150px]">
                    <div />
                    <div>Task name</div>
                    <div>Description</div>
                    <div>Deadline</div>
                    { <div>People</div> }
                    <div>Progress</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* rows */}
                  {items.map((task) => (
                    <div
                      key={task.id}
                      className="px-4 md:px-6 py-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-[16px_minmax(0,2fr)_minmax(0,2fr)_130px_150px_150px_150px] gap-y-2 items-center transition-all duration-200 hover:bg-slate-50/80 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      {/* checkbox */}
                      <div className="flex items-center justify-start">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                        />
                      </div>

                      {/* task name + project */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {task.title || "Untitled task"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {task.projectTitle || "No project"}
                        </p>
                      </div>

                      {/* description */}
                      <div className="min-w-0 text-xs text-slate-500 truncate">
                        {task.description || "—"}
                      </div>

                      {/* deadline */}
                      <div className="text-xs text-slate-700">
                        {task.finishDate || "No date"}
                      </div>

                      {/* people */}
                      {<div className="flex items-center gap-1">
                        {Array.isArray(task.team) && task.team.length > 0 ? (
                          <>
                            {task.team.slice(0, 3).map((m) => (
                              <div
                                key={m.id}
                                className="h-7 w-7 rounded-full bg-slate-200 text-[10px] flex items-center justify-center text-slate-700 border border-white -ml-1 first:ml-0"
                              >
                                {m.name?.charAt(0) || "U"}
                              </div>
                            ))}
                            {teamCount(task) > 3 && (
                              <div className="h-7 w-7 rounded-full bg-slate-100 text-[10px] flex items-center justify-center text-slate-600 border border-white -ml-1">
                                +{teamCount(task) - 3}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            members
                          </span>
                        )}
                      </div> }
{/* ********************************************************** */}
                      {/* progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              group.key === "completed"
                                ? "bg-emerald-500"
                                : "bg-sky-500"
                            } transition-all duration-500`}
                            style={{
                              width: `${Math.min(
                                100,
                                Number(task.progress) || 0
                              )}%`
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 w-8 text-right">
                          {Math.min(100, Number(task.progress) || 0)}%
                        </span>
                      </div>

                      {/* actions: Update + Add Member + View */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditTask(task)}
                          className="px-3 py-1.5 rounded-full bg-sky-500 text-white text-[11px] font-semibold shadow-sm hover:bg-sky-600 transition-all"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => startEditTask(task)}
                          className="px-3 py-1.5 rounded-full bg-slate-50 text-[11px] text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all"
                        >
                          Add Members
                        </button>
                        <button
                          onClick={() => openView(task)}
                          className="h-8 w-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition-colors"
                          title="View details"
                        >
                          ⋯
                        </button>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="px-4 md:px-6 py-6 text-xs text-slate-400">
                      No tasks in this section.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Add Task drawer */}
        {isAddOpen && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
            <div
              className="flex-1"
              onClick={() => {
                setIsAddOpen(false);
                setAddForm(emptyTask);
                setSelectedEmployeeIdsAdd([]);
              }}
            />
            <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-[slideIn_0.25s_ease-out]">
              <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Add project task
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Create a new task and assign members.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddOpen(false);
                    setAddForm(emptyTask);
                    setSelectedEmployeeIdsAdd([]);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
                >
                  ×
                </button>
              </header>

              <form
                onSubmit={submitAddTask}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Project title
                  </label>
                  <input
                    name="projectTitle"
                    value={addForm.projectTitle}
                    onChange={handleAddChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    placeholder="e.g. Employee Portal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Task name *
                  </label>
                  <input
                    name="title"
                    value={addForm.title}
                    onChange={handleAddChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    placeholder="Design employee directory"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={addForm.description}
                    onChange={handleAddChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60 resize-none"
                    placeholder="Short summary of the work"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Start / assign date
                    </label>
                    <input
                      type="date"
                      name="assignDate"
                      value={addForm.assignDate}
                      onChange={handleAddChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Deadline
                    </label>
                    <input
                      type="date"
                      name="finishDate"
                      value={addForm.finishDate}
                      onChange={handleAddChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={addForm.priority}
                      onChange={handleAddChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={addForm.status}
                      onChange={handleAddChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    >
                      <option value="pending">To‑do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    name="progress"
                    value={addForm.progress}
                    onChange={handleAddChange}
                    min={0}
                    max={100}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  />
                </div>

                {/* team picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-slate-700">
                      Add members
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Selected: {teamCount(addForm)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {employeesLoaded ? (
                      employees.map((emp) => {
                        const selected = selectedEmployeeIdsAdd.includes(
                          String(emp.id)
                        );
                        return (
                          <button
                            type="button"
                            key={emp.id}
                            onClick={() =>
                              toggleSelectEmpAdd(String(emp.id))
                            }
                            className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${
                              selected
                                ? "bg-sky-50 border-sky-300 text-sky-700"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            {emp.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-slate-400">
                        Loading employees...
                      </span>
                    )}
                  </div>
                  {Array.isArray(addForm.team) && addForm.team.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {addForm.team.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-700"
                        >
                          {m.name}
                          <button
                            type="button"
                            onClick={() =>
                              removeMemberFromForm(m.id, setAddForm)
                            }
                            className="text-slate-400 hover:text-slate-700"
                          >
                            
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setAddForm(emptyTask);
                      setSelectedEmployeeIdsAdd([]);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600"
                  >
                    Save task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Task drawer */}
        {isEditOpen && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
            <div
              className="flex-1"
              onClick={() => {
                setIsEditOpen(false);
                setEditingId(null);
                setEditForm(emptyTask);
                setSelectedEmployeeIdsEdit([]);
              }}
            />
            <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-[slideIn_0.25s_ease-out]">
              <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Update task & members
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Change details or quickly add more members.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingId(null);
                    setEditForm(emptyTask);
                    setSelectedEmployeeIdsEdit([]);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
                >
                  ×
                </button>
              </header>

              <form
                onSubmit={submitEditTask}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Project title
                  </label>
                  <input
                    name="projectTitle"
                    value={editForm.projectTitle}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Task name *
                  </label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Start / assign date
                    </label>
                    <input
                      type="date"
                      name="assignDate"
                      value={editForm.assignDate}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Deadline
                    </label>
                    <input
                      type="date"
                      name="finishDate"
                      value={editForm.finishDate}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={editForm.priority}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                    >
                      <option value="pending">To‑do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-700">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    name="progress"
                    value={editForm.progress}
                    onChange={handleEditChange}
                    min={0}
                    max={100}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                  />
                </div>

                {/* team picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-slate-700">
                      Members
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Selected: {teamCount(editForm)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {employeesLoaded ? (
                      employees.map((emp) => {
                        const selected = selectedEmployeeIdsEdit.includes(
                          String(emp.id)
                        );
                        return (
                          <button
                            type="button"
                            key={emp.id}
                            onClick={() =>
                              toggleSelectEmpEdit(String(emp.id))
                            }
                            className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${
                              selected
                                ? "bg-sky-50 border-sky-300 text-sky-700"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            {emp.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-slate-400">
                        Loading employees...
                      </span>
                    )}
                  </div>
                  {Array.isArray(editForm.team) && editForm.team.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {editForm.team.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-700"
                        >
                          {m.name}
                          <button
                            type="button"
                            onClick={() =>
                              removeMemberFromForm(m.id, setEditForm)
                            }
                            className="text-slate-400 hover:text-slate-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setEditingId(null);
                      setEditForm(emptyTask);
                      setSelectedEmployeeIdsEdit([]);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600"
                  >
                    Update task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View modal */}
        {viewingTask && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {viewingTask.title || "Task details"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {viewingTask.projectTitle || "No project"}
                  </p>
                </div>
                <button
                  onClick={closeView}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
                >
                  ×
                </button>
              </header>

              <div className="px-4 py-4 space-y-3 text-xs">
                <p className="text-slate-600">
                  {viewingTask.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 uppercase">
                      Start date
                    </p>
                    <p className="text-slate-800">
                      {viewingTask.assignDate || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 uppercase">
                      Deadline
                    </p>
                    <p className="text-slate-800">
                      {viewingTask.finishDate || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 uppercase">
                      Priority
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-[11px] font-medium ${priorityClass(
                        viewingTask.priority
                      )}`}
                    >
                      {viewingTask.priority || "Normal"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 uppercase">
                      Progress
                    </p>
                    <p className="text-slate-800">
                      {Math.min(
                        100,
                        Number(viewingTask.progress) || 0
                      )}
                      %
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase">
                    Departments
                  </p>
                  <p className="text-slate-700">
                    {departmentSummary(viewingTask)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase">
                    Team
                  </p>
                  {Array.isArray(viewingTask.team) &&
                  viewingTask.team.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {viewingTask.team.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-700"
                        >
                          {m.name}
                          {m.role && (
                            <span className="text-slate-400">
                              · {m.role}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No team assigned.</p>
                  )}
                </div>
              </div>

              <footer className="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => {
                    closeView();
                    startEditTask(viewingTask);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600"
                >
                  Update task
                </button>
                <button
                  onClick={closeView}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>

      {/* simple keyframe for drawers (optional; add to global CSS if you want smoother) */}
      {/* @keyframes slideIn { from { transform: translateX(12px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } */}
    </div>
  );
};

export default Tasks;
