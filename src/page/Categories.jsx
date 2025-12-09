// src/pages/CategoryPage.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadCategories = async () => {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { name: name.trim() };

    if (editingId) {
      await fetch(`${API_BASE}/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setName("");
    setEditingId(null);
    await loadCategories();
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await fetch(`${API_BASE}/categories/${id}`, { method: "DELETE" });
    await loadCategories();
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>

      <main className="relative z-10 flex-1 px-6 md:px-12 py-10 max-w-6xl mx-auto space-y-10">
        {/* Page Header & Form */}
        <section className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden p-8 md:p-12"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-blue-400/10 to-purple-400/20" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-2xl mb-2">
                Category Management
              </h1>
              <p className="text-lg md:text-xl bg-white/90 text-slate-800 font-semibold px-4 py-2 rounded-xl backdrop-blur-sm inline-block shadow-xl">
                {categories.length} categories active
              </p>
            </div>

            {/* Add Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={editingId ? "Edit category name..." : "Enter new category name..."}
                  className="w-full rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-xl px-6 py-4 text-lg text-white placeholder-white/60 font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:border-white/50 transition-all duration-500 hover:border-white/50 hover:shadow-2xl hover:shadow-emerald-500/25 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
              </div>
              
              <button
                type="submit"
                className="group px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-lg font-bold text-white shadow-2xl hover:shadow-3xl hover:shadow-emerald-500/50 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 transform relative overflow-hidden"
              >
                <span>{editingId ? "✏️ Update" : "➕ Add"}</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </form>
          </div>
        </section>

        {/* Categories List */}
        <section
          className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden"
          data-aos="fade-up"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          <div className="px-8 md:px-12 py-8 border-b border-white/20">
            <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-lg">
              Category Directory
            </h2>
          </div>

          <div className="px-6 md:px-10 py-8">
            {categories.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl mb-6">
                  <span className="text-3xl">📂</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg mb-2">
                  No categories yet
                </h3>
                <p className="text-lg text-white/90 font-semibold">
                  Add your first category using the form above
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="group relative rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 p-8 hover:shadow-2xl hover:shadow-purple-500/30 hover:bg-white/30 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
                    
                    {/* Category Badge */}
                    <div className="relative flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">📂</span>
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
                          {cat.name}
                        </h3>
                        <p className="text-sm text-white/80 font-medium">Category ID: {cat.id}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="relative flex gap-3">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="flex-1 group/edit px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-sky-500/50 hover:from-sky-600 hover:to-blue-700 hover:scale-[1.02] transition-all duration-300 transform relative overflow-hidden"
                      >
                        <span>✏️ Edit</span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/edit:opacity-100 transition-opacity duration-300" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-rose-500/50 hover:from-rose-600 hover:to-red-700 hover:scale-[1.02] transition-all duration-300 transform relative overflow-hidden"
                      >
                        <span>🗑️ Delete</span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CategoryPage;
