// src/subpages/SchedulePage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/hrdata";

const SchedulePage = () => {
  const [data, setData] = useState({ telecaller: [], counselor: [], trainer: [], hr: [] });
  const [modal, setModal] = useState({ add: false, edit: false, view: false });
  const [loading, setLoading] = useState({ page: false, action: false });
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("telecaller");
  const [formData, setFormData] = useState({
    type: "interview", role: "Telecaller", title: "", candidateName: "",
    contact: "", email: "", date: "", time: "", status: "Scheduled", applicants: 0
  });
  const [currentInterview, setCurrentInterview] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading({ ...loading, page: true });
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
      setLoading({ ...loading, page: false });
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setLoading({ ...loading, action: true });
    setError("");
    try {
      const url = isEdit ? `${API_URL}/${currentInterview.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const interviewData = isEdit ? currentInterview : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewData)
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'save'} interview`);
      
      const result = await res.json();
      const roleKey = result.role.toLowerCase();

      setData(prev => ({
        ...prev,
        [roleKey]: isEdit 
          ? prev[roleKey].map(item => item.id === result.id ? result : item)
          : [result, ...prev[roleKey]]
      }));

      if (!isEdit) {
        setFormData({
          type: "interview", role: "Telecaller", title: "", candidateName: "",
          contact: "", email: "", date: "", time: "", status: "Scheduled", applicants: 0
        });
      }
      
      setModal({ add: false, edit: false, view: false });
      setCurrentInterview(null);
    } catch (err) {
      setError(`Could not ${isEdit ? 'update' : 'save'} interview. Please try again.`);
    } finally {
      setLoading({ ...loading, action: false });
    }
  };

  const deleteInterview = async (id, role) => {
    if (!confirm("Delete this interview?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData(prev => ({
        ...prev,
        [role.toLowerCase()]: prev[role.toLowerCase()].filter(item => item.id !== id)
      }));
    } catch { alert("Could not delete interview"); }
  };

  const openModal = (type, interview = null, role = null) => {
    if (interview) setCurrentInterview({ ...interview });
    if (role) setFormData(prev => ({ ...prev, role }));
    setModal({ add: false, edit: false, view: false, [type]: true });
  };

  const closeModal = () => {
    setModal({ add: false, edit: false, view: false });
    setCurrentInterview(null);
  };

  const getStatusColor = (status) => ({
    "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
    "Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Cancelled": "bg-rose-100 text-rose-800 border-rose-200"
  }[status] || "bg-slate-100 text-slate-800 border-slate-200");

  const sections = [
    { key: "telecaller", title: "Telecaller", icon: "📞", color: "from-rose-500 to-pink-600" },
    { key: "counselor", title: "Counselor", icon: "🧑‍🏫", color: "from-emerald-500 to-teal-600" },
    { key: "trainer", title: "Trainer", icon: "👨‍🏫", color: "from-blue-500 to-indigo-600" },
    { key: "hr", title: "HR", icon: "👔", color: "from-purple-500 to-violet-600" }
  ];

  const activeSectionConfig = sections.find(s => s.key === activeSection);
  const stats = {
    total: Object.values(data).reduce((a, b) => a + b.length, 0),
    active: data[activeSection].length
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

  const InterviewCard = ({ interview }) => (
    <div className="group relative bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-500" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${activeSectionConfig?.color} rounded-xl flex items-center justify-center shadow group-hover:scale-110 transition-transform`}>
            <span className="text-lg font-bold text-white">{interview.applicants || 0}</span>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(interview.status)}`}>
            {interview.status}
          </span>
        </div>
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
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button onClick={(e) => { e.stopPropagation(); openModal('view', interview); }} className="p-2 rounded-lg text-sm hover:bg-blue-50 text-blue-600" title="View">👁️</button>
          <button onClick={(e) => { e.stopPropagation(); openModal('edit', interview); }} className="p-2 rounded-lg text-sm hover:bg-emerald-50 text-emerald-600" title="Edit">✏️</button>
          <button onClick={(e) => { e.stopPropagation(); deleteInterview(interview.id, interview.role); }} className="p-2 rounded-lg text-sm hover:bg-rose-50 text-rose-600" title="Delete">🗑️</button>
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
        <select required={required} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" value={value} onChange={onChange} {...props}>
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input required={required} type={type} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" value={value} onChange={onChange} placeholder={placeholder} {...props} />
      )}
    </div>
  );

  const Modal = ({ type, title, onSubmit }) => {
    const data = type === 'add' ? formData : currentInterview;
    const setData = type === 'add' ? setFormData : setCurrentInterview;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-600">Fill all required fields *</p>
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><span className="text-lg">✕</span></button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Interview Title" icon="📋" required value={data.title} 
                onChange={e => setData({...data, title: e.target.value})} placeholder="Technical Round 1" />
              <FormField label="Role" icon="💼" type="select" required value={data.role} 
                onChange={e => setData({...data, role: e.target.value})} options={["Telecaller", "Counselor", "Trainer", "HR"]} />
              <FormField label="Candidate Name" icon="👤" required value={data.candidateName} 
                onChange={e => setData({...data, candidateName: e.target.value})} placeholder="John Doe" />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">📅 Date & Time *</label>
                <input required type="datetime-local" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm" 
                  value={`${data.date || ''}T${data.time || ''}`} 
                  onChange={e => setData({...data, date: e.target.value.slice(0, 10), time: e.target.value.slice(11, 16)})} />
              </div>
              <FormField label="Contact" icon="📞" type="tel" value={data.contact} 
                onChange={e => setData({...data, contact: e.target.value})} placeholder="9876543210" />
              <FormField label="Email" icon="📧" type="email" value={data.email} 
                onChange={e => setData({...data, email: e.target.value})} placeholder="candidate@example.com" />
              <FormField label="Status" icon="📊" type="select" required value={data.status} 
                onChange={e => setData({...data, status: e.target.value})} options={["Scheduled", "Completed", "Cancelled"]} />
              <FormField label="Applicants" icon="👥" type="number" value={data.applicants} 
                onChange={e => setData({...data, applicants: e.target.value})} min="0" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={loading.action} className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading.action ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{type === 'add' ? 'Scheduling...' : 'Updating...'}</> : type === 'add' ? 'Schedule Interview' : 'Update Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 mb-3 rounded-lg">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 uppercase">Interview Schedule</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Scheduled Interviews</h1>
              <p className="text-sm text-slate-600 mt-1">Manage interviews by role</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatsCard title="Total Interviews" value={stats.total} icon="📅" color="indigo" />
              <StatsCard title="Active Section" value={stats.active} icon={activeSectionConfig?.icon} color="blue" />
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200">
            {sections.map((section) => (
              <button key={section.key} onClick={() => setActiveSection(section.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeSection === section.key ? `bg-gradient-to-r ${section.color} text-white shadow` : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <span>{section.icon}</span>
                {section.title}
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">{data[section.key].length}</span>
              </button>
            ))}
          </div>
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

        {/* Interviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading.page ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700">Loading interviews...</p>
            </div>
          ) : data[activeSection]?.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                  {activeSectionConfig?.icon}
                </div>
                <p className="text-base font-medium text-slate-700">No {activeSectionConfig?.title} interviews</p>
                <p className="text-sm text-slate-500">Schedule your first interview</p>
                <button onClick={() => openModal('add', null, activeSectionConfig?.title)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors mt-2">
                  Add Interview
                </button>
              </div>
            </div>
          ) : (
            data[activeSection].map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))
          )}
        </div>

        {/* Add Button */}
        <button onClick={() => openModal('add', null, activeSectionConfig?.title)} className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center text-xl" title="Add Interview">
          +
        </button>

        {/* Modals */}
        {modal.add && <Modal type="add" title="Schedule Interview" onSubmit={(e) => handleSubmit(e, false)} />}
        {modal.edit && <Modal type="edit" title="Edit Interview" onSubmit={(e) => handleSubmit(e, true)} />}

        {/* View Modal */}
        {modal.view && currentInterview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Interview Details</h2>
                  <p className="text-xs text-slate-600">ID: {currentInterview.id}</p>
                </div>
                <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><span className="text-lg">✕</span></button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow mb-3">
                    <span className="text-xl font-bold text-white">{currentInterview.applicants || 0}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{currentInterview.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-indigo-700">{currentInterview.role}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(currentInterview.status)}`}>
                      {currentInterview.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Candidate Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-500">Name:</span> <span className="font-medium">{currentInterview.candidateName}</span></div>
                      <div><span className="text-slate-500">Contact:</span> <span className="font-medium">{currentInterview.contact || 'Not provided'}</span></div>
                      <div><span className="text-slate-500">Email:</span> <span className="font-medium">{currentInterview.email || 'Not provided'}</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-500">Date:</span> <span className="font-medium">{currentInterview.date}</span></div>
                      <div><span className="text-slate-500">Time:</span> <span className="font-medium">{currentInterview.time}</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { closeModal(); openModal('edit', currentInterview); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Edit</button>
                  <button onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;