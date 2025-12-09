import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const Goals = () => {
  const [goals, setGoals] = useState([]);

  const loadGoals = async () => {
    const res = await fetch(`${API_BASE}/goals`);
    const data = await res.json();
    setGoals(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-50 px-6 md:px-10 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold">Goal setting</h1>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          {goals.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl bg-slate-800/80 px-3 py-3 space-y-1"
            >
              <p className="text-sm font-medium">{g.title}</p>
              <p className="text-[11px] text-slate-400">
                Owner: {g.owner}
              </p>
              <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {g.progress}% complete
              </p>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-[11px] text-slate-500">No goals yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Goals;
