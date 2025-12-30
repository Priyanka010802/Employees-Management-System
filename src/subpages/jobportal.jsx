// src/subpages/JobPortalPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/hrdata";

const JobPortalPage = () => {
  const [jobs, setJobs] = useState([]);
  const [modal, setModal] = useState({ add: false, edit: false, view: false });
  const [loading, setLoading] = useState({ page: false, action: false });
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "", role: "", name: "", contact: "", email: "",
    gender: "", experience: "", count: "", status: "Active", applicants: 0
  });
  const [currentJob, setCurrentJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading({ ...loading, page: true });
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      setJobs(await res.json());
    } catch (err) {
      setError("Could not load jobs. Check JSON Server at " + API_URL);
    } finally {
      setLoading({ ...loading, page: false });
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setLoading({ ...loading, action: true });
    setError("");

    try {
      const url = isEdit ? `${API_URL}/${currentJob.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const data = isEdit ? currentJob : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'save'} job`);
      
      const result = await res.json();
      setJobs(prev => isEdit 
        ? prev.map(job => job.id === result.id ? result : job)
        : [result, ...prev]
      );

      if (!isEdit) {
        setFormData({
          title: "", role: "", name: "", contact: "", email: "",
          gender: "", experience: "", count: "", status: "Active", applicants: 0
        });
      }
      
      setModal({ add: false, edit: false, view: false });
      setCurrentJob(null);
    } catch (err) {
      setError(`Could not ${isEdit ? 'update' : 'save'} job. Please try again.`);
    } finally {
      setLoading({ ...loading, action: false });
    }
  };

  const deleteJob = async (id) => {
    if (!confirm("Delete this job?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch {
      alert("Could not delete job");
    }
  };

  const openModal = (type, job = null) => {
    if (job) setCurrentJob({ ...job });
    setModal({ add: false, edit: false, view: false, [type]: true });
  };

  const closeModal = () => {
    setModal({ add: false, edit: false, view: false });
    setCurrentJob(null);
  };

  const getStatusColor = (status) => 
    status === "Active" 
      ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
      : "bg-amber-100 text-amber-800 border-amber-200";

  const stats = {
    total: jobs.length,
    active: jobs.filter(job => job.status === "Active").length,
    applicants: jobs.reduce((sum, job) => sum + (Number(job.applicants) || 0), 0),
    openings: jobs.filter(job => job.count).length
  };

  const StatsCard = ({ title, value, icon, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <span className={`text-${color}-600 text-sm`}>{icon}</span>
        </div>
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium">{title}</p>
    </div>
  );

  const JobCard = ({ job }) => (
    <div className="group relative bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-lg font-bold text-white">{job.applicants || 0}</span>
          </div>
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {job.title}
        </h3>
        <p className="text-emerald-700 font-semibold text-sm mb-1">{job.count}</p>
        <p className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">{job.role}</p>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={(e) => { e.stopPropagation(); openModal('view', job); }} className="p-2 rounded-lg text-sm hover:bg-blue-50 text-blue-600" title="View">👁️</button>
          <button onClick={(e) => { e.stopPropagation(); openModal('edit', job); }} className="p-2 rounded-lg text-sm hover:bg-emerald-50 text-emerald-600" title="Edit">✏️</button>
          <button onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }} className="p-2 rounded-lg text-sm hover:bg-rose-50 text-rose-600" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  );

  const FormField = ({ label, icon, type = "text", required = false, value, onChange, placeholder, options, ...props }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        <span className="inline-block mr-1">{icon}</span> {label} {required && "*"}
      </label>
      {type === "select" ? (
        <select
          required={required}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
          value={value}
          onChange={onChange}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          required={required}
          type={type}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      )}
    </div>
  );

  const FormSection = ({ title, icon, children, color = "emerald" }) => (
    <div className={`p-5 bg-${color}-50 rounded-xl border border-${color}-200`}>
      <h3 className={`text-lg font-bold text-${color}-800 mb-4 flex items-center gap-2`}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );

  const Modal = ({ type, title, onSubmit }) => {
    const data = type === 'add' ? formData : currentJob;
    const setData = type === 'add' ? setFormData : setCurrentJob;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-600">Fill all required fields *</p>
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
              <span className="text-lg">✕</span>
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <FormSection title="Job Details" icon="💼" color="emerald">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Job Title" icon="📋" required value={data.title} 
                  onChange={e => setData({...data, title: e.target.value})} placeholder="Enter job title" />
                <FormField label="Openings" icon="📊" required value={data.count} 
                  onChange={e => setData({...data, count: e.target.value})} placeholder="(5)" />
              </div>
            </FormSection>

            <FormSection title="Candidate Details" icon="👤" color="blue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Role" icon="💼" type="select" required value={data.role} 
                  onChange={e => setData({...data, role: e.target.value})} options={["Telecaller", "Counselor", "Trainer", "HR"]} />
                <FormField label="Name" icon="👤" required value={data.name} 
                  onChange={e => setData({...data, name: e.target.value})} placeholder="Full Name" />
                <FormField label="Contact" icon="📞" type="tel" required value={data.contact} 
                  onChange={e => setData({...data, contact: e.target.value})} placeholder="9876543210" />
                <FormField label="Email" icon="📧" type="email" required value={data.email} 
                  onChange={e => setData({...data, email: e.target.value})} placeholder="candidate@email.com" />
                <FormField label="Gender" icon="⚤" type="select" required value={data.gender} 
                  onChange={e => setData({...data, gender: e.target.value})} options={["Male", "Female", "Other"]} />
                <FormField label="Experience" icon="⭐" required value={data.experience} 
                  onChange={e => setData({...data, experience: e.target.value})} placeholder="2+ years" />
              </div>
            </FormSection>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Applicants" icon="📈" type="number" value={data.applicants} 
                  onChange={e => setData({...data, applicants: e.target.value})} min="0" />
                <FormField label="Status" icon="📊" type="select" value={data.status} 
                  onChange={e => setData({...data, status: e.target.value})} options={["Active", "Pending"]} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} 
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading.action}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading.action ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {type === 'add' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  type === 'add' ? 'Create Job Post' : 'Update Job Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 mb-3 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 uppercase">Job Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Job Posts</h1>
              <p className="text-sm text-slate-600 mt-1">Manage job postings and track applications</p>
            </div>
            <button 
              onClick={() => openModal('add')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <span>+</span> Add Job Post
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Jobs" value={stats.total} icon="💼" color="blue" />
            <StatsCard title="Active Jobs" value={stats.active} icon="✅" color="emerald" />
            <StatsCard title="Total Applicants" value={stats.applicants} icon="📊" color="indigo" />
            <StatsCard title="Openings" value={stats.openings} icon="📈" color="purple" />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-500">⚠️</span>
              <span className="text-sm font-medium text-rose-800">{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-800">
              ✕
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading.page ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700">Loading job posts...</p>
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
          
          {jobs.length === 0 && !loading.page && (
            <div className="col-span-full py-12 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                  💼
                </div>
                <p className="text-base font-medium text-slate-700">No job posts found</p>
                <p className="text-sm text-slate-500">Add your first job post using the button above</p>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {modal.add && <Modal type="add" title="Add New Job Post" onSubmit={(e) => handleSubmit(e, false)} />}
        {modal.edit && <Modal type="edit" title="Edit Job Post" onSubmit={(e) => handleSubmit(e, true)} />}

        {/* View Modal */}
        {modal.view && currentJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Job Details</h2>
                  <p className="text-xs text-slate-600">ID: {currentJob.id}</p>
                </div>
                <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
                  <span className="text-lg">✕</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Job Header */}
                <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow mb-3">
                    <span className="text-xl font-bold text-white">{currentJob.applicants || 0}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{currentJob.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-emerald-700 font-semibold">{currentJob.count}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(currentJob.status)}`}>
                      {currentJob.status}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Job Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-500">Role:</span> <span className="font-medium">{currentJob.role}</span></div>
                      <div><span className="text-slate-500">Experience:</span> <span className="font-medium">{currentJob.experience}</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Candidate Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-500">Name:</span> <span className="font-medium">{currentJob.name}</span></div>
                      <div><span className="text-slate-500">Gender:</span> <span className="font-medium">{currentJob.gender}</span></div>
                      <div><span className="text-slate-500">Contact:</span> <span className="font-medium">{currentJob.contact}</span></div>
                      <div><span className="text-slate-500">Email:</span> <span className="font-medium">{currentJob.email}</span></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      openModal('edit', currentJob);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Job
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPortalPage;