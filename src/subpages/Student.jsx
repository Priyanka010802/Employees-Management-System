// src/subpages/StudentPage.jsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/students";

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState({ add: false, edit: false, view: false });
  const [loading, setLoading] = useState({ page: false, action: false });
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", contact: "", course: ""
  });
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading({ ...loading, page: true });
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch students");
      setStudents(await res.json());
    } catch (err) {
      setError("Could not load students. Check JSON Server at " + API_URL);
    } finally {
      setLoading({ ...loading, page: false });
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setLoading({ ...loading, action: true });
    setError("");

    try {
      const url = isEdit ? `${API_URL}/${currentStudent.id}` : API_URL;
      const method = isEdit ? "PUT" : "POST";
      const data = isEdit ? currentStudent : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'save'} student`);
      
      const result = await res.json();
      setStudents(prev => isEdit 
        ? prev.map(s => s.id === result.id ? result : s)
        : [result, ...prev]
      );

      if (!isEdit) {
        setFormData({ name: "", email: "", contact: "", course: "" });
      }
      
      setModal({ add: false, edit: false, view: false });
      setCurrentStudent(null);
    } catch (err) {
      setError(`Could not ${isEdit ? 'update' : 'save'} student. Please try again.`);
    } finally {
      setLoading({ ...loading, action: false });
    }
  };

  const deleteStudent = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch {
      alert("Could not delete student");
    }
  };

  const openModal = (type, student = null) => {
    if (student) setCurrentStudent({ ...student });
    setModal({ add: false, edit: false, view: false, [type]: true });
  };

  const closeModal = () => {
    setModal({ add: false, edit: false, view: false });
    setCurrentStudent(null);
  };

  const stats = {
    total: students.length,
    emails: students.filter(s => s.email).length,
    contacts: students.filter(s => s.contact).length,
    courses: new Set(students.map(s => s.course)).size
  };

  const StatsCard = ({ title, value, icon, color = "blue" }) => (
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

  const StudentRow = ({ student, index }) => (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td className="px-4 py-3">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center font-semibold text-indigo-700 text-sm">
          {index + 1}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-xs font-bold text-white">
              {student.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-900">{student.name}</div>
            <div className="text-xs text-slate-500">ID: {student.id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-xs">
          <div className="font-medium text-slate-900 truncate max-w-[140px]">{student.email}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <span>📞</span>
          <span>{student.contact}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium text-xs rounded-lg">
          {student.course}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {['👁️', '✏️', '🗑️'].map((icon, i) => (
            <button
              key={i}
              onClick={() => i === 0 ? openModal('view', student) : 
                       i === 1 ? openModal('edit', student) : 
                       deleteStudent(student.id)}
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

  const FormField = ({ label, icon, type = "text", required = false, value, onChange, placeholder, ...props }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        <span className="inline-block mr-1">{icon}</span> {label} {required && "*"}
      </label>
      <input
        required={required}
        type={type}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );

  const Modal = ({ type, title, onSubmit }) => {
    const data = type === 'add' ? formData : currentStudent;
    const setData = type === 'add' ? setFormData : setCurrentStudent;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
            <FormField label="Full Name" icon="👤" required value={data.name} 
              onChange={e => setData({...data, name: e.target.value})} placeholder="Enter full name" />
            <FormField label="Email" icon="📧" type="email" required value={data.email} 
              onChange={e => setData({...data, email: e.target.value})} placeholder="student@domain.com" />
            <FormField label="Contact" icon="📞" type="tel" required value={data.contact} 
              onChange={e => setData({...data, contact: e.target.value})} placeholder="9876543210" />
            <FormField label="Course" icon="🎓" required value={data.course} 
              onChange={e => setData({...data, course: e.target.value})} placeholder="B.Tech CSE, MCA, etc." />

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
                  type === 'add' ? 'Add Student' : 'Update Student'
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
                <span className="text-xs font-semibold text-slate-700 uppercase">Student Management</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Students</h1>
              <p className="text-sm text-slate-600 mt-1">Manage student profiles and information</p>
            </div>
            <button 
              onClick={() => openModal('add')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <span>+</span> Add Student
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Students" value={stats.total} icon="👨‍🎓" color="blue" />
            <StatsCard title="With Email" value={stats.emails} icon="📧" color="indigo" />
            <StatsCard title="With Contact" value={stats.contacts} icon="📞" color="emerald" />
            <StatsCard title="Courses" value={stats.courses} icon="🎓" color="purple" />
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
                <p className="text-sm font-medium text-slate-700">Loading students...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['#', 'Student', 'Email', 'Contact', 'Course', 'Actions'].map((header, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <StudentRow key={student.id} student={student} index={index} />
                  ))}
                  {students.length === 0 && !loading.page && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-14 h-14 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                            👨‍🎓
                          </div>
                          <p className="text-base font-medium text-slate-700">No students found</p>
                          <p className="text-sm text-slate-500">Add your first student using the button above</p>
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
        {modal.add && <Modal type="add" title="Add New Student" onSubmit={(e) => handleSubmit(e, false)} />}
        {modal.edit && <Modal type="edit" title="Edit Student" onSubmit={(e) => handleSubmit(e, true)} />}

        {/* View Modal */}
        {modal.view && currentStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Student Profile</h2>
                  <p className="text-xs text-slate-600">ID: {currentStudent.id}</p>
                </div>
                <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
                  <span className="text-lg">✕</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow mb-3">
                    <span className="text-xl font-bold text-white">
                      {currentStudent.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{currentStudent.name}</h3>
                  <p className="text-sm text-slate-600">Student Profile</p>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  {[
                    { label: "Email", value: currentStudent.email, icon: "📧", color: "bg-emerald-50" },
                    { label: "Contact", value: currentStudent.contact, icon: "📞", color: "bg-blue-50" },
                    { label: "Course", value: currentStudent.course, icon: "🎓", color: "bg-purple-50" }
                  ].map(({ label, value, icon, color }, i) => (
                    <div key={i} className={`${color} p-3 rounded-lg border border-slate-200`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{icon}</span>
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{label}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      openModal('edit', currentStudent);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Student
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPage;