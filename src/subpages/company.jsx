// src/subpages/CompanyPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/companies";

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [newCompany, setNewCompany] = useState({
    name: "",
    location: "",
    roles: "",
    status: "Active"
  });

  const [editingCompany, setEditingCompany] = useState(null);

  // Fetch companies from JSON Server
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsPageLoading(true);
      setError("");
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch companies");
        const data = await res.json();
        setCompanies(data);
      } catch (err) {
        setError("Could not load companies. Check JSON Server at " + API_URL);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = { ...newCompany };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save company");
      
      const created = await res.json();
      setCompanies(prev => [created, ...prev]);
      
      setNewCompany({ name: "", location: "", roles: "", status: "Active" });
      setIsAddModalOpen(false);
    } catch (err) {
      setError("Could not save company. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/${editingCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCompany)
      });
      if (!res.ok) throw new Error("Failed to update company");
      
      const updated = await res.json();
      setCompanies(prev => prev.map(company => 
        company.id === updated.id ? updated : company
      ));
      
      setIsEditModalOpen(false);
      setEditingCompany(null);
    } catch (err) {
      setError("Could not update company. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCompany = (company) => {
    setEditingCompany({ ...company });
    setIsViewModalOpen(true);
  };

  const handleEditCompanyOpen = (company) => {
    setEditingCompany({ ...company });
    setIsEditModalOpen(true);
  };

  const deleteCompany = async (id) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCompanies(prev => prev.filter(company => company.id !== id));
    } catch (err) {
      alert("Could not delete company");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCompany(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setEditingCompany(null);
  };

  const getStatusColor = (status) => {
    return status === "Active" 
      ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
      : "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-16 pb-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-200 px-4 py-2 mb-3 rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Company Management</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">
              Companies
            </h1>
            <p className="text-sm font-medium text-slate-600 bg-white/80 px-4 py-2 rounded-lg inline-block shadow-sm border border-slate-100">
              Manage participating companies and hiring requirements
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col text-right bg-white/90 p-4 rounded-xl shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</span>
              <span className="text-2xl font-bold text-emerald-600">
                {companies.length}
              </span>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
            >
              <span className="text-lg">➕</span>
              Add Company
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 border-l-4 border-l-rose-400 text-rose-800 p-4 rounded-xl shadow-sm mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-rose-100 rounded-lg flex items-center justify-center">
                <span className="text-rose-500 text-sm">⚠️</span>
              </div>
              <span className="font-medium text-sm">{error}</span>
            </div>
            <div className="text-xs bg-white px-2 py-1 rounded-lg font-mono">{API_URL}</div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isPageLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-600 rounded-lg animate-spin mb-4 shadow-md" />
                <p className="text-lg font-semibold text-slate-800">Loading companies...</p>
                <p className="text-slate-500 text-sm mt-1">Connecting to database</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["#", "Company", "Location", "Roles", "Status", "Actions"].map((header, i) => (
                      <th key={i} className={`px-6 py-4 text-left font-semibold text-xs text-slate-700 uppercase tracking-wide ${(i === 5 ? 'text-right' : '')}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((company, index) => (
                    <tr key={company.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center font-semibold text-emerald-700 text-xs">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <span className="text-sm font-bold text-white">
                              {company.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700">{company.name}</div>
                            <div className="text-xs text-slate-500">ID: {company.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <span className="w-4 h-4 text-slate-400">📍</span>
                          {company.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-800 font-medium text-xs rounded-lg">
                          {company.roles}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(company.status)}`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 space-x-reverse">
                        <button 
                          onClick={() => handleViewCompany(company)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-sm"
                          title="View"
                        >
                          <span className="text-sm">👁️</span>
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleEditCompanyOpen(company)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200 shadow-sm"
                          title="Edit"
                        >
                          <span className="text-sm">✏️</span>
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => deleteCompany(company.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/50 transition-all duration-200 shadow-sm"
                          title="Delete"
                        >
                          <span className="text-sm">🗑️</span>
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {companies.length === 0 && !isPageLoading && (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-md border">
                            🏢
                          </div>
                          <div className="space-y-2">
                            <p className="text-xl font-semibold text-slate-800">No companies found</p>
                            <p className="text-slate-600 text-sm font-medium max-w-sm mx-auto">
                              Add your first company using the button above
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">➕ Add New Company</h2>
                <p className="text-sm font-medium text-slate-600">Register new company details</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <form onSubmit={handleAddCompany} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">🏢 Company Name</label>
                  <input 
                    required 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                    placeholder="Enter company name" 
                    value={newCompany.name} 
                    onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📍 Location</label>
                  <input 
                    required 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium" 
                    placeholder="City, State" 
                    value={newCompany.location} 
                    onChange={e => setNewCompany({...newCompany, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">💼 Roles</label>
                  <input 
                    required 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium" 
                    placeholder="SDE, Intern, DevOps, etc." 
                    value={newCompany.roles} 
                    onChange={e => setNewCompany({...newCompany, roles: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📊 Status</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                  value={newCompany.status} 
                  onChange={e => setNewCompany({...newCompany, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Company"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditModalOpen && editingCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">✏️ Edit Company</h2>
                <p className="text-sm font-medium text-slate-600">Update company information</p>
              </div>
              <button onClick={closeEditModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <form onSubmit={handleEditCompany} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">🏢 Company Name</label>
                  <input 
                    required 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium" 
                    placeholder="Enter company name" 
                    value={editingCompany.name} 
                    onChange={e => setEditingCompany({...editingCompany, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📍 Location</label>
                  <input 
                    required 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                    placeholder="City, State" 
                    value={editingCompany.location} 
                    onChange={e => setEditingCompany({...editingCompany, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">💼 Roles</label>
                  <input 
                    required 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium" 
                    placeholder="SDE, Intern, DevOps, etc." 
                    value={editingCompany.roles} 
                    onChange={e => setEditingCompany({...editingCompany, roles: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">📊 Status</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium" 
                  value={editingCompany.status} 
                  onChange={e => setEditingCompany({...editingCompany, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Company"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Company Modal */}
      {isViewModalOpen && editingCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">👁️ Company Details</h2>
                <p className="text-sm font-medium text-slate-600">Company Information</p>
              </div>
              <button onClick={closeViewModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold text-white">
                    {editingCompany.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{editingCompany.name}</h3>
                  <p className="text-xs text-slate-500">ID: {editingCompany.id}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-xs">📍</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Location</div>
                    <p className="font-medium text-sm text-slate-900">{editingCompany.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-xs">💼</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Roles</div>
                    <p className="font-medium text-sm text-slate-900">{editingCompany.roles}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs ${editingCompany.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}>📊</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Status</div>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${getStatusColor(editingCompany.status)}`}>
                      {editingCompany.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {companies.length === 0 && !isPageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 to-emerald-50/90 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-lg border">
              🏢
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-1">No Companies Yet</h2>
              <p className="text-sm text-slate-600 font-medium max-w-sm mx-auto">
                Click "Add Company" to register your first company
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
