// src/subpages/ReportPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/hrdata";

const ReportPage = () => {
  const [activePeriod, setActivePeriod] = useState("today");
  const [stats, setStats] = useState({
    today: { total: 0, connected: 0, scheduled: 0, offers: 0 },
    week: { total: 0, connected: 0, scheduled: 0, offers: 0 },
    month: { total: 0, connected: 0, scheduled: 0, offers: 0 },
    all: { total: 0, connected: 0, scheduled: 0, offers: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interviews, setInterviews] = useState([]);

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
      const interviewData = allData.filter(item => item.type === 'interview');
      setInterviews(interviewData);
      calculateStats(interviewData);
    } catch (err) {
      setError("Could not load data. Check JSON Server at " + API_URL);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const calculate = (filteredData) => ({
      total: filteredData.length,
      connected: filteredData.filter(item => item.status === 'Completed').length,
      scheduled: filteredData.filter(item => item.status === 'Scheduled').length,
      offers: filteredData.filter(item => item.status === 'Completed' && (item.applicants || 0) > 0).length
    });

    setStats({
      today: calculate(data.filter(item => new Date(item.date) >= today)),
      week: calculate(data.filter(item => new Date(item.date) >= weekStart)),
      month: calculate(data.filter(item => new Date(item.date) >= monthStart)),
      all: calculate(data)
    });
  };

  const periods = [
    { id: "today", label: "Today", icon: "📅" },
    { id: "week", label: "This Week", icon: "📊" },
    { id: "month", label: "This Month", icon: "📈" },
    { id: "all", label: "All Time", icon: "🌐" }
  ];

  const getPeriodColor = (period) => ({
    today: "bg-gradient-to-r from-orange-500 to-amber-500",
    week: "bg-gradient-to-r from-emerald-500 to-teal-500",
    month: "bg-gradient-to-r from-blue-500 to-indigo-500",
    all: "bg-gradient-to-r from-purple-500 to-violet-500"
  }[period] || "bg-gradient-to-r from-slate-500 to-gray-500");

  const roleStats = {
    Telecaller: interviews.filter(item => item.role === 'Telecaller').length,
    Counselor: interviews.filter(item => item.role === 'Counselor').length,
    Trainer: interviews.filter(item => item.role === 'Trainer').length,
    HR: interviews.filter(item => item.role === 'HR').length
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

  const RoleCard = ({ role, count, icon, color }) => (
    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <span className="text-2xl mb-2 block">{icon}</span>
      <span className="font-bold text-sm text-slate-900 block mb-1">{role}</span>
      <span className="text-xl font-bold text-slate-900">{count}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 mb-3 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 uppercase">Analytics Report</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Hiring Report</h1>
              <p className="text-sm text-slate-600 mt-1">Track recruitment performance with metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <StatsCard title="Total Interviews" value={interviews.length} icon="📊" color="blue" />
              <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Period Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setActivePeriod(period.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activePeriod === period.id
                    ? `${getPeriodColor(period.id)} text-white shadow`
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{period.icon}</span>
                {period.label}
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

        {/* Loading */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-700">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatsCard title="Total Candidates" value={stats[activePeriod]?.total || 0} icon="👥" color="slate" />
              <StatsCard title="Connected Calls" value={stats[activePeriod]?.connected || 0} icon="📞" color="emerald" />
              <StatsCard title="Scheduled" value={stats[activePeriod]?.scheduled || 0} icon="📅" color="purple" />
              <StatsCard title="Offers" value={stats[activePeriod]?.offers || 0} icon="✉️" color="amber" />
            </div>

            {/* Conversion Rates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">📊 Conversion Rates</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <span className="font-medium text-slate-700">Call → Interview</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {stats[activePeriod]?.connected ? 
                        Math.round((stats[activePeriod].scheduled / stats[activePeriod].connected) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium text-slate-700">Interview → Offer</span>
                    <span className="text-xl font-bold text-purple-600">
                      {stats[activePeriod]?.scheduled ? 
                        Math.round((stats[activePeriod].offers / stats[activePeriod].scheduled) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">👥 Role Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <RoleCard role="Telecaller" count={roleStats.Telecaller} icon="📞" color="rose" />
                  <RoleCard role="Counselor" count={roleStats.Counselor} icon="🧑‍🏫" color="emerald" />
                  <RoleCard role="Trainer" count={roleStats.Trainer} icon="👨‍🏫" color="blue" />
                  <RoleCard role="HR" count={roleStats.HR} icon="👔" color="purple" />
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Period Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 text-xs font-semibold text-slate-700 uppercase">Period</th>
                      <th className="text-left py-3 text-xs font-semibold text-slate-700 uppercase">Total</th>
                      <th className="text-left py-3 text-xs font-semibold text-slate-700 uppercase">Connected</th>
                      <th className="text-left py-3 text-xs font-semibold text-slate-700 uppercase">Scheduled</th>
                      <th className="text-left py-3 text-xs font-semibold text-slate-700 uppercase">Offers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period.id} className={`border-b border-slate-100 ${activePeriod === period.id ? 'bg-blue-50' : ''}`}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span>{period.icon}</span>
                            <span className="text-sm font-medium text-slate-900">{period.label}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-slate-900">{stats[period.id]?.total || 0}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-emerald-600">{stats[period.id]?.connected || 0}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-purple-600">{stats[period.id]?.scheduled || 0}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-amber-600">{stats[period.id]?.offers || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;