// src/subpages/SchedulePage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/hrdata";

const SchedulePage = () => {
  const [data, setData] = useState({
    telecaller: [],
    counselor: [],
    trainer: [],
    hr: []
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("telecaller");
  const [currentRole, setCurrentRole] = useState("");

  const [newInterview, setNewInterview] = useState({
    type: "interview",
    role: "Telecaller",
    title: "",
    candidateName: "",
    contact: "",
    email: "",
    date: "",
    time: "",
    status: "Scheduled",
    applicants: 0
  });

  const [editingInterview, setEditingInterview] = useState(null);
  const [viewingInterview, setViewingInterview] = useState(null);

  // Fetch and categorize data from JSON Server
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      setError("");
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch data");
        const allData = await res.json();
        
        const interviews = allData.filter(item => item.type === 'interview');
        
        const categorized = {
          telecaller: interviews.filter(item => item.role === 'Telecaller'),
          counselor: interviews.filter(item => item.role === 'Counselor'),
          trainer: interviews.filter(item => item.role === 'Trainer'),
          hr: interviews.filter(item => item.role === 'HR')
        };
        
        setData(categorized);
      } catch (err) {
        setError("Could not load schedule data. Check JSON Server at " + API_URL);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddInterview = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = { ...newInterview };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save interview");
      
      const created = await res.json();
      
      // Update specific section
      setData(prev => ({
        ...prev,
        [newInterview.role.toLowerCase()]: [created, ...prev[newInterview.role.toLowerCase()]]
      }));
      
      // Reset form
      resetNewInterviewForm();
      setIsAddModalOpen(false);
    } catch (err) {
      setError("Could not save interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInterview = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/${editingInterview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingInterview)
      });
      if (!res.ok) throw new Error("Failed to update interview");
      
      const updated = await res.json();
      
      // Update specific section
      setData(prev => ({
        ...prev,
        [updated.role.toLowerCase()]: prev[updated.role.toLowerCase()].map(item => 
          item.id === updated.id ? updated : item
        )
      }));
      
      setIsEditModalOpen(false);
      setEditingInterview(null);
    } catch (err) {
      setError("Could not update interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInterview = async (id, role) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      // Remove from specific section
      setData(prev => ({
        ...prev,
        [role.toLowerCase()]: prev[role.toLowerCase()].filter(item => item.id !== id)
      }));
    } catch (err) {
      alert("Could not delete interview");
    }
  };

  const resetNewInterviewForm = () => {
    setNewInterview({
      type: "interview",
      role: "Telecaller",
      title: "",
      candidateName: "",
      contact: "",
      email: "",
      date: "",
      time: "",
      status: "Scheduled",
      applicants: 0
    });
  };

  const openAddModal = (role) => {
    setCurrentRole(role);
    setNewInterview(prev => ({ ...prev, role }));
    setIsAddModalOpen(true);
  };

  const openEditModal = (interview) => {
    setEditingInterview({ ...interview });
    setIsEditModalOpen(true);
  };

  const openViewModal = (interview) => {
    setViewingInterview({ ...interview });
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsAddModalOpen(false);
    setEditingInterview(null);
    setViewingInterview(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
      "Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Cancelled": "bg-rose-100 text-rose-800 border-rose-200"
    };
    return colors[status] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  const sections = [
    { key: "telecaller", title: "Telecaller", icon: "📞", color: "from-rose-500 to-pink-600" },
    { key: "counselor", title: "Counselor", icon: "🧑‍🏫", color: "from-emerald-500 to-teal-600" },
    { key: "trainer", title: "Trainer", icon: "👨‍🏫", color: "from-blue-500 to-indigo-600" },
    { key: "hr", title: "HR", icon: "👔", color: "from-purple-500 to-violet-600" }
  ];

  const sectionConfig = sections.find(s => s.key === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-16 pb-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-200 px-4 py-2 mb-3 rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Interview Management</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">
              Scheduled Interviews
            </h1>
            <p className="text-sm font-medium text-slate-600 bg-white/80 px-4 py-2 rounded-lg inline-block shadow-sm border border-slate-100">
              Manage interviews by role with full CRUD operations
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col text-right bg-white/90 p-4 rounded-xl shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</span>
              <span className="text-2xl font-bold text-indigo-600">
                {Object.values(data).reduce((a, b) => a + b.length, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 border-l-4 border-l-rose-400 text-rose-800 p-4 rounded-xl shadow-sm mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-rose-100 rounded-lg flex items-center justify-center">
                <span className="text-rose-500 text-sm">⚠️</span>
              </div>
              <span className="font-medium text-sm">{error}</span>
            </div>
            <div className="text-xs bg-white px-2 py-1 rounded-lg font-mono">{API_URL}</div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-200">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                activeSection === section.key
                  ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              {section.title}
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                {data[section.key].length}
              </span>
            </button>
          ))}
        </div>

        {/* Active Section Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isPageLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-2xl animate-spin mb-6 shadow-xl" />
              <p className="text-xl font-semibold text-slate-800 mb-2">Loading interviews...</p>
              <p className="text-slate-600 text-sm">Fetching schedule data</p>
            </div>
          ) : data[activeSection]?.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 mx-auto bg-slate-100 rounded-3xl flex items-center justify-center text-4xl shadow-xl mb-6 border-4 border-slate-200">
                {sectionConfig?.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                No {sectionConfig?.title} Interviews
              </h3>
              <p className="text-slate-600 text-lg mb-6 max-w-md">
                Be the first to schedule a {sectionConfig?.title.toLowerCase()} interview
              </p>
              <button 
                onClick={() => openAddModal(sectionConfig?.title)}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>📅</span>
                Schedule First Interview
              </button>
            </div>
          ) : (
            data[activeSection].map((interview) => (
              <div
                key={interview.id}
                className="group relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-500" />
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${sectionConfig?.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <span className="text-lg font-bold text-white">
                        {interview.applicants || 0}
                      </span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ml-auto whitespace-nowrap ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-1">
                    {interview.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-indigo-500 font-semibold">👤</span>
                      <span className="font-medium">{interview.candidateName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                      <span>📅</span>
                      {interview.date} at {interview.time}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => openViewModal(interview)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm group-hover:scale-105"
                      title="View Details"
                    >
                      <span className="text-sm">👁️</span>
                    </button>
                    <button 
                      onClick={() => openEditModal(interview)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm group-hover:scale-105"
                      title="Edit"
                    >
                      <span className="text-sm">✏️</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteInterview(interview.id, interview.role)}
                      className="flex items-center gap-1 px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/50 transition-all shadow-sm group-hover:scale-105"
                      title="Delete"
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Interview Button - Floating */}
        <button 
          onClick={() => openAddModal(sectionConfig?.title)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 flex items-center justify-center text-xl"
          title="Add New Interview"
        >
          ➕
        </button>
      </div>

      {/* Add Interview Modal */}
      {isAddModalOpen && (
        <InterviewModal
          isOpen={isAddModalOpen}
          onClose={() => {
            resetNewInterviewForm();
            setIsAddModalOpen(false);
          }}
          title={`📅 Schedule ${currentRole} Interview`}
          subtitle="Fill in the interview details"
          interview={newInterview}
          onChange={setNewInterview}
          onSubmit={handleAddInterview}
          isLoading={isLoading}
          mode="add"
        />
      )}

      {/* Edit Interview Modal */}
      {isEditModalOpen && editingInterview && (
        <InterviewModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingInterview(null);
          }}
          title={`✏️ Edit ${editingInterview.role} Interview`}
          subtitle="Update the interview details"
          interview={editingInterview}
          onChange={setEditingInterview}
          onSubmit={handleEditInterview}
          isLoading={isLoading}
          mode="edit"
        />
      )}

      {/* View Interview Modal */}
      {isViewModalOpen && viewingInterview && (
        <ViewInterviewModal
          interview={viewingInterview}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingInterview(null);
          }}
          onEdit={() => {
            setIsViewModalOpen(false);
            setViewingInterview(null);
            openEditModal(viewingInterview);
          }}
        />
      )}
    </div>
  );
};

// Reusable Interview Modal Component
const InterviewModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  interview, 
  onChange, 
  onSubmit, 
  isLoading, 
  mode 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-sm font-medium text-slate-600">{subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-110 shadow-lg"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                📋 Interview Title <span className="text-rose-500">*</span>
              </label>
              <input 
                required 
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm text-sm font-medium" 
                placeholder="Technical Round 1" 
                value={interview.title} 
                onChange={e => onChange({...interview, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                💼 Role <span className="text-rose-500">*</span>
              </label>
              <select 
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm text-sm font-medium" 
                value={interview.role} 
                onChange={e => onChange({...interview, role: e.target.value})}
              >
                <option value="Telecaller">Telecaller</option>
                <option value="Counselor">Counselor</option>
                <option value="Trainer">Trainer</option>
                <option value="HR">HR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                👤 Candidate Name <span className="text-rose-500">*</span>
              </label>
              <input 
                required 
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm text-sm font-medium" 
                placeholder="John Doe" 
                value={interview.candidateName} 
                onChange={e => onChange({...interview, candidateName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                📅 Date & Time <span className="text-rose-500">*</span>
              </label>
              <input 
                required
                type="datetime-local"
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm text-sm font-medium" 
                value={`${interview.date || ''}T${interview.time || ''}`} 
                onChange={e => {
                  onChange({
                    ...interview,
                    date: e.target.value.slice(0, 10),
                    time: e.target.value.slice(11, 16)
                  });
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">📞 Contact</label>
              <input 
                type="tel"
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-sm text-sm font-medium" 
                placeholder="9876543210" 
                value={interview.contact} 
                onChange={e => onChange({...interview, contact: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">📧 Email</label>
              <input 
                type="email"
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm text-sm font-medium" 
                placeholder="candidate@example.com" 
                value={interview.email} 
                onChange={e => onChange({...interview, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">📊 Status <span className="text-rose-500">*</span></label>
              <select 
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm text-sm font-medium" 
                value={interview.status} 
                onChange={e => onChange({...interview, status: e.target.value})}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">👥 Applicants</label>
              <input 
                type="number"
                min="0"
                className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-3 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm text-sm font-medium" 
                placeholder="0" 
                value={interview.applicants || 0} 
                onChange={e => onChange({...interview, applicants: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-8 py-3 border-2 border-slate-300 text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:shadow-xl focus:ring-4 focus:ring-slate-400 transition-all shadow-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'add' ? 'Scheduling...' : 'Updating...'}
                </>
              ) : (
                <>
                  <span>{mode === 'add' ? '📅' : '💾'}</span>
                  {mode === 'add' ? 'Schedule Interview' : 'Update Interview'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Interview Modal Component
const ViewInterviewModal = ({ interview, onClose, onEdit }) => {
  const getStatusColor = (status) => {
    const colors = {
      "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
      "Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Cancelled": "bg-rose-100 text-rose-800 border-rose-200"
    };
    return colors[status] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">👁️ Interview Details</h2>
            <p className="text-sm font-medium text-slate-600">{interview.candidateName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-110 shadow-lg"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</span>
                <span className="font-bold text-lg text-slate-900">{interview.title}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Role</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                  {interview.role}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Status</span>
                <span className={`px-4 py-2 text-sm font-bold rounded-full border ${getStatusColor(interview.status)}`}>
                  {interview.status}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Applicants</span>
                <span className="text-2xl font-bold text-indigo-600">{interview.applicants || 0}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Date & Time</span>
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">📅</span>
                    <span>{interview.date}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🕒</span>
                    <span>{interview.time}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Contact</span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-lg font-semibold text-slate-900">{interview.contact || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Email</span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-lg font-semibold text-slate-900 break-all">{interview.email || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-slate-200 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-3 border-2 border-slate-300 text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:shadow-xl focus:ring-4 focus:ring-slate-400 transition-all shadow-lg"
          >
            Close
          </button>
          <button 
            onClick={onEdit}
            className="flex-1 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 focus:ring-4 focus:ring-emerald-500/50 transition-all flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            Edit Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
