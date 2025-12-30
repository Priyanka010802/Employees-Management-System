// src/page/AdminDashboard.jsx - COMPLETE with ALL 8 Pages Connected
import React from "react";

const AdminDashboard = ({
  adminEmail,
  onLogout,
  onNavigateToInterviewCalls,
  onNavigateToCompanyPage,
  onNavigateToStudentPage,
  onNavigateToJobPortal,
  onNavigateToSchedule,
  onNavigateToOffers,
  onNavigateToReports
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* top band */}
      <div className="fixed inset-x-0 top-0 h-56 bg-gradient-to-b from-sky-100 via-emerald-50/70 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Top bar */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sky-700">
              InnovaHire Admin
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
              Placement & Recruitment
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Centralized control for placement drives, recruitment pipeline, and
              hiring analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{adminEmail}</span>
              <span>Admin account</span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all"
            >
              <span>Logout</span>
              <span>↗</span>
            </button>
          </div>
        </header>

        {/* Main content - Two column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* PLACEMENT DIV - 3 BUTTONS */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-100 shadow-lg p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Placement Drives
                </p>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Campus Recruitment
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Coordinate interviews, track student participation and company
                  engagements.
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg text-white shadow-md">
                🎓
              </div>
            </div>

            {/* Three clickable buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ✅ INTERVIEW CALLS BUTTON */}
              <button 
                onClick={onNavigateToInterviewCalls}
                className="group relative rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 hover:shadow-xl hover:shadow-emerald-200/70 hover:-translate-y-2 transition-all duration-400 text-left focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-500" />
                <div className="relative flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-lg text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    📞
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-emerald-800 text-sm mb-1 group-hover:text-emerald-900 transition-colors">
                      Interview Calls
                    </p>
                    <p className="text-xs text-emerald-700 line-clamp-2 leading-tight group-hover:text-emerald-800">
                      Schedule and manage interview slots
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 w-20 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500 translate-y-2 group-hover:translate-y-0" />
              </button>

              {/* ✅ VIEW STUDENTS BUTTON */}
              <button 
                onClick={onNavigateToStudentPage}
                className="group relative rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-sky-100 p-5 hover:shadow-xl hover:shadow-sky-200/70 hover:-translate-y-2 transition-all duration-400 text-left focus:outline-none focus:ring-4 focus:ring-sky-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-600 opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-500" />
                <div className="relative flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center text-lg text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    👨‍🎓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sky-800 text-sm mb-1 group-hover:text-sky-900 transition-colors">
                      View Students
                    </p>
                    <p className="text-xs text-sky-700 line-clamp-2 leading-tight group-hover:text-sky-800">
                      Track registered students & eligibility
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 w-20 h-1 bg-gradient-to-r from-sky-400 to-sky-500 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500 translate-y-2 group-hover:translate-y-0" />
              </button>

              {/* ✅ VIEW COMPANIES BUTTON */}
              <button 
                onClick={onNavigateToCompanyPage}
                className="group relative rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 hover:shadow-xl hover:shadow-indigo-200/70 hover:-translate-y-2 transition-all duration-400 text-left focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-500" />
                <div className="relative flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-lg text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-indigo-800 text-sm mb-1 group-hover:text-indigo-900 transition-colors">
                      View Companies
                    </p>
                    <p className="text-xs text-indigo-700 line-clamp-2 leading-tight group-hover:text-indigo-800">
                      Monitor companies & hiring needs
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 w-20 h-1 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500 translate-y-2 group-hover:translate-y-0" />
              </button>
            </div>
          </div>

          {/* RECRUITMENT DIV - 4 BUTTONS */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-100 shadow-lg p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Recruitments
                </p>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Job Pipeline
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manage job postings, interviews, offers and reporting.
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-lg text-white shadow-md">
                💼
              </div>
            </div>

            {/* Four clickable buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ✅ JOB POSTS BUTTON */}
              <button 
                onClick={onNavigateToJobPortal}
                className="group relative rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-sky-100 p-6 hover:shadow-xl hover:shadow-sky-200/70 hover:-translate-y-2 transition-all duration-400 text-left focus:outline-none focus:ring-4 focus:ring-sky-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-600 opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-500" />
                <div className="relative flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-sky-500 flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    📢
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sky-800 text-base mb-2 group-hover:text-sky-900 transition-colors">
                      Job Posts
                    </p>
                    <p className="text-sm text-sky-700 leading-tight group-hover:text-sky-800">
                      Create & manage openings
                    </p>
                  </div>
                </div>
              </button>

              {/* ✅ SCHEDULED INTERVIEWS BUTTON */}
              <button 
                onClick={onNavigateToSchedule}
                className="group relative rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100 p-6 hover:shadow-xl hover:shadow-purple-200/70 hover:-translate-y-2 transition-all duration-400 text-left focus:outline-none focus:ring-4 focus:ring-purple-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-500" />
                <div className="relative flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    🗓️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-purple-800 text-base mb-2 group-hover:text-purple-900 transition-colors">
                      Scheduled Interviews
                    </p>
                    <p className="text-sm text-purple-700 leading-tight group-hover:text-purple-800">
                      View & reschedule
                    </p>
                  </div>
                </div>
              </button>

              {/* ✅ OFFERS BUTTON */}
              <button 
                onClick={onNavigateToOffers}
                className="group relative rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 hover:shadow-xl hover:shadow-emerald-200/70 hover:-translate-y-2 transition-all duration-400 text-left focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-500" />
                <div className="relative flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    💰
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-emerald-800 text-base mb-2 group-hover:text-emerald-900 transition-colors">
                      Offers
                    </p>
                    <p className="text-sm text-emerald-700 leading-tight group-hover:text-emerald-800">
                      Track & approve offers
                    </p>
                  </div>
                </div>
              </button>

              {/* ✅ REPORTS BUTTON */}
              <button 
                onClick={onNavigateToReports}
                className="group relative rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100 p-6 hover:shadow-xl hover:shadow-amber-200/70 hover:-translate-y-2 transition-all duration-400 text-left focus:outline-none focus:ring-4 focus:ring-amber-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 opacity-0 group-hover:opacity-15 rounded-2xl transition-all duration-500" />
                <div className="relative flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    📊
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-amber-800 text-base mb-2 group-hover:text-amber-900 transition-colors">
                      Reports
                    </p>
                    <p className="text-sm text-amber-700 leading-tight group-hover:text-amber-800">
                      Hiring analytics
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
