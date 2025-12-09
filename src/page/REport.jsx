import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const Reports = () => {
  const [items, setItems] = useState([]);

  const loadItems = async () => {
    const res = await fetch(`${API_BASE}/reports`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-50 px-6 md:px-10 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold">
          Customizable reports
        </h1>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <ul className="space-y-2 text-xs md:text-sm">
            {items.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {r.type} • {r.createdOn}
                  </p>
                </div>
                <button className="rounded-full bg-slate-900 px-3 py-1 text-[11px]">
                  Download
                </button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="text-slate-500">No reports yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Reports;
