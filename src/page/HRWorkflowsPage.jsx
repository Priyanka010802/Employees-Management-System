import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const Workflows = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", steps: 3, stage: "Draft" });

  const loadItems = async () => {
    const res = await fetch(`${API_BASE}/workflows`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    await fetch(`${API_BASE}/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        steps: Number(form.steps) || 1,
        stage: form.stage,
      }),
    });

    setForm({ name: "", steps: 3, stage: "Draft" });
    await loadItems();
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-50 px-6 md:px-10 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold">HR workflows</h1>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col md:flex-row gap-3"
        >
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Workflow name (e.g. Onboarding)"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="steps"
            type="number"
            min="1"
            value={form.steps}
            onChange={handleChange}
            className="w-24 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>Draft</option>
            <option>Active</option>
            <option>Archived</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-400 transition"
          >
            Add
          </button>
        </form>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <ul className="space-y-2 text-xs md:text-sm">
            {items.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2"
              >
                <div>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {w.stage} • {w.steps} steps
                  </p>
                </div>
              </li>
            ))}
            {items.length === 0 && (
              <li className="text-slate-500">No workflows yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Workflows;
