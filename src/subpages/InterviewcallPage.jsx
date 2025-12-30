// src/subpages/InterviewcallPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/interviewCalls";

const InterviewCalls = () => {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState("");

  const [newInterview, setNewInterview] = useState({
    company: "", position: "", date: "", time: "", interviewer: "", 
    location: "Zoom", notes: "", calls: 1
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true); setError("");
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch");
        setInterviews(await res.json());
      } catch (err) {
        setError("Could not load interviews. Check JSON Server.");
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSorted = interviews
    .filter(i => 
      (i.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
       i.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (i.interviewer || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || i.status === filterStatus)
    )
    .sort((a, b) => sortBy === "date" ? new Date(a.date) - new Date(b.date) : 
                     sortBy === "company" ? a.company.localeCompare(b.company) : 0);

  const getStatusConfig = status => ({
    Confirmed: { bg: "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200/50", text: "text-white font-semibold text-sm drop-shadow-lg", icon: "✅" },
    Scheduled: { bg: "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-200/50", text: "text-white font-semibold text-sm drop-shadow-lg", icon: "⏰" },
    Pending: { bg: "bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-orange-200/50", text: "text-white font-semibold text-sm drop-shadow-lg", icon: "⏳" }
  }[status] || { bg: "bg-slate-300 shadow-md", text: "text-slate-900 font-semibold text-sm", icon: "⏰" });

  const handleAdd = async e => {
    e.preventDefault(); setIsLoading(true); setError("");
    const payload = { ...newInterview, status: "Scheduled", 
                     avatar: newInterview.company.slice(0, 2).toUpperCase(),
                     calls: Number(newInterview.calls) || 1 };
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save");
      const created = await res.json();
      setInterviews([created, ...interviews]);
      setNewInterview({ company: "", position: "", date: "", time: "", 
                       interviewer: "", location: "Zoom", notes: "", calls: 1 });
      setIsAddModalOpen(false);
    } catch (err) {
      setError("Could not save interview.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = dateStr => dateStr ? 
    new Date(dateStr).toLocaleDateString("en-US", { 
      weekday: "short", year: "numeric", month: "short", day: "numeric" 
    }) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
      
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-16 pb-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-indigo-200/50 px-4 py-2 mb-4 rounded-2xl shadow-lg">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-ping" />
              <span className="text-xs font-bold text-indigo-700 tracking-wide uppercase">Live Pipeline</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-emerald-800 bg-clip-text text-transparent mb-2 leading-tight">
              Interview Calls
            </h1>
            <p className="text-lg font-semibold text-slate-700 bg-white/80 px-6 py-3 rounded-2xl inline-block backdrop-blur-xl shadow-lg border border-slate-200/50">
              Professional tracking for your career pipeline
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Calls</span>
              <span className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {interviews.reduce((sum, i) => sum + (Number(i.calls) || 0), 0)}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-slate-200/50 px-6 py-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">📋</span>
              </div>
              <div>
                <span className="font-bold text-xl text-slate-900 block">
                  {filteredAndSorted.length}
                </span>
                <span className="text-xs font-medium text-slate-600 tracking-wide">Active Interviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 backdrop-blur-xl border-l-4 border-rose-400 text-rose-900 p-4 rounded-2xl shadow-xl mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center border">
                <span className="text-rose-500 text-sm">⚠️</span>
              </div>
              <span className="font-medium text-sm">{error}</span>
            </div>
            <div className="text-xs bg-white px-3 py-1 rounded-xl font-mono">{API_URL}</div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-8">
          <div className="relative group xl:col-span-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 group-focus-within:text-indigo-500 transition-all">🔍</span>
            <input
              className="w-full pl-12 pr-5 py-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-400 transition-all duration-300 text-lg placeholder-slate-400 font-medium"
              placeholder="Search companies, roles, interviewers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 xl:justify-end">
            <select 
              className="px-5 py-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl focus:ring-4 focus:ring-emerald-200/50 focus:border-emerald-400 transition-all duration-300 text-base font-medium cursor-pointer"
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Scheduled</option>
              <option>Confirmed</option>
              <option>Pending</option>
            </select>
            
            
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 focus:ring-4 focus:ring-emerald-300/50 transition-all duration-300"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500">➕</span>
            New Call
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Confirmed", count: interviews.filter(i => i.status === "Confirmed").length, color: "from-emerald-500 to-emerald-600", icon: "✅", shadow: "shadow-emerald-200/50" },
            { title: "Scheduled", count: interviews.filter(i => i.status === "Scheduled").length, color: "from-blue-500 to-blue-600", icon: "⏰", shadow: "shadow-blue-200/50" },
            { title: "Pending", count: interviews.filter(i => i.status === "Pending").length, color: "from-amber-500 to-orange-500", icon: "⏳", shadow: "shadow-orange-200/50" }
          ].map(({ title, count, color, icon, shadow }, i) => (
            <div key={i} className="group bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
              <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500 mb-6 mx-auto ${shadow}`}>
                <span className="text-2xl font-bold text-white drop-shadow-lg">{icon}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 text-center">{title}</p>
              <p className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent text-center">{count}</p>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white/95 backdrop-blur-xl rounded-4xl shadow-2xl border border-white/60 overflow-hidden">
          <div className="overflow-x-auto">
            {isPageLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-indigo-200/50 border-t-indigo-500 rounded-2xl animate-spin mb-6 shadow-xl" />
                <p className="text-xl font-semibold text-slate-700">Loading your interviews...</p>
                <p className="text-slate-600 mt-2 text-sm">Connecting to pipeline server</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50/80 via-indigo-50 to-emerald-50/80 backdrop-blur-xl">
                  <tr>
                    {["Company", "Position", "Date & Time", "Calls", "Status", "Actions"].map((header, i) => (
                      <th key={i} className={`px-6 py-5 text-left font-bold text-slate-800 text-sm uppercase tracking-wide ${(i === 5 ? 'text-right' : '')} ${i === 2 ? 'hidden lg:table-cell' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredAndSorted.map(interview => {
                    const statusConfig = getStatusConfig(interview.status);
                    return (
                      <tr key={interview.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-emerald-50/50 hover:shadow-lg transition-all duration-300 group hover:-translate-y-0.5">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg group-hover:scale-105 transition-all">
                              {interview.avatar || interview.company.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-lg text-slate-900 mb-1 group-hover:text-indigo-700">{interview.company}</div>
                              <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">{interview.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="font-semibold text-base text-slate-900 mb-1">{interview.position}</div>
                          <div className="text-sm text-slate-600 font-medium">{interview.interviewer || "Interviewer TBA"}</div>
                        </td>
                        <td className="px-6 py-6 text-slate-700 hidden lg:table-cell">
                          <div className="font-medium text-sm">{formatDate(interview.date)}</div>
                          <div className="text-base font-semibold text-slate-900">{interview.time}</div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-800 font-semibold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all">
                            📞 <span className="font-bold">{interview.calls || 1}</span> calls
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-xl mx-auto w-fit ${statusConfig.bg} ${statusConfig.text} hover:scale-105 hover:shadow-2xl transition-all duration-300`}>
                            <span className="text-lg">{statusConfig.icon}</span>
                            <span>{interview.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button 
                            onClick={() => { setSelectedInterview(interview); setIsViewModalOpen(true); }} 
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 focus:ring-4 focus:ring-indigo-300/50 transition-all duration-300"
                          >
                            <span className="text-lg group-hover:rotate-180 transition-transform">👁️</span>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredAndSorted.length === 0 && !isPageLoading && (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <div className="space-y-4">
                          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center text-4xl shadow-xl border">
                            🔍
                          </div>
                          <div className="space-y-2">
                            <p className="text-2xl font-bold text-slate-800">No interviews found</p>
                            <p className="text-slate-600 text-sm font-medium max-w-md mx-auto">
                              Adjust your search terms or filter criteria
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-white/98 backdrop-blur-2xl rounded-4xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-3xl border border-white/70">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  ➕ New Interview
                </h2>
                <p className="text-lg font-semibold text-slate-700">Add to your pipeline</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all hover:scale-110">
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">🏢 Company</label>
                  <input required className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all shadow-sm text-lg font-medium" placeholder="Company name" value={newInterview.company} onChange={e => setNewInterview({...newInterview, company: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">💼 Position</label>
                  <input required className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all shadow-sm text-lg font-medium" placeholder="Job title" value={newInterview.position} onChange={e => setNewInterview({...newInterview, position: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">📅 Date</label>
                  <input required type="date" className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm" value={newInterview.date} onChange={e => setNewInterview({...newInterview, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">🕒 Time</label>
                  <input required type="time" className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm" value={newInterview.time} onChange={e => setNewInterview({...newInterview, time: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">📞 Calls</label>
                  <input type="number" min="1" className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all shadow-sm" value={newInterview.calls} onChange={e => setNewInterview({...newInterview, calls: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">👤 Interviewer</label>
                <input className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all shadow-sm" placeholder="Name" value={newInterview.interviewer} onChange={e => setNewInterview({...newInterview, interviewer: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">📍 Location</label>
                <select className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all shadow-sm" value={newInterview.location} onChange={e => setNewInterview({...newInterview, location: e.target.value})}>
                  <option>Zoom</option>
                  <option>Google Meet</option>
                  <option>Microsoft Teams</option>
                  <option>In-person - HQ</option>
                  <option>In-person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">📝 Notes</label>
                <textarea rows={4} className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all shadow-sm resize-vertical" placeholder="Preparation notes, questions to ask..." value={newInterview.notes} onChange={e => setNewInterview({...newInterview, notes: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:shadow-xl focus:ring-4 focus:ring-slate-200 transition-all duration-300">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Interview"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-white/98 backdrop-blur-2xl rounded-4xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-3xl border border-white/70">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-xl ${getStatusConfig(selectedInterview.status).bg} ${getStatusConfig(selectedInterview.status).text}`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  {selectedInterview.status}
                </div>
                <h2 className="text-4xl font-black text-slate-900 mt-4 mb-2">{selectedInterview.company}</h2>
                <p className="text-2xl font-semibold text-slate-700">{selectedInterview.position}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-110">
                <span className="text-2xl">✕</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl border-l-4 border-indigo-500">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl text-white">📅</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Date & Time</div>
                    <div className="text-2xl font-bold text-slate-900">{formatDate(selectedInterview.date)} • {selectedInterview.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border-l-4 border-emerald-500">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl text-white">📍</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Location</div>
                    <div className="text-xl font-bold text-slate-900">{selectedInterview.location}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl border-l-4 border-purple-500">
                  <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl text-white">👤</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Interviewer</div>
                    <div className="text-xl font-bold text-slate-900">{selectedInterview.interviewer || "Not assigned"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border-l-4 border-emerald-500">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl text-white">📞</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Total Calls</div>
                    <div className="text-xl font-bold text-slate-900">{selectedInterview.calls || 1} calls</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">📝 Preparation Notes</h3>
              <div className="p-8 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-3xl border-l-4 border-indigo-500 shadow-inner">
                <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedInterview.notes || "No preparation notes added yet."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button onClick={() => setIsViewModalOpen(false)} className="flex-1 px-10 py-4 bg-slate-100 text-slate-800 font-semibold rounded-3xl hover:bg-slate-200 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                <span>✕</span>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCalls;
