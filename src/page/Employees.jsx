// src/pages/ManageEmployees.jsx
import { useEffect, useState } from "react";
import AOS from "aos";

const API_BASE = "http://localhost:3000";

const emptyForm = {
  name: "",
  image: "",
  email: "",
  address: "",
  salary: "",
  department: "",
  role: "",
  empCode: "",
  hireDate: "",
};

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeForPrint, setSelectedEmployeeForPrint] = useState(null);

  // init AOS
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true });
  }, []);

  // load employees from JSON Server
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

    const payload = {
      ...form,
      salary: Number(form.salary) || 0,
    };

    if (editingId) {
      await fetch(`${API_BASE}/employees/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
    await loadEmployees();
  };

  const handleAddClick = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name || "",
      image: emp.image || "",
      email: emp.email || "",
      address: emp.address || "",
      salary: emp.salary ? String(emp.salary) : "",
      department: emp.department || "",
      role: emp.role || "",
      empCode: emp.empCode || "",
      hireDate: emp.hireDate || "",
    });
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
            color: #1a202c;
            padding: 30px 15px;
            min-height: 100vh;
            font-size: 14px;
          }
          .container {
            max-width: 750px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          .header {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
            padding: 35px 25px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header h1 {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em;
            margin-bottom: 8px;
          }
          .header p {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;
            letter-spacing: 0.025em;
          }
          .content {
            padding: 35px 25px;
          }
          .profile-row {
            display: flex;
            gap: 25px;
            margin-bottom: 30px;
            align-items: flex-start;
          }
          .profile-image {
            flex-shrink: 0;
          }
          .profile-image img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 15px 30px rgba(0,0,0,0.15);
          }
          .profile-info h2 {
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 6px;
            line-height: 1.2;
          }
          .profile-role {
            font-size: 14px;
            background: linear-gradient(135deg, #5163b1ff 0%, #68438dff 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .profile-email {
            font-size: 13px;
            color: #4a5568;
            margin-bottom: 16px;
            font-weight: 500;
          }
          .id-hire-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .id-hire-card {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 16px;
            padding: 18px;
          }
          .id-hire-label {
            font-size: 11px;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
            font-weight: 700;
          }
          .id-hire-value {
            font-size: 16px;
            font-weight: 700;
            color: #2d3748;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 25px;
          }
          .detail-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 16px;
            padding: 20px;
          }
          .detail-card.full {
            grid-column: 1 / -1;
          }
          .detail-label {
            font-size: 11px;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .detail-value {
            font-size: 15px;
            font-weight: 600;
            color: #2d3748;
          }
          .salary-value {
            font-size: 20px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
          }
          .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            padding: 16px 25px;
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #4a5568;
            font-weight: 500;
          }
          @media print {
            body { background: white; padding: 0; }
          }
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
                <img src="${employee?.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face'}" alt="${employee?.name}">
              </div>
              <div class="profile-info">
                <h2>${employee?.name || 'N/A'}</h2>
                <div class="profile-role">${employee?.role || 'N/A'} • ${employee?.department || 'N/A'}</div>
                <div class="profile-email">${employee?.email || 'N/A'}</div>
                <div class="id-hire-grid">
                  <div class="id-hire-card">
                    <div class="id-hire-label">Employee ID</div>
                    <div class="id-hire-value">${employee?.empCode || (employee?.id ? 'EMP-' + String(employee.id).padStart(3, '0') : 'N/A')}</div>
                  </div>
                  <div class="id-hire-card">
                    <div class="id-hire-label">Hiring Date</div>
                    <div class="id-hire-value">${employee?.hireDate || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="details-grid">
              <div class="detail-card">
                <div class="detail-label">Salary (per month)</div>
                <div class="detail-value salary-value">₹${employee?.salary ? Number(employee.salary).toLocaleString() : '0'}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Department</div>
                <div class="detail-value">${employee?.department || 'N/A'}</div>
              </div>
              <div class="detail-card full">
                <div class="detail-label">Office Address</div>
                <div class="detail-value">${employee?.address || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div class="footer">
            <span>Generated by Employee Management System</span>
            <span>${new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 h-16 border-b border-white/20 flex items-center px-4 md:px-8 bg-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            Employee Management System
          </h1>
          <p className="text-xs md:text-sm bg-gradient-to-r from-white/80 to-blue-100/80 bg-clip-text text-transparent font-medium tracking-wide">
            Modern HR overview • Manage people, roles & salaries
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 md:px-8 py-8 space-y-6 md:space-y-10 max-w-6xl mx-auto">
        {/* Page header */}
        <section
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          data-aos="fade-down"
        >
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-blue-50 to-indigo-100 bg-clip-text text-transparent drop-shadow-2xl">
              Employee Directory
            </h2>
            <p className="text-base md:text-lg bg-white/90 text-slate-800 font-semibold mt-1 px-3 py-1.5 rounded-xl bg-opacity-80 backdrop-blur-sm inline-block shadow-lg text-sm">
              {employees.length} team member{employees.length === 1 ? "" : "s"} active
            </p>
          </div>

          <button
            onClick={handleAddClick}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-base font-bold text-white shadow-2xl hover:shadow-3xl hover:bg-white/30 transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.02] transform"
          >
            <span className="text-xl leading-none">＋</span>
            <span>Add Employee</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </section>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <section
            className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden"
            data-aos="fade-up"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-blue-400/10 to-purple-400/20" />
            <div className="relative p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-lg">
                    {editingId ? "Edit Employee" : "Add New Employee"}
                  </h3>
                  <p className="text-sm md:text-base bg-white/90 text-slate-800 font-medium mt-1 px-3 py-1 rounded-lg backdrop-blur-sm inline-block shadow-lg">
                    Fill details carefully. All fields can be updated later.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="group p-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/40 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
              >
                {[
                  { name: "name", label: "Name *", ring: "emerald-500" },
                  { name: "email", label: "Email *", type: "email", ring: "sky-500" },
                  { name: "empCode", label: "Employee ID", placeholder: "EMP-001", ring: "purple-500" },
                  { name: "hireDate", label: "Hiring Date", type: "date", ring: "emerald-500" },
                  { name: "image", label: "Image URL", ring: "indigo-500" },
                  { name: "address", label: "Address", ring: "emerald-500" },
                  { name: "salary", label: "Salary (₹/month)", type: "number", ring: "amber-500" },
                  { name: "department", label: "Department", ring: "sky-500" },
                  { name: "role", label: "Role", ring: "fuchsia-500" },
                ].map(({ name, label, type = "text", placeholder = "", ring }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/90">
                      {label}
                    </label>
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={handleChange}
                      required={name === "name" || name === "email"}
                      placeholder={placeholder}
                      className={`w-full rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-xl px-4 py-3 text-sm text-white placeholder-white/60 font-medium focus:outline-none focus:ring-2 focus:ring-${ring} focus:border-white/50 transition-all duration-300 hover:border-white/50 hover:shadow-xl hover:shadow-${ring}/25`}
                    />
                  </div>
                ))}

                <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                    className="px-8 py-3 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-white/30 text-sm font-bold text-white hover:bg-white/40 hover:shadow-2xl hover:shadow-slate-500/25 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-500 to-purple-500 text-sm font-bold text-white shadow-2xl hover:shadow-3xl hover:shadow-emerald-500/50 hover:from-emerald-500 hover:via-sky-600 hover:to-purple-600 transform hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                  >
                    {editingId ? "Update Employee" : "Create Employee"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Employees Table */}
        <section
          className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden"
          data-aos="fade-up"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          <div className="px-6 md:px-8 py-6 border-b border-white/20 flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-black bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent drop-shadow-lg">
              Employee Directory
            </h3>
            <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-xl text-sm font-bold text-white border border-white/30 shadow-xl">
              {employees.length} records
            </span>
          </div>

          <div className="px-4 md:px-6 py-6 overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-white/20 bg-white/5 backdrop-blur-xl">
                  {[
                    "Name", "Email", "Department", "Role", "Salary", "Actions"
                  ].map((header, i) => (
                    <th key={i} className="text-left font-bold text-white/90 px-4 py-4 uppercase tracking-wider text-xs md:text-sm">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-xl"
                  >
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        {emp.image ? (
                          <img
                            src={emp.image}
                            alt={emp.name}
                            className="h-10 w-10 md:h-11 md:w-11 rounded-xl object-cover border-2 border-white/50 shadow-xl hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-xl">
                            {emp.name?.[0] || "E"}
                          </div>
                        )}
                        <div>
                          <span className="block font-bold text-sm md:text-base text-white drop-shadow-lg">
                            {emp.name}
                          </span>
                          <span className="text-xs text-white/80">{emp.department} • {emp.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-white/90 font-medium text-xs md:text-sm max-w-xs truncate">
                      {emp.email}
                    </td>
                    <td className="px-4 py-5">
                      <span className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-xl text-white font-semibold text-xs md:text-sm border border-white/30">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-white/90 font-medium text-xs md:text-sm">
                      {emp.role}
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg">
                        ₹{emp.salary?.toLocaleString() || "0"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPDF(emp)}
                          className="p-2.5 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                          title="Print PDF Profile"
                        >
                          📄
                        </button>
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold shadow-xl hover:shadow-sky-500/50 hover:scale-105 transition-all duration-300"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 text-white font-bold shadow-xl hover:shadow-rose-500/50 hover:scale-105 transition-all duration-300"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                          <span className="text-2xl">👥</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-white drop-shadow-lg">No employees yet</h3>
                          <p className="text-sm text-white/90 font-semibold">Click "Add Employee" to get started</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* PDF Preview Modal */}
      {selectedEmployeeForPrint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-3xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/50">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl p-6 flex items-center justify-between z-10 shadow-2xl">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-2xl">
                  {selectedEmployeeForPrint.name} Profile
                </h2>
                <p className="text-sm md:text-base text-white/95 font-semibold mt-1 drop-shadow-lg">
                  Professional light mode • Print ready
                </p>
              </div>
              <button
                onClick={() => setSelectedEmployeeForPrint(null)}
                className="p-2 rounded-xl bg-white/30 backdrop-blur-xl hover:bg-white/50 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                ✕
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6 md:p-8 max-w-3xl mx-auto">
              {/* Header */}
              <div className="text-center mb-10 pb-8 border-b-2 border-indigo-200/50">
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent tracking-tight mb-3 drop-shadow-2xl">
                  Employee Management System
                </h1>
                <p className="text-lg md:text-xl bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 bg-clip-text text-transparent font-bold tracking-wide text-sm md:text-base">
                  Modern HR overview • Manage people, roles & salaries
                </p>
              </div>

              {/* Profile Section */}
              <div className="flex flex-col lg:flex-row gap-8 mb-10">
                <div className="flex justify-center lg:justify-start flex-shrink-0">
                  <div className="relative group">
                    <img
                      src={selectedEmployeeForPrint.image || "https://ui-avatars.com/api/?name=p"}
                      alt={selectedEmployeeForPrint.name}
                      className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-2xl object-cover border-6 border-white/60 shadow-2xl ring-4 ring-indigo-200/50 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent drop-shadow-2xl">
                      {selectedEmployeeForPrint.name}
                    </h2>
                    <p className="text-lg md:text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold drop-shadow-lg text-sm md:text-base">
                      {selectedEmployeeForPrint.role} • {selectedEmployeeForPrint.department}
                    </p>
                  </div>

                  <p className="text-base md:text-lg text-slate-800 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl inline-block shadow-lg text-sm">
                    {selectedEmployeeForPrint.email}
                  </p>

                  {/* ID & Hire Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-500 hover:-translate-y-2">
                      <span className="block text-xs md:text-sm font-black uppercase tracking-wider text-indigo-600 mb-2 drop-shadow-lg">
                        Employee ID
                      </span>
                      <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-indigo-700 drop-shadow-xl">
                        {selectedEmployeeForPrint.empCode || (selectedEmployeeForPrint.id ? `EMP-${String(selectedEmployeeForPrint.id).padStart(3, '0')}` : 'N/A')}
                      </span>
                    </div>
                    <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:-translate-y-2">
                      <span className="block text-xs md:text-sm font-black uppercase tracking-wider text-emerald-600 mb-2 drop-shadow-lg">
                        Hiring Date
                      </span>
                      <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-emerald-700 drop-shadow-xl">
                        {selectedEmployeeForPrint.hireDate || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="group p-8 md:p-10 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-100/70 to-emerald-50 border-2 border-emerald-200/50 shadow-2xl hover:shadow-3xl hover:shadow-emerald-500/30 transition-all duration-500 hover:-translate-y-3">
                  <span className="block text-xs md:text-sm font-black uppercase tracking-wider text-emerald-700 mb-4 drop-shadow-lg">
                    Salary (per month)
                  </span>
                  <span className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:via-emerald-600 drop-shadow-2xl">
                    ₹{selectedEmployeeForPrint.salary ? Number(selectedEmployeeForPrint.salary).toLocaleString() : '0'}
                  </span>
                </div>

                <div className="group p-8 md:p-10 rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100/70 to-indigo-50 border-2 border-blue-200/50 shadow-2xl hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-3">
                  <span className="block text-xs md:text-sm font-black uppercase tracking-wider text-blue-700 mb-4 drop-shadow-lg">
                    Department
                  </span>
                  <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-blue-800 drop-shadow-2xl">
                    {selectedEmployeeForPrint.department || 'N/A'}
                  </span>
                </div>

                <div className="lg:col-span-2 group p-8 md:p-10 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-100/70 to-slate-50 border-2 border-slate-200/50 shadow-2xl hover:shadow-3xl hover:shadow-slate-500/20 transition-all duration-500 hover:-translate-y-3">
                  <span className="block text-xs md:text-sm font-black uppercase tracking-wider text-slate-700 mb-4 drop-shadow-lg">
                    Office Address
                  </span>
                  <span className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 drop-shadow-2xl">
                    {selectedEmployeeForPrint.address || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-indigo-200/50 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm md:text-base text-slate-600 font-bold">
                <span>Generated by Employee Management System</span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-gradient-to-t from-indigo-500/95 via-purple-500/90 to-pink-500/95 backdrop-blur-3xl border-t-2 border-white/50 p-6 flex gap-4 justify-end shadow-2xl">
              <button
                onClick={() => setSelectedEmployeeForPrint(null)}
                className="px-8 py-3 rounded-2xl border-2 border-white/50 bg-white/30 backdrop-blur-xl text-sm font-bold text-white hover:bg-white/50 hover:shadow-3xl hover:shadow-slate-500/30 hover:scale-105 transition-all duration-300"
              >
                Close Preview
              </button>
              <button
                onClick={() => handlePrintPDF(selectedEmployeeForPrint)}
                className="px-10 py-3 rounded-2xl bg-gradient-to-r from-white to-slate-100 text-lg font-bold text-indigo-900 shadow-3xl hover:shadow-4xl hover:shadow-indigo-500/50 hover:from-white hover:to-slate-50 hover:scale-105 transform transition-all duration-300 flex items-center gap-2 group"
              >
                <span className="text-xl">📄</span>
                Print to PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
