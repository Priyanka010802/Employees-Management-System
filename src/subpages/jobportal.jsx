// src/subpages/JobPortalPage.jsx
import React, { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:3000/hrdata";

const JobPortalPage = () => {
  const [jobs, setJobs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const [newJob, setNewJob] = useState({
    title: "",
    role: "",
    name: "",
    contact: "",
    email: "",
    gender: "",
    experience: "",
    count: "",
    status: "Active",
    applicants: 0
  });

  const [editingJob, setEditingJob] = useState(null);

  // Fetch jobs from JSON Server
  useEffect(() => {
    const fetchJobs = async () => {
      setIsPageLoading(true);
      setError("");
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError("Could not load jobs. Check JSON Server at " + API_URL);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = { ...newJob };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save job");
      
      const created = await res.json();
      setJobs(prev => [created, ...prev]);
      
      setNewJob({
        title: "",
        role: "",
        name: "",
        contact: "",
        email: "",
        gender: "",
        experience: "",
        count: "",
        status: "Active",
        applicants: 0
      });
      setIsAddModalOpen(false);
    } catch (err) {
      setError("Could not save job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/${editingJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingJob)
      });
      if (!res.ok) throw new Error("Failed to update job");
      
      const updated = await res.json();
      setJobs(prev => prev.map(job => 
        job.id === updated.id ? updated : job
      ));
      
      setIsEditModalOpen(false);
      setEditingJob(null);
    } catch (err) {
      setError("Could not update job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewJob = (job) => {
    setEditingJob({ ...job });
    setIsViewModalOpen(true);
  };

  const handleEditJobOpen = (job) => {
    setEditingJob({ ...job });
    setIsEditModalOpen(true);
  };

  const deleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job post?")) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      alert("Could not delete job");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setEditingJob(null);
  };

  const getStatusColor = (status) => {
    return status === "Active" 
      ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
      : "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto relative">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-16 pb-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-200 px-4 py-2 mb-3 rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Job Portal</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">
              Job Posts
            </h1>
            <p className="text-sm font-medium text-slate-600 bg-white/80 px-4 py-2 rounded-lg inline-block shadow-sm border border-slate-100">
              Manage job postings and track applications
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col text-right bg-white/90 p-4 rounded-xl shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Jobs</span>
              <span className="text-2xl font-bold text-emerald-600">
                {jobs.length}
              </span>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
            >
              <span className="text-lg">➕</span>
              Add Job & Candidate Details 
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 border-l-4 border-l-rose-400 text-rose-800 p-4 rounded-xl shadow-sm mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-rose-100 rounded-lg flex items-center justify-center">
                <span className="text-rose-500 text-sm">⚠️</span>
              </div>
              <span className="font-medium text-sm">{error}</span>
            </div>
            <div className="text-xs bg-white px-2 py-1 rounded-lg font-mono">{API_URL}</div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isPageLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-slate-200 border-t-emerald-600 rounded-xl animate-spin mb-4 shadow-md" />
              <p className="text-lg font-semibold text-slate-800">Loading job posts...</p>
              <p className="text-slate-500 text-sm mt-1">Connecting to database</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`group relative bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                  selectedJob?.id === job.id ? 'ring-4 ring-emerald-500/30 shadow-emerald-200/50 border-emerald-300' : 'hover:border-emerald-200'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <span className="text-lg font-bold text-white">{job.applicants}</span>
                    </div>
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">{job.title}</h3>
                  <p className="text-emerald-700 font-semibold text-sm mb-1">{job.count}</p>
                  <p className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">{job.role}</p>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-sm"
                      title="View"
                    >
                      <span className="text-sm">👁️</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditJobOpen(job); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200 shadow-sm"
                      title="Edit"
                    >
                      <span className="text-sm">✏️</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/50 transition-all duration-200 shadow-sm"
                      title="Delete"
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {jobs.length === 0 && !isPageLoading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-lg border mb-6">
                💼
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">No Job Posts Yet</h2>
              <p className="text-slate-600 text-sm font-medium max-w-sm mx-auto">
                Create your first job post using the button above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Job Post Modal - Updated Role Dropdown */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">➕ Add New Job Post & Candidate</h2>
                <p className="text-sm font-medium text-slate-600">Fill candidate details for job posting</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <form onSubmit={handleAddJob} className="space-y-6">
              {/* Job Details Section */}
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  💼 Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📋 Job Title</label>
                    <input 
                      required 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                      placeholder="Enter job title" 
                      value={newJob.title} 
                      onChange={e => setNewJob({...newJob, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📊 Openings</label>
                    <input 
                      required 
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium" 
                      placeholder="(5)" 
                      value={newJob.count} 
                      onChange={e => setNewJob({...newJob, count: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Candidate Details Section */}
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  👤 Candidate Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">💼 Role <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium" 
                      value={newJob.role} 
                      onChange={e => setNewJob({...newJob, role: e.target.value})}
                    >
                      <option value="">Select Role</option>
                      <option value="Telecaller">Telecaller</option>
                      <option value="Counselor">Counselor</option>
                      <option value="Trainer">Trainer</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">👤 Name <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                      placeholder="Full Name" 
                      value={newJob.name} 
                      onChange={e => setNewJob({...newJob, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📞 Contact <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="tel"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm font-medium" 
                      placeholder="9876543210" 
                      value={newJob.contact} 
                      onChange={e => setNewJob({...newJob, contact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📧 Email <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="email"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium" 
                      placeholder="candidate@email.com" 
                      value={newJob.email} 
                      onChange={e => setNewJob({...newJob, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">⚤ Gender <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm font-medium" 
                      value={newJob.gender} 
                      onChange={e => setNewJob({...newJob, gender: e.target.value})}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">⭐ Experience <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-medium" 
                      placeholder="2+ years" 
                      value={newJob.experience} 
                      onChange={e => setNewJob({...newJob, experience: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📈 Applicants</label>
                    <input 
                      required 
                      type="number"
                      min="0"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium" 
                      placeholder="0" 
                      value={newJob.applicants} 
                      onChange={e => setNewJob({...newJob, applicants: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📊 Status</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                      value={newJob.status} 
                      onChange={e => setNewJob({...newJob, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Job Post"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal - Updated Role & Gender Dropdowns */}
      {isEditModalOpen && editingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">✏️ Edit Job Post</h2>
                <p className="text-sm font-medium text-slate-600">Update job and candidate information</p>
              </div>
              <button onClick={closeEditModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <form onSubmit={handleEditJob} className="space-y-6">
              {/* Job Details Section */}
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">💼 Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📋 Job Title</label>
                    <input 
                      required 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium" 
                      placeholder="Enter job title" 
                      value={editingJob.title || ""} 
                      onChange={e => setEditingJob({...editingJob, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📊 Openings</label>
                    <input 
                      required 
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                      placeholder="(5)" 
                      value={editingJob.count || ""} 
                      onChange={e => setEditingJob({...editingJob, count: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Candidate Details Section */}
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">👤 Candidate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">💼 Role</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium" 
                      value={editingJob.role || ""} 
                      onChange={e => setEditingJob({...editingJob, role: e.target.value})}
                    >
                      <option value="">Select Role</option>
                      <option value="Telecaller">Telecaller</option>
                      <option value="Counselor">Counselor</option>
                      <option value="Trainer">Trainer</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">👤 Name</label>
                    <input 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                      placeholder="Full Name" 
                      value={editingJob.name || ""} 
                      onChange={e => setEditingJob({...editingJob, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📞 Contact</label>
                    <input 
                      type="tel"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm font-medium" 
                      placeholder="9876543210" 
                      value={editingJob.contact || ""} 
                      onChange={e => setEditingJob({...editingJob, contact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📧 Email</label>
                    <input 
                      type="email"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium" 
                      placeholder="candidate@email.com" 
                      value={editingJob.email || ""} 
                      onChange={e => setEditingJob({...editingJob, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">⚤ Gender</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm font-medium" 
                      value={editingJob.gender || ""} 
                      onChange={e => setEditingJob({...editingJob, gender: e.target.value})}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">⭐ Experience</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-medium" 
                      placeholder="2+ years" 
                      value={editingJob.experience || ""} 
                      onChange={e => setEditingJob({...editingJob, experience: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📈 Applicants</label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium" 
                      placeholder="0" 
                      value={editingJob.applicants || 0} 
                      onChange={e => setEditingJob({...editingJob, applicants: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📊 Status</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                      value={editingJob.status || "Active"} 
                      onChange={e => setEditingJob({...editingJob, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Job Post"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Job Modal remains the same */}
      {isViewModalOpen && editingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">👁️ Job & Candidate Details</h2>
                <p className="text-sm font-medium text-slate-600">Complete information</p>
              </div>
              <button onClick={closeViewModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold text-white">{editingJob.applicants}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{editingJob.title}</h3>
                  <p className="text-xs text-slate-500">Job ID: {editingJob.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Job Details</div>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Openings:</span> {editingJob.count}</div>
                    <div><span className="font-medium">Role:</span> <span className="bg-purple-100 px-2 py-1 rounded text-xs font-semibold">{editingJob.role}</span></div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(editingJob.status)}`}>
                        {editingJob.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Candidate Info</div>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {editingJob.name}</div>
                    <div><span className="font-medium">Experience:</span> {editingJob.experience}</div>
                    <div><span className="font-medium">Gender:</span> <span className="bg-pink-100 px-2 py-1 rounded text-xs font-semibold">{editingJob.gender}</span></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-2">
                      📞 <span>Contact</span>
                    </div>
                    <p className="font-medium text-slate-900">{editingJob.contact}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-2">
                      📧 <span>Email</span>
                    </div>
                    <p className="font-medium text-slate-900">{editingJob.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPortalPage;
