// src/page/Tasks.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const emptyTaskForm = {
  projectTitle: "",
  projectType: "",
  projectCategory: "",
  title: "",
  description: "",
  assignDate: "",
  finishDate: "",
  priority: "Normal",
  status: "pending",
  progress: 0,
  teamLeader: null,
  teamWorkers: []
};

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

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState(sampleEmployees);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingId, setEditingId] = useState(null);
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);
  const [isEditTaskFormOpen, setIsEditTaskFormOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [selectedLeaderId, setSelectedLeaderId] = useState(null);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking');

  const apiCall = async (endpoint, options = {}) => {
    try {
      setServerStatus('connected');
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      setServerStatus('offline');
      return null;
    }
  };

  const loadData = async () => {
    const tasksData = await apiCall('/tasks');
    setTasks(Array.isArray(tasksData) ? tasksData : []);

    const employeesData = await apiCall('/employees');
    if (Array.isArray(employeesData) && employeesData.length > 0) {
      setEmployees(employeesData.map(e => ({
        id: e.id ?? `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: e.name || e.fullName || "Unknown",
        role: e.role || e.position || "",
        department: e.department || ""
      })));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: name === "progress" ? Math.min(100, Math.max(0, Number(value) || 0)) : value
    }));
  };

  const handleSelectLeader = (employeeId) => {
    const leader = employees.find(e => e.id === employeeId);
    if (leader) {
      setTaskForm(prev => ({ ...prev, teamLeader: { ...leader, source: "employee" } }));
      setSelectedLeaderId(employeeId);
    }
  };

  const toggleWorkerSelection = (id) => {
    setSelectedWorkerIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return Array.from(s);
    });
  };

  const handleAddWorkers = () => {
    const selectedWorkers = employees
      .filter(e => selectedWorkerIds.includes(e.id))
      .map(e => ({ ...e, source: "employee" }));

    setTaskForm(prev => {
      const existingIds = new Set(prev.teamWorkers.map(w => w.id));
      const newWorkers = selectedWorkers.filter(w => !existingIds.has(w.id));
      return { ...prev, teamWorkers: [...prev.teamWorkers, ...newWorkers] };
    });
    setSelectedWorkerIds([]);
  };

  const handleRemoveLeader = () => {
    setTaskForm(prev => ({ ...prev, teamLeader: null }));
    setSelectedLeaderId(null);
  };

  const handleRemoveWorker = (workerId) => {
    setTaskForm(prev => ({
      ...prev,
      teamWorkers: prev.teamWorkers.filter(w => w.id !== workerId)
    }));
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() && !taskForm.projectTitle.trim()) return;

    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const payload = {
      ...taskForm,
      id: editingId || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: taskForm.title.trim() || taskForm.projectTitle.trim(),
      description: taskForm.description?.trim() || "",
      assignDate: taskForm.assignDate || now,
      time: now,
      teamWorkers: Array.isArray(taskForm.teamWorkers) ? taskForm.teamWorkers : [],
      teamLeader: taskForm.teamLeader || null
    };

    const endpoint = editingId ? `/tasks/${editingId}` : '/tasks';
    const method = editingId ? 'PUT' : 'POST';

    await apiCall(endpoint, { method, body: JSON.stringify(payload) });
    resetTaskForm();
    loadData();
  };

  const resetTaskForm = () => {
    setTaskForm(emptyTaskForm);
    setEditingId(null);
    setIsAddTaskFormOpen(false);
    setIsEditTaskFormOpen(false);
    setSelectedLeaderId(null);
    setSelectedWorkerIds([]);
  };

  const startAddTask = () => {
    resetTaskForm();
    setIsAddTaskFormOpen(true);
  };

  const startEditTask = (task) => {
    setTaskForm({
      ...emptyTaskForm,
      ...task,
      teamWorkers: Array.isArray(task.teamWorkers) ? task.teamWorkers : [],
      teamLeader: task.teamLeader || null
    });
    setSelectedLeaderId(task.teamLeader?.id || null);
    setSelectedWorkerIds(task.teamWorkers?.map(w => w.id) || []);
    setEditingId(task.id);
    setIsEditTaskFormOpen(true);
  };

  const openView = (task) => setViewingTask(task);
  const closeView = () => setViewingTask(null);

  const teamCount = (task) => {
    const workers = Array.isArray(task.teamWorkers) ? task.teamWorkers.length : 0;
    return workers + (task.teamLeader ? 1 : 0);
  };

  const departmentSummary = (task) => {
    const allMembers = [...(task.teamWorkers || []), task.teamLeader].filter(Boolean);
    if (!allMembers.length) return "No team";
    const map = {};
    allMembers.forEach(m => {
      map[m.department] = (map[m.department] || 0) + 1;
    });
    return Object.entries(map).map(([d, c]) => `${d} (${c})`).join(", ");
  };

  // ✅ FIXED RENDER TASK FORM - Proper JSX Fragment Structure
  const renderTaskForm = (type) => (
    <>
      <form onSubmit={handleTaskSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs md:text-sm">
        {/* Project & Task Fields */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">Project Title</label>
          <input 
            name="projectTitle" 
            value={taskForm.projectTitle} 
            onChange={handleTaskChange} 
            placeholder="Project name (optional)" 
            className="w-full rounded-xl border border-white/25 bg-slate-900/40 px-3 py-2.5 text-xs md:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">Task Title *</label>
          <input 
            name="title" 
            value={taskForm.title} 
            onChange={handleTaskChange} 
            required 
            placeholder="Task description" 
            className="w-full rounded-xl border border-white/25 bg-slate-900/40 px-3 py-2.5 text-xs md:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
          />
        </div>

        <div className="space-y-1.5 md:col-span-1 lg:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">Description</label>
          <input 
            name="description" 
            value={taskForm.description} 
            onChange={handleTaskChange} 
            placeholder="Task details..." 
            className="w-full rounded-xl border border-white/25 bg-slate-900/40 px-3 py-2.5 text-xs md:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
          />
        </div>

        {/* Priority & Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">Priority</label>
          <select name="priority" value={taskForm.priority} onChange={handleTaskChange} className="w-full rounded-xl border border-white/25 bg-slate-900/40 px-3 py-2.5 text-xs md:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Most Urgent</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">Status</label>
          <select name="status" value={taskForm.status} onChange={handleTaskChange} className="w-full rounded-xl border border-white/25 bg-slate-900/40 px-3 py-2.5 text-xs md:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">Progress %</label>
          <input 
            name="progress" 
            type="number" 
            min="0" 
            max="100" 
            value={taskForm.progress} 
            onChange={handleTaskChange} 
            className="w-full rounded-xl border border-white/25 bg-slate-900/40 px-3 py-2.5 text-xs md:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
          />
        </div>

        {/* TEAM LEADER SECTION */}
        <div className="md:col-span-2 lg:col-span-3 space-y-3 border-t border-white/10 pt-6 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-bold text-emerald-300 tracking-wide">👑 Team Leader</label>
            <div className="text-sm text-emerald-400 font-semibold">
              {taskForm.teamLeader ? 'Selected ✓' : 'Choose one'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {employees.slice(0, 8).map(emp => {
              const isSelected = selectedLeaderId === emp.id;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleSelectLeader(emp.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 group hover:scale-105 ${
                    isSelected
                      ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/30 to-emerald-400/30 shadow-lg shadow-emerald-500/50 text-emerald-50'
                      : 'border-white/20 bg-white/5 hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:shadow-emerald-500/20'
                  }`}
                >
                  <div className="font-bold text-sm mb-1 group-hover:text-emerald-50">{emp.name}</div>
                  <div className="text-xs opacity-90">{emp.role}</div>
                  <div className="text-xs opacity-75">{emp.department}</div>
                  {isSelected && <div className="mt-2 w-full h-1 bg-emerald-400 rounded-full" />}
                </button>
              );
            })}
          </div>

          {taskForm.teamLeader && (
            <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 border-2 border-emerald-400/50 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center text-xl shadow-2xl">
                    👑
                  </div>
                  <div>
                    <div className="font-bold text-lg text-emerald-50">{taskForm.teamLeader.name}</div>
                    <div className="text-emerald-200">{taskForm.teamLeader.role} • {taskForm.teamLeader.department}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLeader}
                  className="px-4 py-2 bg-rose-500/90 hover:bg-rose-400 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TEAM WORKERS SECTION */}
        <div className="md:col-span-2 lg:col-span-3 space-y-3 border-t border-white/10 pt-6 bg-gradient-to-r from-sky-500/5 to-blue-500/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-bold text-sky-300 tracking-wide">👥 Team Workers</label>
            <div className="text-sm text-sky-400 font-semibold">{selectedWorkerIds.length} selected</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-xl">
            {employees.slice(0, 12).map(emp => {
              const isSelected = selectedWorkerIds.includes(emp.id);
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleWorkerSelection(emp.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-300 group hover:scale-105 ${
                    isSelected
                      ? 'border-sky-400 bg-gradient-to-br from-sky-500/30 to-blue-500/30 shadow-lg shadow-sky-500/50 text-sky-50'
                      : 'border-white/20 bg-white/5 hover:border-sky-400/50 hover:bg-sky-500/20 hover:shadow-sky-500/20'
                  }`}
                >
                  <div className="font-bold text-xs mb-1 group-hover:text-sky-50">{emp.name}</div>
                  <div className="text-[10px] opacity-90">{emp.role}</div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mb-4">
            <button 
              type="button" 
              onClick={handleAddWorkers} 
              disabled={selectedWorkerIds.length === 0}
              className="flex-1 px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm"
            >
              Add {selectedWorkerIds.length > 0 ? `(${selectedWorkerIds.length}) Workers` : 'Workers'}
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedWorkerIds([])} 
              className="px-6 py-3 border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl shadow-lg transition-all text-sm"
            >
              Clear All
            </button>
          </div>

          {taskForm.teamWorkers.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-bold text-sky-300">Assigned Workers ({taskForm.teamWorkers.length})</div>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto p-2 bg-white/5 rounded-xl">
                {taskForm.teamWorkers.map(worker => (
                  <div key={worker.id} className="px-3 py-2 bg-white/10 border border-white/20 text-xs rounded-xl group flex items-center gap-2 shadow-sm">
                    <span className="font-semibold truncate max-w-24">{worker.name}</span>
                    <span className="text-[10px] opacity-75">{worker.role}</span>
                    <button 
                      onClick={() => handleRemoveWorker(worker.id)}
                      className="ml-1 text-rose-400 hover:text-rose-300 text-sm opacity-0 group-hover:opacity-100 transition-all p-1 hover:scale-110"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 pt-6">
          <button 
            type="button" 
            onClick={resetTaskForm}
            className="px-8 py-3 border border-white/30 bg-white/10 backdrop-blur-xl text-white font-bold rounded-2xl shadow-lg hover:bg-white/20 hover:shadow-xl hover:scale-[1.02] transition-all text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-10 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all text-sm shadow-emerald-500/50"
          >
            {type === 'add' ? 'Create Task' : 'Update Task'}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 md:px-10 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-indigo-500 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-emerald-500 blur-3xl animate-pulse animation-delay-3000" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-sky-100 to-emerald-100 bg-clip-text text-transparent drop-shadow-2xl">
              Task Management Dashboard
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                serverStatus === 'connected' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/50'
              } border py-1 px-3`}>
                {serverStatus === 'connected' ? '🟢 Live Server' : '⚠️ Offline Mode'}
              </div>
              <span className="text-sm text-slate-400">{tasks.length} active tasks</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={startAddTask}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 font-bold rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 shadow-emerald-500/50"
            >
              <span className="text-xl">➕</span>
              <span>Add New Task</span>
            </button>
          </div>
        </section>

        {/* Forms */}
        {isAddTaskFormOpen && (
          <section className="relative bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-sky-500/5" />
            <div className="relative flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-emerald-50 to-sky-50 bg-clip-text text-transparent drop-shadow-xl">
                  ➕ Create New Task
                </h2>
                <p className="text-slate-300 mt-2">Assign leader first, then add team workers</p>
              </div>
              <button
                onClick={resetTaskForm}
                className="p-3 rounded-2xl bg-white/20 border border-white/30 hover:bg-white/30 text-white font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>
            {renderTaskForm('add')}
          </section>
        )}

        {isEditTaskFormOpen && (
          <section className="relative bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5" />
            <div className="relative flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-sky-50 to-purple-50 bg-clip-text text-transparent drop-shadow-xl">
                  ✏️ Edit Task
                </h2>
                <p className="text-slate-300 mt-2">Update task details and team assignment</p>
              </div>
              <button
                onClick={resetTaskForm}
                className="p-3 rounded-2xl bg-white/20 border border-white/30 hover:bg-white/30 text-white font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>
            {renderTaskForm('edit')}
          </section>
        )}

        {/* Tasks Table */}
        <section className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Task History ({tasks.length})</h2>
              <button 
                onClick={loadData} 
                className="px-6 py-2.5 bg-white/20 backdrop-blur-xl border border-white/30 text-white text-sm font-bold rounded-2xl hover:bg-white/30 transition-all flex items-center gap-2"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 backdrop-blur-xl">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-white/90">#</th>
                  <th className="px-6 py-4 text-left font-bold text-white/90">Task/Project</th>
                  <th className="px-6 py-4 text-left font-bold text-white/90">Leader</th>
                  <th className="px-6 py-4 text-left font-bold text-white/90">Team</th>
                  <th className="px-6 py-4 text-left font-bold text-white/90">Progress</th>
                  <th className="px-6 py-4 text-left font-bold text-white/90">Status</th>
                  <th className="px-6 py-4 text-right font-bold text-white/90">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={task.id} className="border-b border-white/10 hover:bg-white/10 transition-all">
                    <td className="px-6 py-4 font-semibold text-white/90">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white/90">{task.title || task.projectTitle}</div>
                      {task.projectTitle && (
                        <div className="text-sm text-slate-400 mt-1">Project: {task.projectTitle}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-emerald-400">{task.teamLeader?.name || '—'}</div>
                      <div className="text-xs text-slate-500">{task.teamLeader?.role || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{teamCount(task)} members</div>
                      <div className="text-xs text-slate-400">{departmentSummary(task)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all" 
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                      <div className="text-sm font-mono">{task.progress || 0}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        task.status === 'completed' ? 'bg-emerald-500/90 text-white shadow-emerald-500/50' :
                        task.status === 'inprogress' ? 'bg-blue-500/90 text-white shadow-blue-500/50' :
                        'bg-amber-500/90 text-white shadow-amber-500/50'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openView(task)} 
                        className="px-4 py-2 bg-emerald-500/90 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => startEditTask(task)} 
                        className="px-4 py-2 bg-sky-500/90 hover:bg-sky-400 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('Delete this task?')) {
                            await apiCall(`/tasks/${task.id}`, { method: 'DELETE' });
                            loadData();
                          }
                        }}
                        className="px-4 py-2 bg-rose-500/90 hover:bg-rose-400 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!tasks.length && (
                  <tr>
                    <td colSpan={7} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-6 text-slate-500">
                        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-4xl animate-pulse">
                          📋
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2 text-slate-400">No tasks yet</h3>
                          <p className="text-lg">Click "Add New Task" to get started 🚀</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* View Modal */}
        {viewingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md" onClick={closeView}>
            <div className="bg-slate-900/95 border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-3xl backdrop-blur-3xl mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/20">
                <h2 className="text-4xl font-black text-white">{viewingTask.title}</h2>
                <button onClick={closeView} className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all">✕</button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <h3 className="font-bold text-lg mb-4 text-emerald-400">👑 Team Leader</h3>
                    {viewingTask.teamLeader ? (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/20 rounded-xl">
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl font-bold text-2xl flex items-center justify-center shadow-2xl">
                          {viewingTask.teamLeader.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xl text-white">{viewingTask.teamLeader.name}</div>
                          <div className="text-emerald-300">{viewingTask.teamLeader.role}</div>
                          <div className="text-slate-400">{viewingTask.teamLeader.department}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">No leader assigned</div>
                    )}
                  </div>

                  <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-sky-400">👥 Team Workers ({teamCount(viewingTask)})</h3>
                      <span className="text-sm text-slate-400">{departmentSummary(viewingTask)}</span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                      {viewingTask.teamWorkers?.map(worker => (
                        <div key={worker.id} className="p-4 bg-white/5 border border-white/20 rounded-xl group hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center text-sm">
                              {worker.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white truncate">{worker.name}</div>
                              <div className="text-sky-300 text-sm">{worker.role}</div>
                              <div className="text-slate-500 text-xs">{worker.department}</div>
                            </div>
                          </div>
                        </div>
                      )) || <div className="col-span-full text-center py-8 text-slate-500">No workers assigned</div>}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-400/30 rounded-2xl">
                    <h3 className="font-bold text-xl mb-4 text-emerald-400">📊 Progress</h3>
                    <div className="space-y-4">
                      <div className="w-full bg-slate-800/50 rounded-2xl h-6 overflow-hidden shadow-inner">
                        <div 
                          className="h-6 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl shadow-lg transition-all duration-1000 flex items-center justify-center font-bold text-sm shadow-emerald-500/50" 
                          style={{ width: `${viewingTask.progress || 0}%` }}
                        >
                          {viewingTask.progress}%
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Status: <span className="font-bold capitalize text-emerald-400">{viewingTask.status}</span></div>
                        <div>Priority: <span className="font-bold text-purple-400">{viewingTask.priority}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                    <h3 className="font-bold text-xl mb-4 text-white">📅 Timeline</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned:</span>
                        <span className="font-mono text-white">{viewingTask.assignDate || viewingTask.time || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Due:</span>
                        <span className="font-mono text-white">{viewingTask.finishDate || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span className="font-mono text-white">{viewingTask.time || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/20 flex justify-end gap-4">
                <button 
                  onClick={closeView} 
                  className="px-8 py-4 border border-white/30 bg-white/10 backdrop-blur-xl text-white font-bold rounded-2xl hover:bg-white/20 shadow-lg hover:shadow-xl transition-all text-lg"
                >
                  Close
                </button>
                <button 
                  onClick={() => { startEditTask(viewingTask); closeView(); }} 
                  className="px-10 py-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all text-lg shadow-sky-500/50"
                >
                  Edit Task
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
          .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animation-delay-3000 { animation-delay: 3s; }
        `}</style>
      </div>
    </div>
  );
};

export default Tasks;
