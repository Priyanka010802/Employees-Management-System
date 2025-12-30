// src/subpages/OfferPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/hrdata";

const OfferPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({ view: false });
  const [currentOffer, setCurrentOffer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch data");
      const allData = await res.json();
      setData(allData);
    } catch (err) {
      setError("Could not load data. Check JSON Server at " + API_URL);
    } finally {
      setLoading(false);
    }
  };

  const offers = data
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

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || offer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: offers.length,
    applicants: offers.reduce((sum, o) => sum + o.applicants, 0),
    accepted: offers.reduce((sum, o) => sum + o.accepted, 0),
    pending: offers.reduce((sum, o) => sum + o.pending, 0),
    rejected: offers.reduce((sum, o) => sum + o.rejected, 0)
  };

  const getStatusColor = (status) => ({
    active: { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "🚀" },
    closed: { bg: "bg-slate-100 text-slate-800 border-slate-200", icon: "✅" }
  }[status] || { bg: "bg-slate-100 text-slate-800 border-slate-200", icon: "📋" });

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const openModal = (type, offer = null) => {
    if (offer) setCurrentOffer(offer);
    setModal({ view: false, [type]: true });
  };

  const closeModal = () => {
    setModal({ view: false });
    setCurrentOffer(null);
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

  const OfferCard = ({ offer }) => {
    const statusConfig = getStatusColor(offer.status);
    const acceptanceRate = offer.applicants > 0 ? ((offer.accepted / offer.applicants) * 100).toFixed(0) : 0;

    return (
      <div className="group relative bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 cursor-pointer" onClick={() => openModal('view', offer)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-xs font-bold text-white">{offer.avatar}</span>
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">{offer.company}</div>
              <div className="text-xs text-slate-500">{offer.position}</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.bg}`}>
            {statusConfig.icon} {offer.status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700">{offer.title}</h3>
        <div className="text-xs text-slate-600 mb-3">👤 {offer.candidateName}</div>

        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">💰 {offer.salary}</span>
          <span className="px-2 py-1 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg">📅 {formatDate(offer.date)}</span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">Acceptance</span>
            <span className="font-bold text-emerald-600">{acceptanceRate}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: `${offer.progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">
          <div>
            <div className="font-bold text-slate-900">{offer.applicants}</div>
            <div className="text-xs text-slate-500">Apps</div>
          </div>
          <div>
            <div className="font-bold text-emerald-600">{offer.accepted}</div>
            <div className="text-xs text-slate-500">Acc</div>
          </div>
          <div>
            <div className="font-bold text-amber-600">{offer.pending}</div>
            <div className="text-xs text-slate-500">Pend</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 mb-3 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 uppercase">Job Offers</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Offer </h1>
              <p className="text-sm text-slate-600 mt-1">Auto-generated from completed interviews</p>
            </div>
            <button onClick={fetchData} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              🔄 Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Offers" value={stats.total} icon="📋" color="emerald" />
            <StatsCard title="Applicants" value={stats.applicants} icon="👥" color="blue" />
            <StatsCard title="Accepted" value={stats.accepted} icon="✅" color="green" />
            <StatsCard title="Pending" value={stats.pending} icon="⏳" color="amber" />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                placeholder="Search candidates, positions, companies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select 
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
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

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700">Loading offers...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                  📋
                </div>
                <p className="text-base font-medium text-slate-700">No offers available</p>
                <p className="text-sm text-slate-500">Complete interviews with applicants to generate offers</p>
              </div>
            </div>
          ) : (
            filteredOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
          )}
        </div>

        {/* View Modal */}
        {modal.view && currentOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{currentOffer.company}</h2>
                  <p className="text-xs text-slate-600">Offer Details</p>
                </div>
                <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
                  <span className="text-lg">✕</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center p-4 bg-emerald-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow mb-3">
                    <span className="text-xl font-bold text-white">{currentOffer.avatar}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{currentOffer.title}</h3>
                  <p className="text-sm text-slate-600">{currentOffer.position}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Candidate</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-500">Name:</span> <span className="font-medium">{currentOffer.candidateName}</span></div>
                      <div><span className="text-slate-500">Contact:</span> <span className="font-medium">{currentOffer.contact || 'N/A'}</span></div>
                      <div><span className="text-slate-500">Email:</span> <span className="font-medium">{currentOffer.email || 'N/A'}</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Offer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-500">Salary:</span> <span className="font-medium">{currentOffer.salary}</span></div>
                      <div><span className="text-slate-500">Interview:</span> <span className="font-medium">{formatDate(currentOffer.date)} {currentOffer.time}</span></div>
                      <div><span className="text-slate-500">Deadline:</span> <span className="font-medium">{formatDate(currentOffer.deadline)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Acceptance Stats</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Rate</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {currentOffer.applicants > 0 ? ((currentOffer.accepted / currentOffer.applicants) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: `${currentOffer.progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-xl font-bold text-slate-900">{currentOffer.applicants}</div>
                    <div className="text-xs text-slate-500">Applicants</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-xl font-bold text-emerald-600">{currentOffer.accepted}</div>
                    <div className="text-xs text-slate-500">Accepted</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-xl font-bold text-amber-600">{currentOffer.pending}</div>
                    <div className="text-xs text-slate-500">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferPage;