// src/page/Home.jsx
import React from "react";

const Home = ({ onHRClick, onEmployeeClick, onAdminClick }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {/* soft top glow band */}
      <div className="fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-100 via-emerald-50/70 to-transparent pointer-events-none -z-10" />

      <div className="max-w-5xl w-full px-4">
        <div className="bg-white/90 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] rounded-3xl border border-slate-200 px-6 py-8 md:px-10 md:py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700">
                  HR & Talent Platform
                </span>
              </div>

              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Welcome to{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                    InnovaHire
                  </span>
                  <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-emerald-200/70 blur-[3px]" />
                </span>
              </h1>

              <p className="mt-2 text-sm md:text-base text-slate-500 max-w-xl">
                A modern workspace where HR leaders, employees and hiring teams
                collaborate to manage people, attendance and recruitment with ease.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="hidden md:inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Secure cloud • Role‑based access • Real‑time data</span>
              </span>
            </div>
          </div>

          {/* Portals grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* HR Portal */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-2xl transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(79,70,229,0.65)]">
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="relative p-6 md:p-7 flex flex-col h-full">
                <div className="mb-4">
                  <h2 className="text-xl md:text-2xl font-bold mb-1">
                    👨‍💼 HR Portal
                  </h2>
                  <p className="text-indigo-100 text-xs md:text-sm">
                    Central hub for workforce, policies and insights.
                  </p>
                </div>
                <ul className="mb-5 space-y-1.5 text-[11px] md:text-xs text-indigo-100/90">
                  <li>• Manage employee records and departments</li>
                  <li>• Monitor attendance and leave</li>
                  <li>• Export performance reports</li>
                </ul>
                <button
                  onClick={onHRClick}
                  className="mt-auto w-full py-2.5 md:py-3 px-6 bg-white text-indigo-600 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all"
                >
                  HR Login →
                </button>
              </div>
            </div>

            {/* Employee Portal */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-2xl transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,185,129,0.65)]">
              <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="relative p-6 md:p-7 flex flex-col h-full">
                <div className="mb-4">
                  <h2 className="text-xl md:text-2xl font-bold mb-1">
                    👷 Employee Portal
                  </h2>
                  <p className="text-emerald-100 text-xs md:text-sm">
                    Clean dashboard for your daily work and presence.
                  </p>
                </div>
                <ul className="mb-5 space-y-1.5 text-[11px] md:text-xs text-emerald-50/95">
                  <li>• Mark attendance in a single tap</li>
                  <li>• Track today&apos;s working hours</li>
                  <li>• View personal details and status</li>
                </ul>
                <button
                  onClick={onEmployeeClick}
                  className="mt-auto w-full py-2.5 md:py-3 px-6 bg-white text-emerald-600 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all"
                >
                  Employee Login →
                </button>
              </div>
            </div>

            {/* Hiring & Recruitment / Admin Portal */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-500 text-white shadow-2xl transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(59,130,246,0.65)]">
              <div className="absolute inset-y-0 right-0 w-24 bg-white/5 blur-2xl" />
              <div className="relative p-6 md:p-7 flex flex-col h-full">
                <div className="mb-4">
                  <h2 className="text-xl md:text-2xl font-bold mb-1">
                    🧩 Hiring & Recruitment
                  </h2>
                  <p className="text-sky-100 text-xs md:text-sm">
                    Admin control for job openings and hiring pipeline.
                  </p>
                </div>
                <ul className="mb-5 space-y-1.5 text-[11px] md:text-xs text-sky-50/95">
                  <li>• Publish and manage job postings</li>
                  <li>• Track candidate stages and interviews</li>
                  <li>• Approve final offers and hires</li>
                </ul>
                <button
                  onClick={onAdminClick}
                  className="mt-auto w-full py-2.5 md:py-3 px-6 bg-white text-sky-700 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all"
                >
                  Admin Login →
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-center text-slate-400">
            Not sure which portal to use? Reach out to your{" "}
            <span className="font-medium text-slate-600">InnovaHire</span> HR
            administrator for access details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
