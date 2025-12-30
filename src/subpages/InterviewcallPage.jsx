// src/subpages/InterviewcallPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/interviewCalls";

const InterviewcallPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState({ add: false, view: false });
  const [loading, setLoading] = useState({ page: false, action: false });
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    company: "", position: "", date: "", time: "", interviewer: "",
    location: "Zoom", notes: "", calls: 1, status: "Scheduled",
    allStudents: 0, appliedStudents: 0, shortlistedStudents: 0, placedStudents: 0
  });
  const [currentInterview, setCurrentInterview] = useState(null);

  useEffect(() => { fetchInterviews(); }, []);

  const fetchInterviews = async () => {
    setLoading(prev => ({ ...prev, page: true }));
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch interviews");
      setInterviews(await res.json());
    } catch (err) {
      setError("Could not load interviews. Check JSON Server.");
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };

  const filteredInterviews = interviews
    .filter(i => 
      (i.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
       i.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (i.interviewer || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || i.status === filterStatus)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const getStatusColor = (status) => ({
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200"
  }[status] || "bg-slate-100 text-slate-800 border-slate-200");

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, action: true }));
    setError("");

    try {
      const url = isEdit ? `${API_URL}/${currentInterview.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const data = isEdit ? currentInterview : {
        ...formData,
        avatar: formData.company.slice(0, 2).toUpperCase(),
        calls: Number(formData.calls) || 1,
        allStudents: Number(formData.allStudents) || 0,
        appliedStudents: Number(formData.appliedStudents) || 0,
        shortlistedStudents: Number(formData.shortlistedStudents) || 0,
        placedStudents: Number(formData.placedStudents) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'save'} interview`);
      
      const result = await res.json();
      setInterviews(prev => isEdit 
        ? prev.map(i => i.id === result.id ? result : i)
        : [result, ...prev]
      );

      if (!isEdit) setFormData({
        company: "", position: "", date: "", time: "", interviewer: "",
        location: "Zoom", notes: "", calls: 1, status: "Scheduled",
        allStudents: 0, appliedStudents: 0, shortlistedStudents: 0, placedStudents: 0
      });
      
      setModal({ add: false, view: false });
      setCurrentInterview(null);
    } catch (err) {
      setError(`Could not ${isEdit ? 'update' : 'save'} interview. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const deleteInterview = async (id) => {
    if (!confirm("Delete this interview?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setInterviews(prev => prev.filter(i => i.id !== id));
    } catch { alert("Could not delete interview"); }
  };

  const openModal = (type, interview = null) => {
    if (interview) setCurrentInterview({ ...interview });
    setModal({ add: false, view: false, [type]: true });
  };

  const closeModal = () => {
    setModal({ add: false, view: false });
    setCurrentInterview(null);
  };

  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  }) : "";

  const stats = {
    total: interviews.length,
    calls: interviews.reduce((sum, i) => sum + (Number(i.calls) || 0), 0),
    confirmed: interviews.filter(i => i.status === "Confirmed").length,
    scheduled: interviews.filter(i => i.status === "Scheduled").length,
    pending: interviews.filter(i => i.status === "Pending").length
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

  const InterviewRow = ({ interview, index }) => (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td className="px-4 py-3">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center font-semibold text-indigo-700 text-sm">
          {index + 1}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-xs font-bold text-white">
              {interview.avatar || interview.company.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-900">{interview.company}</div>
            <div className="text-xs text-slate-500">{interview.location}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-slate-900">{interview.position}</div>
        <div className="text-xs text-slate-500">{interview.interviewer || "Interviewer TBA"}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-slate-900">{formatDate(interview.date)}</div>
        <div className="text-xs text-slate-600">{interview.time}</div>
      </td>
      <td className="px-4 py-3">
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 font-medium text-xs rounded-lg">
          <span>📞</span>
          <span>{interview.calls || 1}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(interview.status)}`}>
          {interview.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button onClick={() => openModal('view', interview)} className="p-2 rounded-lg text-sm hover:bg-blue-50 text-blue-600" title="View">👁️</button>
          <button onClick={() => deleteInterview(interview.id)} className="p-2 rounded-lg text-sm hover:bg-rose-50 text-rose-600" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  );

  const FormField = ({ label, icon, type = "text", required = false, value, onChange, placeholder, ...props }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        <span className="inline-block mr-1">{icon}</span> {label} {required && "*"}
      </label>
      {type === "textarea" ? (
        <textarea required={required} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm resize-vertical" value={value} onChange={onChange} placeholder={placeholder} rows="2" {...props} />
      ) : (
        <input required={required} type={type} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" value={value} onChange={onChange} placeholder={placeholder} {...props} />
      )}
    </div>
  );

  const StudentStatCard = ({ label, field, icon }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <input type="number" min="0" className="w-full text-xl font-bold text-center bg-transparent border-none focus:outline-none text-slate-900" value={currentInterview?.[field] || 0} onChange={(e) => setCurrentInterview({...currentInterview, [field]: e.target.value})} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 mb-3 rounded-lg">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 uppercase">Interview Management</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Interview Calls</h1>
              <p className="text-sm text-slate-600 mt-1">Schedule and track interview sessions</p>
            </div>
            <button onClick={() => openModal('add')} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2">
              <span>+</span> New Interview
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Interviews" value={stats.total} icon="📅" color="indigo" />
            <StatsCard title="Total Calls" value={stats.calls} icon="📞" color="blue" />
            <StatsCard title="Confirmed" value={stats.confirmed} icon="✅" color="emerald" />
            <StatsCard title="Scheduled" value={stats.scheduled} icon="⏰" color="amber" />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm" placeholder="Search companies, positions, interviewers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-500">⚠️</span>
              <span className="text-sm font-medium text-rose-800">{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-800">✕</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading.page ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-700">Loading interviews...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['#', 'Company', 'Position', 'Date & Time', 'Calls', 'Status', 'Actions'].map((header, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map((interview, index) => (
                    <InterviewRow key={interview.id} interview={interview} index={index} />
                  ))}
                  {filteredInterviews.length === 0 && !loading.page && (
                    <tr>
                      <td colSpan="7" className="py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-14 h-14 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📅</div>
                          <p className="text-base font-medium text-slate-700">No interviews found</p>
                          <p className="text-sm text-slate-500">Schedule your first interview using the button above</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {modal.add && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Schedule Interview</h2>
                  <p className="text-xs text-slate-600">Fill all required fields *</p>
                </div>
                <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><span className="text-lg">✕</span></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Company", icon: "🏢", field: "company", required: true, placeholder: "Company name" },
                    { label: "Position", icon: "💼", field: "position", required: true, placeholder: "Job title" },
                    { label: "Date", icon: "📅", field: "date", type: "date", required: true },
                    { label: "Time", icon: "🕒", field: "time", type: "time", required: true },
                    { label: "Interviewer", icon: "👤", field: "interviewer", placeholder: "Interviewer name" },
                    { label: "Calls", icon: "📞", field: "calls", type: "number", min: "1" }
                  ].map(({ label, icon, field, type, required, placeholder, min }) => (
                    <FormField key={field} label={label} icon={icon} type={type} required={required} value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} placeholder={placeholder} min={min} />
                  ))}
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">📍 Location</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                      {["Zoom", "Google Meet", "Microsoft Teams", "In-person"].map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">📊 Status</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      {["Scheduled", "Confirmed", "Pending"].map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  
                  {["allStudents", "appliedStudents", "shortlistedStudents", "placedStudents"].map(field => (
                    <FormField key={field} label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} icon={{"allStudents":"👥","appliedStudents":"📋","shortlistedStudents":"⭐","placedStudents":"🏆"}[field]} type="number" value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} min="0" />
                  ))}
                  
                  <div className="md:col-span-2">
                    <FormField label="Notes" icon="📝" type="textarea" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Preparation notes..." />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading.action} className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {loading.action ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Schedule Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View/Edit Modal */}
        {modal.view && currentInterview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{currentInterview.avatar || currentInterview.company.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{currentInterview.company}</h2>
                    <p className="text-sm text-slate-600">{currentInterview.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(currentInterview.status)}`}>{currentInterview.status}</span>
                  <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><span className="text-lg">✕</span></button>
                </div>
              </div>

              <form onSubmit={(e) => handleSubmit(e, true)} className="p-6 space-y-6">
                {/* Interview Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
                  {[
                    { label: "Date", value: formatDate(currentInterview.date) },
                    { label: "Time", value: currentInterview.time },
                    { label: "Calls", value: currentInterview.calls || 1 },
                    { label: "Location", value: currentInterview.location }
                  ].map(({ label, value }, i) => (
                    <div key={i}>
                      <span className="text-xs text-slate-500 font-medium">{label}</span>
                      <p className="text-sm font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Student Stats */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Student Pipeline</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "All Students", field: "allStudents", icon: "👥" },
                      { label: "Applied", field: "appliedStudents", icon: "📋" },
                      { label: "Shortlisted", field: "shortlistedStudents", icon: "⭐" },
                      { label: "Placed", field: "placedStudents", icon: "🏆" }
                    ].map(({ label, field, icon }) => (
                      <StudentStatCard key={field} label={label} field={field} icon={icon} />
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Interviewer</label>
                    <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" value={currentInterview.interviewer || ""} onChange={(e) => setCurrentInterview({...currentInterview, interviewer: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" value={currentInterview.status} onChange={(e) => setCurrentInterview({...currentInterview, status: e.target.value})}>
                      {["Scheduled", "Confirmed", "Pending"].map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm resize-vertical" value={currentInterview.notes || ""} onChange={(e) => setCurrentInterview({...currentInterview, notes: e.target.value})} placeholder="Interview notes..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading.action} className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {loading.action ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</> : 'Update Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewcallPage;