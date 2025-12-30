// src/subpages/CompanyPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/companies";

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [modal, setModal] = useState({ add: false, edit: false, view: false });
  const [loading, setLoading] = useState({ page: false, action: false });
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "", hrName: "", hrEmail: "", hrContact: "", location: "",
    platform: "", roles: "", status: "Active", companyHistory: "",
    applications: 0, shortlisted: 0, placed: 0
  });
  const [currentCompany, setCurrentCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading({ ...loading, page: true });
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch companies");
      setCompanies(await res.json());
    } catch (err) {
      setError("Could not load companies. Check JSON Server at " + API_URL);
    } finally {
      setLoading({ ...loading, page: false });
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setLoading({ ...loading, action: true });
    setError("");

    try {
      const url = isEdit ? `${API_URL}/${currentCompany.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const data = isEdit ? currentCompany : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'save'} company`);
      
      const result = await res.json();
      setCompanies(prev => isEdit 
        ? prev.map(c => c.id === result.id ? result : c)
        : [result, ...prev]
      );

      if (!isEdit) {
        setFormData({
          name: "", hrName: "", hrEmail: "", hrContact: "", location: "",
          platform: "", roles: "", status: "Active", companyHistory: "",
          applications: 0, shortlisted: 0, placed: 0
        });
      }
      
      setModal({ add: false, edit: false, view: false });
      setCurrentCompany(null);
    } catch (err) {
      setError(`Could not ${isEdit ? 'update' : 'save'} company. Please try again.`);
    } finally {
      setLoading({ ...loading, action: false });
    }
  };

  const deleteCompany = async (id) => {
    if (!confirm("Delete this company?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch {
      alert("Could not delete company");
    }
  };

  const openModal = (type, company = null) => {
    if (company) setCurrentCompany({ ...company });
    setModal({ add: false, edit: false, view: false, [type]: true });
  };

  const closeModal = () => {
    setModal({ add: false, edit: false, view: false });
    setCurrentCompany(null);
  };

  const getStatusColor = (status) => 
    status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";

  const getPlacementRate = (company) => 
    company.applications > 0 ? Math.round((company.placed / company.applications) * 100) : 0;

  const stats = {
    total: companies.length,
    applications: companies.reduce((sum, c) => sum + (c.applications || 0), 0),
    placed: companies.reduce((sum, c) => sum + (c.placed || 0), 0)
  };

  const FormField = ({ label, icon, type = "text", required = false, value, onChange, placeholder, ...props }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        <span className="inline-block mr-1">{icon}</span> {label} {required && "*"}
      </label>
      {type === "textarea" ? (
        <textarea
          required={required}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm resize-vertical"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows="2"
          {...props}
        />
      ) : (
        <input
          required={required}
          type={type}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      )}
    </div>
  );

  const StatsCard = ({ title, value, icon, color = "emerald" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <span className={`text-${color}-600 text-sm`}>{icon}</span>
        </div>
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium">{title}</p>
    </div>
  );

  const CompanyRow = ({ company, index }) => (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td className="px-4 py-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center font-semibold text-blue-700 text-sm">
          {index + 1}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-xs font-bold text-white">
              {company.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-900">{company.name}</div>
            <div className="text-xs text-slate-500">ID: {company.id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-xs">
          <div className="font-medium text-slate-900">{company.hrName}</div>
          <div className="text-slate-500 truncate max-w-[140px]">{company.hrEmail}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <span>📍</span>
          <span className="truncate max-w-[120px]">{company.location}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-lg">
          {company.roles}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(company.status)}`}>
          {company.status}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="font-bold text-blue-600 text-sm">{company.applications}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {['👁️', '✏️', '🗑️'].map((icon, i) => (
            <button
              key={i}
              onClick={() => i === 0 ? openModal('view', company) : 
                       i === 1 ? openModal('edit', company) : 
                       deleteCompany(company.id)}
              className={`p-2 rounded-lg text-sm ${i === 2 ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-blue-50 text-blue-600'}`}
              title={['View', 'Edit', 'Delete'][i]}
            >
              {icon}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );

  const Modal = ({ type, title, onSubmit }) => {
    const data = type === 'add' ? formData : currentCompany;
    const setData = type === 'add' ? setFormData : setCurrentCompany;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-600">Fill all required fields *</p>
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
              <span className="text-lg">✕</span>
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Company Name" icon="🏢" required value={data.name} 
                onChange={e => setData({...data, name: e.target.value})} placeholder="Enter company name" />
              <FormField label="HR Name" icon="👤" required value={data.hrName} 
                onChange={e => setData({...data, hrName: e.target.value})} placeholder="HR full name" />
              <FormField label="Email" icon="✉️" type="email" required value={data.hrEmail} 
                onChange={e => setData({...data, hrEmail: e.target.value})} placeholder="hr@company.com" />
              <FormField label="Contact" icon="📞" type="tel" required value={data.hrContact} 
                onChange={e => setData({...data, hrContact: e.target.value})} placeholder="+91 9876543210" />
              <FormField label="Location" icon="📍" required value={data.location} 
                onChange={e => setData({...data, location: e.target.value})} placeholder="City, State" />
              <FormField label="Platform" icon="🌐" value={data.platform} 
                onChange={e => setData({...data, platform: e.target.value})} placeholder="LinkedIn, Naukri" />
              <FormField label="Roles" icon="💼" required value={data.roles} 
                onChange={e => setData({...data, roles: e.target.value})} placeholder="SDE, Intern, DevOps" />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">📊 Status *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
                  value={data.status}
                  onChange={e => setData({...data, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <FormField label="Company History" icon="📜" type="textarea" value={data.companyHistory} 
                  onChange={e => setData({...data, companyHistory: e.target.value})} placeholder="Brief company history..." />
              </div>
              <FormField label="Applications" icon="📊" type="number" value={data.applications} 
                onChange={e => setData({...data, applications: +e.target.value || 0})} />
              <FormField label="Shortlisted" icon="✅" type="number" value={data.shortlisted} 
                onChange={e => setData({...data, shortlisted: +e.target.value || 0})} />
              <FormField label="Placed" icon="🎯" type="number" value={data.placed} 
                onChange={e => setData({...data, placed: +e.target.value || 0})} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} 
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading.action}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading.action ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {type === 'add' ? 'Saving...' : 'Updating...'}
                  </>
                ) : (
                  type === 'add' ? 'Add Company' : 'Update Company'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 mb-3 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 uppercase">Company Management</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
              <p className="text-sm text-slate-600 mt-1">Manage company profiles and recruitment statistics</p>
            </div>
            <button 
              onClick={() => openModal('add')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <span>+</span> Add Company
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard title="Total Companies" value={stats.total} icon="🏢" color="blue" />
            <StatsCard title="Total Applications" value={stats.applications} icon="📊" color="indigo" />
            <StatsCard title="Placed Candidates" value={stats.placed} icon="🎯" color="emerald" />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-500">⚠️</span>
              <span className="text-sm font-medium text-rose-800">{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-800">
              ✕
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading.page ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-700">Loading companies...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['#', 'Company', 'HR Contact', 'Location', 'Roles', 'Status', 'Applied', 'Actions'].map((header, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, index) => (
                    <CompanyRow key={company.id} company={company} index={index} />
                  ))}
                  {companies.length === 0 && !loading.page && (
                    <tr>
                      <td colSpan="8" className="py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-14 h-14 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                            🏢
                          </div>
                          <p className="text-base font-medium text-slate-700">No companies found</p>
                          <p className="text-sm text-slate-500">Add your first company using the button above</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modals */}
        {modal.add && <Modal type="add" title="Add New Company" onSubmit={(e) => handleSubmit(e, false)} />}
        {modal.edit && <Modal type="edit" title="Edit Company" onSubmit={(e) => handleSubmit(e, true)} />}

        {/* View Modal */}
        {modal.view && currentCompany && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Company Details</h2>
                  <p className="text-xs text-slate-600">ID: {currentCompany.id}</p>
                </div>
                <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
                  <span className="text-lg">✕</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Company Info */}
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
                    <span className="text-xs font-bold text-white">
                      {currentCompany.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{currentCompany.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(currentCompany.status)}`}>
                        {currentCompany.status}
                      </span>
                      <span className="text-xs text-slate-500">📍 {currentCompany.location}</span>
                    </div>
                    <p className="text-sm text-slate-600">{currentCompany.companyHistory || 'No history provided'}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">👤 HR Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-slate-500">Name:</span> <span className="font-medium">{currentCompany.hrName}</span></div>
                        <div><span className="text-slate-500">Email:</span> <span className="text-blue-600">{currentCompany.hrEmail}</span></div>
                        <div><span className="text-slate-500">Contact:</span> <span className="font-medium">{currentCompany.hrContact}</span></div>
                        <div><span className="text-slate-500">Platform:</span> <span className="text-indigo-600">{currentCompany.platform || 'Direct'}</span></div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">💼 Roles</h4>
                      <p className="text-sm font-medium text-indigo-700">{currentCompany.roles}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4 text-center">📊 Recruitment Statistics</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Applications', value: currentCompany.applications || 0, color: 'bg-blue-500' },
                        { label: 'Shortlisted', value: currentCompany.shortlisted || 0, color: 'bg-indigo-500' },
                        { label: 'Placed', value: currentCompany.placed || 0, color: 'bg-emerald-500' }
                      ].map((stat, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700">{stat.label}</span>
                            <span className="text-sm font-bold text-slate-900">{stat.value}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${stat.color}`} 
                                 style={{width: `${(stat.value / (currentCompany.applications || 1)) * 100}%`}}></div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-slate-200 text-center">
                        <div className="text-lg font-bold text-emerald-600">{getPlacementRate(currentCompany)}%</div>
                        <div className="text-xs text-slate-500 uppercase font-semibold">Placement Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPage;