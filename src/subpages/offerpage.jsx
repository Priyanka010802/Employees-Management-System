// src/subpages/OfferPage.jsx - ✅ COMPACT + VIEW MODAL
import React, { useState, useEffect, useCallback, useMemo } from "react";

const API_URL = "http://localhost:3000/hrdata";

const OfferPage = () => {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Dynamic offers from completed interviews
  const offers = useMemo(() => {
    return allData
      .filter(item => item.type === 'interview' && item.status === 'Completed' && (item.applicants || 0) > 0)
      .map(interview => ({
        id: `offer-${interview.id}`,
        interviewId: interview.id,
        title: `${interview.role} - ${interview.title}`,
        position: interview.role,
        candidateName: interview.candidateName,
        applicants: interview.applicants || 1,
        accepted: Math.min(3, Math.floor(interview.applicants * 0.3)),
        pending: Math.min(interview.applicants - Math.floor(interview.applicants * 0.3), Math.floor(interview.applicants * 0.5)),
        rejected: Math.max(0, interview.applicants - Math.floor(interview.applicants * 0.3) - Math.floor(interview.applicants * 0.5)),
        status: new Date(interview.date) > new Date() ? "active" : "closed",
        company: `${interview.role.toUpperCase()} Recruitment`,
        salary: {
          Telecaller: "$35K - $45K",
          Counselor: "$38K - $48K", 
          Trainer: "$50K - $65K",
          HR: "$45K - $55K"
        }[interview.role] || "$40K - $55K",
        deadline: new Date(new Date(interview.date).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date: interview.date,
        time: interview.time,
        contact: interview.contact,
        email: interview.email,
        avatar: interview.role.substring(0, 2).toUpperCase(),
        progress: Math.min(95, Math.floor((interview.applicants * 25)))
      }));
  }, [allData]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      const data = await res.json();
      setAllData(data);
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || offer.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const totalApplicants = offers.reduce((sum, o) => sum + o.applicants, 0);
    const totalAccepted = offers.reduce((sum, o) => sum + o.accepted, 0);
    const totalPending = offers.reduce((sum, o) => sum + o.pending, 0);
    const totalRejected = offers.reduce((sum, o) => sum + o.rejected, 0);
    return { totalApplicants, totalAccepted, totalPending, totalRejected };
  }, [offers]);

  const roleBreakdown = useMemo(() => {
    const roles = {};
    offers.forEach(offer => {
      roles[offer.position] = (roles[offer.position] || 0) + 1;
    });
    return roles;
  }, [offers]);

  const tabs = [
    { id: "all", label: "All Offers", count: offers.length },
    { id: "active", label: "Active", count: offers.filter(o => o.status === "active").length },
    { id: "closed", label: "Closed", count: offers.filter(o => o.status === "closed").length }
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case "active": return { bg: "bg-gradient-to-r from-emerald-400 to-teal-500", text: "text-white", icon: "🚀" };
      case "closed": return { bg: "bg-gradient-to-r from-slate-400 to-slate-500", text: "text-white", icon: "✅" };
      default: return { bg: "bg-slate-200", text: "text-slate-800", icon: "📋" };
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const openViewModal = (offer) => {
    setSelectedOffer(offer);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOffer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/10 p-4 sm:p-6 lg:p-8">
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl shadow-xl border border-emerald-100/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 border border-emerald-200/50 px-3 py-1.5 mb-2 rounded-xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Live Offer Tracking</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                Job Offers Pipeline
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Auto-generated from completed interviews (Applicants > 0)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/30 backdrop-blur-sm">
              <div>
                <div className="text-xl font-black text-emerald-700">{offers.length}</div>
                <span className="text-xs text-slate-600 uppercase tracking-wide">Offers</span>
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">{stats.totalApplicants}</div>
                <span className="text-xs text-slate-600 uppercase tracking-wide">Applicants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-2xl mb-6 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-rose-100 rounded-lg flex items-center justify-center">
                <span className="text-rose-500 text-sm">⚠️</span>
              </div>
              <span className="text-sm font-medium text-rose-900">{error}</span>
            </div>
            <button 
              onClick={fetchData} 
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all"
            >
              🔄 Retry
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all text-xs flex items-center gap-1.5 group ${
                  filterStatus === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg -translate-y-0.5 scale-105"
                    : "bg-white/80 border border-slate-200 text-slate-700 hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-300"
                }`}
              >
                <span className="text-lg">{getStatusConfig(tab.id).icon}</span>
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterStatus === tab.id ? "bg-white/30" : "bg-slate-200"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm transition-all backdrop-blur-sm"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="group bg-white/90 p-4 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 text-center transition-all backdrop-blur-sm">
              <div className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-1">
                {stats.totalApplicants}
              </div>
              <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">Applicants</p>
            </div>
            <div className="group bg-white/90 p-4 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 text-center transition-all backdrop-blur-sm">
              <div className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-1">
                {stats.totalAccepted}
              </div>
              <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">Accepted</p>
            </div>
            <div className="group bg-white/90 p-4 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 text-center transition-all backdrop-blur-sm">
              <div className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-1">
                {stats.totalPending}
              </div>
              <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">Pending</p>
            </div>
            <div className="group bg-white/90 p-4 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 text-center transition-all backdrop-blur-sm">
              <div className="text-2xl font-black bg-gradient-to-r from-slate-500 to-slate-600 bg-clip-text text-transparent mb-1">
                {stats.totalRejected}
              </div>
              <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">Rejected</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-3 border-slate-200 border-t-emerald-500 rounded-2xl animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Loading offers...</h3>
            <p className="text-sm text-slate-600">Processing completed interviews</p>
          </div>
        )}

        {/* Offers Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
              const statusConfig = getStatusConfig(offer.status);
              const acceptanceRate = offer.applicants > 0 ? ((offer.accepted / offer.applicants) * 100).toFixed(0) : 0;
              return (
                <div 
                  key={offer.id} 
                  className="group relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-200 transition-all duration-300 h-full flex flex-col cursor-pointer backdrop-blur-sm"
                  onClick={() => openViewModal(offer)}
                >
                  {/* Status Badge */}
                  <div className={`absolute -top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon}
                  </div>

                  {/* Avatar & Company */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 ${statusConfig.bg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 font-bold text-sm text-white transition-all`}>
                      {offer.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 line-clamp-1 mb-1">{offer.company}</h3>
                      <p className="text-xs text-slate-500">{offer.position}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-3 group-hover:text-slate-950">{offer.title}</h2>

                  {/* Candidate */}
                  <div className="text-xs text-slate-600 mb-3 line-clamp-1">
                    👤 {offer.candidateName}
                  </div>

                  {/* Salary & Date */}
                  <div className="flex items-center gap-2 mb-4 text-xs">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                      💰 {offer.salary}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                      📅 {formatDate(offer.date)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Acceptance</span>
                      <span className="font-bold text-emerald-600">{acceptanceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-xl h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-xl shadow-sm transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${offer.progress}%` }}
                      >
                        <span className="text-xs font-bold text-white">{offer.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-200/50 pt-3">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{offer.applicants}</div>
                      <div className="text-xs text-slate-500">Apps</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-600">{offer.accepted}</div>
                      <div className="text-xs text-slate-500">Acc</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-600">{offer.pending}</div>
                      <div className="text-xs text-slate-500">Pend</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredOffers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No offers available</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-sm">
              Complete interviews with applicants to generate job offers automatically
            </p>
            <button 
              onClick={fetchData}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
            >
              🔄 Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {isViewModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedOffer.company}</h2>
                  <p className="text-sm text-slate-600">{selectedOffer.position}</p>
                </div>
                <button 
                  onClick={closeViewModal}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Candidate Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide">Candidate</h3>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{selectedOffer.candidateName}</p>
                    <p className="text-sm text-slate-600">{selectedOffer.position}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide">Contact</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">📞</span> {selectedOffer.contact || 'N/A'}</p>
                    <p><span className="font-medium">📧</span> {selectedOffer.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Offer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">💰 Salary:</span> {selectedOffer.salary}</div>
                    <div><span className="font-medium">📅 Interview:</span> {formatDate(selectedOffer.date)} {selectedOffer.time}</div>
                    <div><span className="font-medium">⏰ Deadline:</span> {formatDate(selectedOffer.deadline)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Acceptance Rate</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {selectedOffer.applicants > 0 ? ((selectedOffer.accepted / selectedOffer.applicants) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-xl h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-4 rounded-xl"
                        style={{ width: `${selectedOffer.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Pipeline Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-slate-900">{selectedOffer.applicants}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Applicants</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-600">{selectedOffer.accepted}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Accepted</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-600">{selectedOffer.pending}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Modal Overlay */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={closeViewModal} />
      )}
    </div>
  );
};

export default OfferPage;
