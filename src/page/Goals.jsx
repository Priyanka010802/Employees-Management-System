import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

function Goals() {
  const [goals, setGoals] = useState([]);

  const loadGoals = async () => {
    try {
      const res = await fetch(`${API_BASE}/goals`);
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load goals:", error);
      setGoals([]);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-2xl">
            Goal Setting
          </h1>
          <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-xl text-sm font-bold text-white border border-white/30 shadow-xl">
            {goals.length} goals
          </span>
        </header>

        <section 
          className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          <div className="px-6 md:px-8 py-6 border-b border-white/20">
            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-lg">
              Organization Goals
            </h2>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            {goals.map((g) => (
              <div
                key={g.id}
                className="group relative rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 hover:border-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg mb-1">
                      {g.title}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">
                      Owner: <span className="font-semibold text-indigo-200">{g.owner}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-xs font-bold shadow-lg">
                    {g.progress}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden shadow-inner">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-500 shadow-lg"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 font-medium">
                    {g.progress}% complete
                  </p>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              </div>
            ))}

            {goals.length === 0 && (
              <div className="text-center py-16 px-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-6 shadow-xl">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-white/80 mb-2 drop-shadow-lg">
                  No goals set yet
                </h3>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  Define organization goals and track progress here. Goals help align teams and measure success.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Goals;
