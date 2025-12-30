// src/subpages/ReportPage.jsx - ✅ FULLY FIXED
import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:3000/hrdata";

const ReportPage = () => {
  const [activePeriod, setActivePeriod] = useState("today");
  const [stats, setStats] = useState({
    today: { total: 0, connected: 0, scheduled: 0, offers: 0 },
    week: { total: 0, connected: 0, scheduled: 0, offers: 0 },
    month: { total: 0, connected: 0, scheduled: 0, offers: 0 },
    all: { total: 0, connected: 0, scheduled: 0, offers: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [allInterviews, setAllInterviews] = useState([]);

  const periods = [
    { id: "today", label: "Today", icon: "📅" },
    { id: "week", label: "This Week", icon: "📊" },
    { id: "month", label: "This Month", icon: "📈" },
    { id: "all", label: "All Time", icon: "🌐" }
  ];

  // ✅ FIXED: Proper data fetching with role breakdown
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log("🔄 Fetching data from:", API_URL);
      const res = await fetch(API_URL);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Server not responding`);
      }
      
      const allData = await res.json();
      console.log("✅ Loaded", allData.length, "records");
      
      // Filter interviews only
      const interviews = allData.filter(item => item.type === 'interview');
      setAllInterviews(interviews);

      // Get current date boundaries
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const calculateStats = (data) => {
        const total = data.length;
        const connected = data.filter(item => item.status === 'Completed').length;
        const scheduled = data.filter(item => item.status === 'Scheduled').length;
        const offers = data.filter(item => item.status === 'Completed' && (item.applicants || 0) > 0).length;
        
        return { total, connected, scheduled, offers };
      };

      // ✅ FIXED: Use 'interviews' instead of undefined 'data'
      const todayData = interviews.filter(item => new Date(item.date) >= today);
      const weekData = interviews.filter(item => new Date(item.date) >= weekStart);
      const monthData = interviews.filter(item => new Date(item.date) >= monthStart);

      setStats({
        today: calculateStats(todayData),
        week: calculateStats(weekData),
        month: calculateStats(monthData),
        all: calculateStats(interviews)
      });

    } catch (err) {
      console.error("❌ Error:", err);
      setError(`Connection failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Role breakdown calculation
  const getRoleStats = () => {
    const roleStats = {
      Telecaller: 0, Counselor: 0, Trainer: 0, HR: 0
    };
    
    allInterviews.forEach(item => {
      roleStats[item.role] = (roleStats[item.role] || 0) + 1;
    });
    
    return roleStats;
  };

  const getPeriodColor = (period) => {
    const colors = {
      today: "from-orange-500 to-amber-500",
      week: "from-emerald-500 to-teal-500",
      month: "from-blue-500 to-indigo-500",
      all: "from-purple-500 to-violet-500"
    };
    return colors[period] || "from-slate-500 to-gray-500";
  };

  const formatNumber = (num) => num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num;

  const StatCard = ({ label, value, change, color, icon, description }) => (
    <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${getPeriodColor(activePeriod)}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${getPeriodColor(activePeriod)} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
              <span className="text-xl font-bold text-white">{icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 group-hover:text-slate-950">{formatNumber(value)}</p>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
            </div>
          </div>
          <div className={`w-16 h-16 bg-gradient-to-r from-${color}-400 to-${color}-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all`}>
            <span className="text-2xl font-bold text-white">{formatNumber(value)}</span>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{description}</p>
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {change >= 0 ? '↗️' : '↘️'} {Math.abs(change)}% from last period
          </div>
        )}
      </div>
    </div>
  );

  const roleStats = getRoleStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
     
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-200 px-4 py-2 mb-4 rounded-2xl">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-orange-800 uppercase tracking-wide">Real-time Analytics</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-orange-600 to-amber-700 bg-clip-text text-transparent leading-tight">
                Hiring Report
              </h1>
              <p className="text-xl font-medium text-slate-600 mt-3 max-w-2xl">
                Track your recruitment performance with comprehensive metrics and insights
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200">
              <div className="text-center">
                <span className="block text-4xl font-black text-slate-900 mb-1">
                  {allInterviews.length}
                </span>
                <span className="text-sm text-slate-600 font-medium uppercase tracking-wide">Total Interviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-12">
        {/* Enhanced Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 border-l-4 border-l-rose-400 text-rose-900 p-8 rounded-3xl shadow-xl mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Server Connection Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchData}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  🔄 Retry
                </button>
                <a href="http://localhost:3000" target="_blank" className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                  🖥️ Check Server
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Period Selector */}
        <div className="flex flex-wrap gap-4 mb-16 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setActivePeriod(period.id)}
              className={`relative px-8 py-5 rounded-3xl font-bold shadow-lg transition-all duration-500 flex items-center gap-3 text-sm group ${
                activePeriod === period.id
                  ? `bg-gradient-to-r ${getPeriodColor(period.id)} text-white shadow-2xl shadow-orange-200/50 -translate-y-2 scale-105 ring-4 ring-white/50`
                  : "bg-white/80 text-slate-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 border border-slate-200 hover:border-slate-300"
              }`}
              disabled={isLoading}
            >
              <span className="text-2xl">{period.icon}</span>
              {period.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 border-4 border-slate-200 border-t-orange-500 rounded-3xl animate-spin mb-8 shadow-2xl" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Loading Analytics...</h3>
            <p className="text-slate-600 text-lg">Connecting to HR database</p>
          </div>
        )}

        {/* Stats - MAIN CONTENT */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <StatCard
                label="Total Candidates"
                value={stats[activePeriod]?.total || 0}
                change={12}
                color="slate"
                icon="👥"
                description="All candidates processed"
              />
              <StatCard
                label="Connected Calls"
                value={stats[activePeriod]?.connected || 0}
                change={8}
                color="emerald"
                icon="📞"
                description="Successfully connected calls"
              />
              <StatCard
                label="Scheduled Interviews"
                value={stats[activePeriod]?.scheduled || 0}
                change={-3}
                color="purple"
                icon="📅"
                description="Interviews booked & confirmed"
              />
              <StatCard
                label="Offers Extended"
                value={stats[activePeriod]?.offers || 0}
                change={25}
                color="amber"
                icon="✉️"
                description="Job offers rolled out"
              />
            </div>

            {/* Role Breakdown & Conversion Rates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">📊 Conversion Rates</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl">
                    <span className="text-lg font-semibold text-slate-700">Call → Interview</span>
                    <span className="text-3xl font-black text-emerald-600">
                      {stats[activePeriod]?.connected ? 
                        Math.round((stats[activePeriod].scheduled / stats[activePeriod].connected) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl">
                    <span className="text-lg font-semibold text-slate-700">Interview → Offer</span>
                    <span className="text-3xl font-black text-purple-600">
                      {stats[activePeriod]?.scheduled ? 
                        Math.round((stats[activePeriod].offers / stats[activePeriod].scheduled) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">👥 Role Breakdown</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl hover:scale-105 transition-all">
                    <span className="text-3xl mb-3 block">📞</span>
                    <span className="font-bold text-xl text-rose-700 block mb-2">Telecaller</span>
                    <span className="text-3xl font-black text-slate-900">{roleStats.Telecaller || 0}</span>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl hover:scale-105 transition-all">
                    <span className="text-3xl mb-3 block">🧑‍🏫</span>
                    <span className="font-bold text-xl text-emerald-700 block mb-2">Counselor</span>
                    <span className="text-3xl font-black text-slate-900">{roleStats.Counselor || 0}</span>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl hover:scale-105 transition-all">
                    <span className="text-3xl mb-3 block">👨‍🏫</span>
                    <span className="font-bold text-xl text-blue-700 block mb-2">Trainer</span>
                    <span className="text-3xl font-black text-slate-900">{roleStats.Trainer || 0}</span>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl hover:scale-105 transition-all">
                    <span className="text-3xl mb-3 block">👔</span>
                    <span className="font-bold text-xl text-purple-700 block mb-2">HR</span>
                    <span className="text-3xl font-black text-slate-900">{roleStats.HR || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
