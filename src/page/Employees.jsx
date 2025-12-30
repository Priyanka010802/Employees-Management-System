// src/pages/ManageEmployees.jsx
import { useEffect, useState } from "react";
import AOS from "aos";

const API_BASE = "http://localhost:3000";

const emptyForm = {
  name: "", image: "", email: "", address: "", salary: "", department: "",
  role: "", empCode: "", hireDate: "",
};

const fallbackAvatar = (name = "E") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=111827&size=128`;

const FORM_FIELDS = [
  { name: "name", label: "Name *", type: "text" },
  { name: "email", label: "Email *", type: "email" },
  { name: "empCode", label: "Employee ID", placeholder: "EMP-001" },
  { name: "hireDate", label: "Hiring date", type: "date" },
  { name: "image", label: "Image URL" },
  { name: "address", label: "Address" },
  { name: "salary", label: "Salary (₹ / month)", type: "number" },
  { name: "department", label: "Department" },
  { name: "role", label: "Role" },
];

const getEmpCode = (emp) => emp.empCode || (emp.id ? `EMP-${String(emp.id).padStart(3, "0")}` : "N/A");
const formatSalary = (salary) => salary ? Number(salary).toLocaleString() : "0";
const getAvatar = (emp) => emp?.image && emp.image.trim() !== "" ? emp.image : fallbackAvatar(emp?.name);

const mapEmployeeToForm = (emp = {}) => ({
  name: emp.name || "", image: emp.image || "", email: emp.email || "",
  address: emp.address || "", salary: emp.salary ? String(emp.salary) : "",
  department: emp.department || "", role: emp.role || "",
  empCode: emp.empCode || "", hireDate: emp.hireDate || "",
});

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeForPrint, setSelectedEmployeeForPrint] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true });
  }, []);

  const loadEmployees = async () => {
    const res = await fetch(`${API_BASE}/employees`);
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, salary: Number(form.salary) || 0 };

    if (editingId) {
      await fetch(`${API_BASE}/employees/${editingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE}/employees`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setForm(emptyForm); setEditingId(null); setIsFormOpen(false);
    await loadEmployees();
  };

  const handleAddClick = () => {
    setForm(emptyForm); setEditingId(null); setIsFormOpen(true);
  };

  const handleEdit = (emp) => {
    setForm(mapEmployeeToForm(emp));
    setEditingId(emp.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await fetch(`${API_BASE}/employees/${id}`, { method: "DELETE" });
    await loadEmployees();
  };

  const handleViewPDF = (emp) => {
    setSelectedEmployeeForPrint(emp);
  };

  const handlePrintPDF = (employee) => {
    const safeImage = getAvatar(employee);
    const printWindow = window.open("", "_blank", "width=900,height=1100");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${employee?.name || "Employee Profile"} - Employee Management System</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #1a202c; padding: 30px 15px; min-height: 100vh; font-size: 14px;
          }
          .container {
            max-width: 750px; margin: 0 auto; background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px); border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.3);
          }
          .header {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
            padding: 35px 25px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header h1 {
            font-size: 24px; font-weight: 800;
            background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em; margin-bottom: 8px;
          }
          .header p { font-size: 13px; color: rgba(255, 255, 255, 0.95); font-weight: 500; letter-spacing: 0.025em; }
          .content { padding: 35px 25px; }
          .profile-row { display: flex; gap: 25px; margin-bottom: 30px; align-items: flex-start; }
          .profile-image { flex-shrink: 0; }
          .profile-image img {
            width: 120px; height: 120px; border-radius: 50%; object-fit: cover;
            border: 4px solid rgba(255, 255, 255, 0.4); box-shadow: 0 15px 30px rgba(0,0,0,0.15);
          }
          .profile-info h2 {
            font-size: 22px; font-weight: 700;
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 6px; line-height: 1.2;
          }
          .profile-role {
            font-size: 14px; background: linear-gradient(135deg, #5163b1ff 0%, #68438dff 100%);
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 10px; font-weight: 600;
          }
          .profile-email { font-size: 13px; color: #4a5568; margin-bottom: 16px; font-weight: 500; }
          .id-hire-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .id-hire-card {
            background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 16px; padding: 18px;
          }
          .id-hire-label {
            font-size: 11px; color: #667eea; text-transform: uppercase;
            letter-spacing: 0.08em; margin-bottom: 8px; font-weight: 700;
          }
          .id-hire-value { font-size: 16px; font-weight: 700; color: #2d3748; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 25px; }
          .detail-card {
            background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 16px; padding: 20px;
          }
          .detail-card.full { grid-column: 1 / -1; }
          .detail-label {
            font-size: 11px; color: #667eea; text-transform: uppercase;
            letter-spacing: 0.08em; margin-bottom: 10px; font-weight: 700;
          }
          .detail-value { font-size: 15px; font-weight: 600; color: #2d3748; }
          .salary-value {
            font-size: 20px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
            font-weight: 700;
          }
          .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.3); padding: 16px 25px;
            background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px);
            display: flex; justify-content: space-between; align-items: center;
            font-size: 12px; color: #4a5568; font-weight: 500;
          }
          @media print { body { background: white; padding: 0; } }
          @media (max-width: 768px) {
            .profile-row { flex-direction: column; text-align: center; }
            .profile-image img { width: 100px; height: 100px; margin: 0 auto; }
            .details-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Employee Management System</h1>
            <p>Modern HR overview • Manage people, roles & salaries</p>
          </div>
          <div class="content">
            <div class="profile-row">
              <div class="profile-image">
                <img src="${safeImage}" alt="${employee?.name || "Employee"}">
              </div>
              <div class="profile-info">
                <h2>${employee?.name || "N/A"}</h2>
                <div class="profile-role">${employee?.role || "N/A"} • ${employee?.department || "N/A"}</div>
                <div class="profile-email">${employee?.email || "N/A"}</div>
                <div class="id-hire-grid">
                  <div class="id-hire-card">
                    <div class="id-hire-label">Employee ID</div>
                    <div class="id-hire-value">${getEmpCode(employee)}</div>
                  </div>
                  <div class="id-hire-card">
                    <div class="id-hire-label">Hiring Date</div>
                    <div class="id-hire-value">${employee?.hireDate || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="details-grid">
              <div class="detail-card">
                <div class="detail-label">Salary (per month)</div>
                <div class="detail-value salary-value">₹${formatSalary(employee?.salary)}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Department</div>
                <div class="detail-value">${employee?.department || "N/A"}</div>
              </div>
              <div class="detail-card full">
                <div class="detail-label">Office Address</div>
                <div class="detail-value">${employee?.address || "N/A"}</div>
              </div>
            </div>
          </div>
          <div class="footer">
            <span>Generated by Employee Management System</span>
            <span>${new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    return emp.name?.toLowerCase().includes(q) ||
           emp.email?.toLowerCase().includes(q) ||
           emp.department?.toLowerCase().includes(q) ||
           emp.role?.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 min-h-screen bg-slate-50 relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-50" />
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />

      <header className="relative z-10 h-16 border-b border-slate-200/70 flex items-center px-4 md:px-8 bg-white/80 backdrop-blur-2xl">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Directory</h1>
          <p className="text-xs md:text-sm text-slate-500">Employee Management System • Employee Directory</p>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto space-y-6">
        <section className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-sm px-5 md:px-8 py-5 flex flex-col gap-4" data-aos="fade-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">Employee Directory</h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                {employees.length} team member{employees.length === 1 ? "" : "s"} in your organization.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-7 py-2 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>
              <button onClick={handleAddClick} className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-500 text-white text-xs md:text-sm font-semibold px-4 py-2 shadow-sm hover:bg-sky-600 transition-all">
                <span className="text-sm">＋</span><span>Add employee</span>
              </button>
            </div>
          </div>
        </section>

        {isFormOpen && (
          <section className="relative rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-2xl shadow-md px-5 md:px-6 py-5" data-aos="fade-up">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900">
                  {editingId ? "Edit employee" : "Add new employee"}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Fill employee details. You can update them later.</p>
              </div>
              <button
                onClick={() => { setIsFormOpen(false); setEditingId(null); setForm(emptyForm); }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {FORM_FIELDS.map(({ name, label, type = "text", placeholder = "" }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">{label}</label>
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    required={name === "name" || name === "email"}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                  />
                </div>
              ))}
              <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); setEditingId(null); setForm(emptyForm); }}
                  className="px-5 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-2xl bg-sky-500 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
                >
                  {editingId ? "Update employee" : "Create employee"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-sm px-4 md:px-6 py-5" data-aos="fade-up">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No employees found. Try a different search or add a new employee.
            </div>
          ) : (
            <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((emp) => {
                const imgSrc = getAvatar(emp);
                return (
                  <div key={emp.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={imgSrc}
                          alt={emp.name}
                          className="h-11 w-11 rounded-full object-cover border border-slate-200"
                          onError={(e) => { e.currentTarget.src = fallbackAvatar(emp.name); }}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border border-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.role || "Role not set"}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{emp.department || "Department not set"}</p>
                      </div>
                    </div>

                    <div className="px-4 py-3 text-[11px] text-slate-500 space-y-2 flex-1">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="text-slate-400">Email</p>
                          <p className="text-slate-700 truncate max-w-[150px]">{emp.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400">Salary</p>
                          <p className="text-emerald-600 font-semibold">₹{formatSalary(emp.salary)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="text-slate-400">Employee ID</p>
                          <p className="text-slate-700">{getEmpCode(emp)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400">Hiring date</p>
                          <p className="text-slate-700">{emp.hireDate || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex gap-1.5 text-[11px]">
                        <button onClick={() => handleViewPDF(emp)} className="px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100" title="Print PDF profile">PDF</button>
                        <button onClick={() => handleEdit(emp)} className="px-2 py-1 rounded-full border border-sky-200 text-sky-600 hover:bg-sky-50">Edit</button>
                        <button onClick={() => handleDelete(emp.id)} className="px-2 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50">Delete</button>
                      </div>
                      <span className="text-[10px] text-slate-400">{emp.address || "No address"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedEmployeeForPrint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-slate-200">
            <div className="sticky top-0 bg-slate-900 text-white rounded-t-2xl p-4 md:p-5 flex items-center justify-between z-10 shadow-md">
              <div>
                <h2 className="text-base md:text-lg font-semibold">{selectedEmployeeForPrint.name} profile</h2>
                <p className="text-xs md:text-sm text-slate-200">Professional light mode • Print ready</p>
              </div>
              <button
                onClick={() => setSelectedEmployeeForPrint(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-5 md:p-6 max-w-3xl mx-auto overflow-y-auto">
              <div className="text-center mb-6 pb-5 border-b border-slate-200">
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">Employee Management System</h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Modern HR overview • Manage people, roles & salaries</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="flex justify-center lg:justify-start flex-shrink-0">
                  <img
                    src={getAvatar(selectedEmployeeForPrint)}
                    alt={selectedEmployeeForPrint.name}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border border-slate-200 shadow-md"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900">{selectedEmployeeForPrint.name}</h2>
                    <p className="text-sm md:text-base text-slate-600 font-medium">
                      {selectedEmployeeForPrint.role} • {selectedEmployeeForPrint.department}
                    </p>
                  </div>

                  <p className="inline-flex text-xs md:text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                    {selectedEmployeeForPrint.email}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                      <span className="block text-[11px] font-semibold text-indigo-700 uppercase tracking-wide mb-1">Employee ID</span>
                      <span className="text-lg font-semibold text-slate-900">{getEmpCode(selectedEmployeeForPrint)}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <span className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wide mb-1">Hiring date</span>
                      <span className="text-lg font-semibold text-slate-900">{selectedEmployeeForPrint.hireDate || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wide mb-2">Salary (per month)</span>
                  <span className="text-2xl md:text-3xl font-semibold text-emerald-700">
                    ₹{formatSalary(selectedEmployeeForPrint.salary)}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100">
                  <span className="block text-[11px] font-semibold text-sky-700 uppercase tracking-wide mb-2">Department</span>
                  <span className="text-lg md:text-xl font-semibold text-slate-900">{selectedEmployeeForPrint.department || "N/A"}</span>
                </div>

                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-2">Office address</span>
                  <span className="text-sm md:text-base font-medium text-slate-800">{selectedEmployeeForPrint.address || "N/A"}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs md:text-sm text-slate-500 font-medium">
                <span>Generated by Employee Management System</span>
                <span>{new Date().toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedEmployeeForPrint(null)}
                className="px-5 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all"
              >
                Close preview
              </button>
              <button
                onClick={() => handlePrintPDF(selectedEmployeeForPrint)}
                className="px-7 py-2.5 rounded-2xl bg-slate-900 text-xs md:text-sm font-semibold text-white shadow-md hover:bg-black hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span className="text-base">📄</span>Print to PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
