// src/page/Tasks.jsx
import { useEffect, useState, useCallback } from "react";

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
  team: []
};

const statusGroups = [
  { key: "pending", label: "To‑do", color: "bg-emerald-500" },
  { key: "in-progress", label: "In Progress", color: "bg-amber-400" },
  { key: "completed", label: "Completed", color: "bg-rose-500" }
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [serverStatus, setServerStatus] = useState("idle");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  
  const [formData, setFormData] = useState(emptyTask);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  // API helper
  const apiCall = useCallback(async (path, options = {}) => {
    try {
      setServerStatus("loading");
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setServerStatus("connected");
      return data;
    } catch (err) {
      setServerStatus("error");
      throw err;
    }
  }, []);

  // Data loading - Adjusted for typical db.json structure
  const loadData = useCallback(async () => {
    try {
      const [tasksData, employeesData] = await Promise.all([
        apiCall("/tasks"),
        apiCall("/employees").catch(() => [])
      ]);
      
      // Handle tasks data
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      
      // Handle employees data - with flexible field mapping
      if (Array.isArray(employeesData) && employeesData.length > 0) {
        setEmployees(employeesData.map(e => ({
          id: e.id || e._id || `emp_${Date.now()}_${Math.random()}`,
          name: e.name || e.fullName || e.employeeName || "Unknown Employee",
          role: e.role || e.position || e.jobTitle || e.designation || "Not specified",
          department: e.department || e.division || e.departmentName || "Not specified",
          email: e.email || e.emailAddress || "",
          phone: e.phone || e.phoneNumber || e.mobile || ""
        })));
      } else {
        setEmployees([]);
      }
      setEmployeesLoaded(true);
    } catch {
      setTasks([]);
      setEmployees([]);
      setEmployeesLoaded(true);
    }
  }, [apiCall]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper functions
  const teamCount = useCallback((task) => Array.isArray(task?.team) ? task.team.length : 0, []);
  
  const departmentSummary = useCallback((task) => {
    if (!Array.isArray(task?.team) || task.team.length === 0) return "No team";
    const map = {};
    task.team.forEach(m => {
      if (m.department) map[m.department] = (map[m.department] || 0) + 1;
    });
    return Object.entries(map).map(([d, c]) => `${d} (${c})`).join(", ");
  }, []);

  const overallProgress = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / tasks.length)
    : 0;

  const priorityClass = (p) => {
    if (p === "High") return "bg-rose-50 text-rose-700 border-rose-100";
    if (p === "Low") return "bg-sky-50 text-sky-700 border-sky-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  // Form handlers
  const handleFormChange = useCallback((e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({
      ...prev,
      [name]: name === "progress" ? Math.min(100, Math.max(0, Number(value) || 0)) : value
    }));
  }, []);

  const toggleSelectEmp = useCallback((id, setter) => {
    setter(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return Array.from(s);
    });
  }, []);

  const addSelectedEmployees = useCallback((ids, taskSetter) => {
    const selected = employees
      .filter(e => ids.includes(String(e.id)))
      .map(e => ({
        id: e.id,
        name: e.name,
        role: e.role,
        department: e.department,
        email: e.email,
        phone: e.phone
      }));

    taskSetter(prev => {
      const existingIds = new Set(prev.team.map(m => m.id));
      const added = selected.filter(s => !existingIds.has(s.id));
      return { ...prev, team: [...prev.team, ...added] };
    });
  }, [employees]);

  const removeMember = useCallback((memberId, setter) => {
    setter(prev => ({
      ...prev,
      team: prev.team.filter(m => m.id !== memberId)
    }));
  }, []);

  // Action handlers
  const startAddTask = () => {
    setFormData(emptyTask);
    setSelectedEmployeeIds([]);
    setIsAddOpen(true);
  };

  const startEditTask = useCallback((task) => {
    setEditingId(task.id);
    setFormData({
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
    setSelectedEmployeeIds([]);
    setIsEditOpen(true);
  }, []);

  const submitTask = async (e, isEdit = false) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Task name is required!");
      return;
    }

    addSelectedEmployees(selectedEmployeeIds, setFormData);

    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: (formData.description || "").trim(),
      assignDate: formData.assignDate || now,
      team: Array.isArray(formData.team) ? formData.team : []
    };

    if (!isEdit) {
      payload.time = now;
    }

    try {
      const method = isEdit ? "PATCH" : "POST";
      const path = isEdit ? `/tasks/${editingId}` : "/tasks";
      await apiCall(path, { method, body: JSON.stringify(payload) });
      
      if (isEdit) {
        setIsEditOpen(false);
        setEditingId(null);
      } else {
        setIsAddOpen(false);
      }
      
      setFormData(emptyTask);
      setSelectedEmployeeIds([]);
      await loadData();
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task. Please check your JSON server.");
    }
  };

  const closeModal = useCallback(() => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setViewingTask(null);
    setFormData(emptyTask);
    setEditingId(null);
    setSelectedEmployeeIds([]);
  }, []);

  // Grouped tasks
  const groupedTasks = statusGroups.map(group => ({
    ...group,
    items: tasks.filter(t => t.status === group.key)
  }));

  // Reusable Form Component
  const TaskForm = ({ isEdit = false, onSubmit }) => (
    <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs">
      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">Project title</label>
        <input name="projectTitle" value={formData.projectTitle} 
          onChange={(e) => handleFormChange(e, setFormData)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          placeholder="e.g. Employee Portal" />
      </div>

      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">Task name *</label>
        <input name="title" value={formData.title} required
          onChange={(e) => handleFormChange(e, setFormData)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          placeholder="Design employee directory" />
      </div>

      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">Description</label>
        <textarea name="description" value={formData.description} rows={3}
          onChange={(e) => handleFormChange(e, setFormData)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60 resize-none"
          placeholder="Short summary of the work" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-medium text-slate-700">Start date</label>
          <input type="date" name="assignDate" value={formData.assignDate}
            onChange={(e) => handleFormChange(e, setFormData)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
        </div>
        <div className="space-y-1.5">
          <label className="font-medium text-slate-700">Deadline</label>
          <input type="date" name="finishDate" value={formData.finishDate}
            onChange={(e) => handleFormChange(e, setFormData)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-medium text-slate-700">Priority</label>
          <select name="priority" value={formData.priority}
            onChange={(e) => handleFormChange(e, setFormData)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60">
            <option value="Low">Low</option>
            <option value="Normal">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-medium text-slate-700">Status</label>
          <select name="status" value={formData.status}
            onChange={(e) => handleFormChange(e, setFormData)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60">
            <option value="pending">To‑do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-medium text-slate-700">Progress (%)</label>
        <input type="number" name="progress" value={formData.progress}
          onChange={(e) => handleFormChange(e, setFormData)} min={0} max={100}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-medium text-slate-700">
            {isEdit ? "Add more members" : "Add members"}
          </label>
          <span className="text-[11px] text-slate-400">Selected: {teamCount(formData)}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {employeesLoaded ? employees.map(emp => (
            <button type="button" key={emp.id}
              onClick={() => toggleSelectEmp(String(emp.id), setSelectedEmployeeIds)}
              className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${
                selectedEmployeeIds.includes(String(emp.id))
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
              {emp.name}
            </button>
          )) : <span className="text-slate-400">Loading employees...</span>}
        </div>
        {formData.team.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {formData.team.map(m => (
              <span key={m.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-700">
                {m.name}
                <button type="button" onClick={() => removeMember(m.id, setFormData)}
                  className="text-slate-400 hover:text-slate-700">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 flex gap-2">
        <button type="button" onClick={closeModal}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600">
          {isEdit ? "Update task" : "Save task"}
        </button>
      </div>
    </form>
  );

  // Reusable Drawer Component
  const Drawer = ({ isOpen, title, subtitle, onClose, children }) => isOpen && (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-[slideIn_0.25s_ease-out]">
        <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  );

  // Reusable Task Row Component
  const TaskRow = ({ task, groupKey }) => (
    <div className="px-4 md:px-6 py-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-[16px_minmax(0,2fr)_minmax(0,1.5fr)_130px_180px_120px_150px] gap-y-2 items-center transition-all duration-200 hover:bg-slate-50/80 hover:-translate-y-0.5 hover:shadow-sm">
      <div><input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-sky-500 focus:ring-sky-500" /></div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{task.title || "Untitled task"}</p>
        <p className="text-[11px] text-slate-400 truncate">{task.description || "No description"}</p>
      </div>
      <div className="min-w-0 text-xs text-slate-700 truncate">{task.projectTitle || "—"}</div>
      <div className="text-xs text-slate-700">{task.finishDate || "No date"}</div>
      <div className="flex items-center gap-1">
        {Array.isArray(task.team) && task.team.length > 0 ? (
          <>
            {task.team.slice(0, 4).map(m => (
              <div key={m.id} className="relative group">
                <div className="h-8 w-8 rounded-full bg-slate-200 text-[10px] flex items-center justify-center text-slate-700 border-2 border-white -ml-2 first:ml-0 hover:z-10 hover:scale-110 transition-transform">
                  {m.name?.charAt(0) || "U"}
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {m.name}
                  <div className="text-slate-300">{m.role}</div>
                </div>
              </div>
            ))}
            {teamCount(task) > 4 && (
              <div className="h-8 w-8 rounded-full bg-slate-100 text-[10px] flex items-center justify-center text-slate-600 border-2 border-white -ml-2 cursor-help relative group">
                +{teamCount(task) - 4}
              </div>
            )}
          </>
        ) : <span className="text-[11px] text-slate-400 italic">No members</span>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-1.5 rounded-full ${groupKey === "completed" ? "bg-emerald-500" : "bg-sky-500"} transition-all duration-500`}
            style={{ width: `${Math.min(100, Number(task.progress) || 0)}%` }} />
        </div>
        <span className="text-[11px] text-slate-500 w-8 text-right">
          {Math.min(100, Number(task.progress) || 0)}%
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => setViewingTask(task)} className="px-3 py-1.5 rounded-full bg-slate-50 text-[11px] text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all">
          View
        </button>
        <button onClick={() => startEditTask(task)} className="px-3 py-1.5 rounded-full bg-sky-500 text-white text-[11px] font-semibold shadow-sm hover:bg-sky-600 transition-all">
          Update
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-slate-50 relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-slate-100" />
      <div className="relative max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-5 md:space-y-6">
        {/* Header */}
        <header className="rounded-3xl bg-white border border-slate-200 shadow-sm px-4 md:px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500 text-xl animate-pulse">📌</div>
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">Project Tasks</h1>
                <p className="text-xs md:text-sm text-slate-500">Add project tasks and assign members from your database.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="hidden md:flex items-center -space-x-2">
                {employees.slice(0, 4).map(e => (
                  <div key={e.id} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 text-[11px] flex items-center justify-center text-slate-700">
                    {e.name.charAt(0)}
                  </div>
                ))}
                {employees.length > 4 && <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 text-[11px] flex items-center justify-center text-slate-600">+{employees.length - 4}</div>}
                {employees.length === 0 && <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 text-[11px] flex items-center justify-center text-slate-700">∅</div>}
              </div>
              <button onClick={startAddTask} className="group inline-flex items-center gap-2 rounded-full bg-sky-500 text-white text-xs md:text-sm font-semibold px-4 py-2 shadow-sm hover:bg-sky-600 transition-all duration-200 hover:-translate-y-0.5">
                <span className="text-sm">＋</span>
                <span>Add Project Task</span>
                <span className="ml-1 h-1.5 w-6 rounded-full bg-white/60 group-hover:w-8 transition-all duration-300" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-xs text-slate-500">{overallProgress}% Completed ({tasks.length} tasks)</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${
              serverStatus === "connected" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
              serverStatus === "error" ? "bg-rose-50 border-rose-200 text-rose-700" :
              "bg-amber-50 border-amber-200 text-amber-700"}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                serverStatus === "connected" ? "bg-emerald-500" :
                serverStatus === "error" ? "bg-rose-500" : "bg-amber-400"}`} />
              API {serverStatus}
            </span>
          </div>
        </header>

        {/* Task Groups */}
        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {groupedTasks.map(group => (
              <div key={group.key} className="bg-white">
                <div className="px-4 md:px-6 py-3 flex items-center justify-between bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-6 rounded-full ${group.color}`} />
                    <p className="text-sm font-semibold text-slate-900">{group.label}</p>
                    <span className="text-xs text-slate-400 animate-pulse">{group.items.length}</span>
                  </div>
                  <button onClick={startAddTask} className="text-xs text-slate-500 hover:text-slate-800 transition-colors">+ Add task</button>
                </div>
                <div className="px-4 md:px-6 py-2 border-t border-slate-100 text-[11px] text-slate-400 uppercase hidden md:grid md:grid-cols-[16px_minmax(0,2fr)_minmax(0,1.5fr)_130px_180px_120px_150px]">
                  <div /><div>Task name</div><div>Project</div><div>Deadline</div><div>Team Members</div><div>Progress</div><div className="text-right">Actions</div>
                </div>
                {group.items.map(task => <TaskRow key={task.id} task={task} groupKey={group.key} />)}
                {group.items.length === 0 && <div className="px-4 md:px-6 py-6 text-xs text-slate-400">No tasks in this section. Add your first task!</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Drawers */}
        <Drawer isOpen={isAddOpen} title="Add project task" subtitle="Create a new task and assign members." onClose={closeModal}>
          <TaskForm onSubmit={(e) => submitTask(e, false)} />
        </Drawer>

        <Drawer isOpen={isEditOpen} title="Update task & members" subtitle="Change details or quickly add more members." onClose={closeModal}>
          <TaskForm isEdit onSubmit={(e) => submitTask(e, true)} />
        </Drawer>

        {/* View Modal */}
        {viewingTask && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
              <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{viewingTask.title || "Task details"}</p>
                  <p className="text-[11px] text-slate-500">{viewingTask.projectTitle || "No project"}</p>
                </div>
                <button onClick={() => setViewingTask(null)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">×</button>
              </header>
              <div className="px-4 py-4 space-y-4 text-xs">
                <div className="bg-sky-50 p-3 rounded-xl">
                  <h3 className="font-semibold text-slate-800 mb-2">Task Overview</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{viewingTask.description || "No description provided."}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1 p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Status</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      viewingTask.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      viewingTask.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {viewingTask.status || "pending"}
                    </span>
                  </div>
                  <div className="space-y-1 p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Priority</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityClass(viewingTask.priority)}`}>{viewingTask.priority || "Normal"}</span>
                  </div>
                  <div className="space-y-1 p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Progress</p>
                    <p className="text-slate-800 font-semibold">{Math.min(100, Number(viewingTask.progress) || 0)}%</p>
                  </div>
                  <div className="space-y-1 p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Team Size</p>
                    <p className="text-slate-800 font-semibold">{teamCount(viewingTask)} members</p>
                  </div>
                </div>
                <div className="space-y-2"><h3 className="font-semibold text-slate-800">Timeline</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><p className="text-[11px] text-slate-500">Start Date</p><p className="text-slate-800 font-medium">{viewingTask.assignDate || "—"}</p></div>
                    <div className="space-y-1"><p className="text-[11px] text-slate-500">Deadline</p><p className="text-slate-800 font-medium">{viewingTask.finishDate || "—"}</p></div>
                  </div>
                </div>
                <div className="space-y-2"><h3 className="font-semibold text-slate-800">Departments Involved</h3><p className="text-slate-700">{departmentSummary(viewingTask)}</p></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-800">Team Members</h3><span className="text-[11px] text-slate-400">{teamCount(viewingTask)} assigned</span></div>
                  {Array.isArray(viewingTask.team) && viewingTask.team.length > 0 ? (
                    <div className="space-y-2">
                      {viewingTask.team.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-sm font-medium">{m.name?.charAt(0) || "U"}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{m.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{m.role} • {m.department}{m.email && ` • ${m.email}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-500 italic">No team members assigned.</p>}
                </div>
              </div>
              <footer className="px-4 py-3 border-t border-slate-200 flex justify-between gap-2">
                <button onClick={() => setViewingTask(null)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                <div className="flex gap-2">
                  <button onClick={() => { setViewingTask(null); startEditTask(viewingTask); }} className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600">Edit Task</button>
                </div>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;