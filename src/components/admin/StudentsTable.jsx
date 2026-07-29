// src/components/admin/StudentsTable.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";
import StudentFormModal from "./StudentFormModal";
import AdmissionSettingsModal from "./AdmissionSettingsModal";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schoolConfig, setSchoolConfig] = useState(null);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("active");
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/students", {
        params: {
          search: search || undefined,
          classId: classFilter !== "ALL" ? classFilter : undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        },
      });
      setStudents(res.data.students);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [classesRes, configRes] = await Promise.all([
        API.get("/classes"),
        API.get("/school-config"),
      ]);
      setClasses(classesRes.data.classes);
      setSchoolConfig(configRes.data.school);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load school configuration");
    }
  };

  useEffect(() => { loadReferenceData(); }, []);
  useEffect(() => {
    const t = setTimeout(loadStudents, 300); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, classFilter, statusFilter]);

  const openAdd = () => { setEditingStudent(null); setFormOpen(true); };
  const openEdit = (student) => { setEditingStudent(student); setFormOpen(true); };

  const handleArchive = async (student, status) => {
    if (!confirm(`Mark ${student.firstName} ${student.lastName} as ${status}?`)) return;
    try {
      await API.patch(`/students/${student._id}/archive`, { status });
      toast.success("Student status updated");
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const exportToCSV = () => {
    let csv = "Admission No,Name,Class,Stream,Dorm,Gender,Role,Status\n";
    students.forEach((s) => {
      csv += `"${s.admissionNumber}","${s.firstName} ${s.lastName}","${s.class?.name || ""}","${s.stream || ""}","${s.dorm?.name || ""}","${s.gender || ""}","${s.displayRole || ""}","${s.status}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "Students_List.csv");
    a.click();
  };

  const stats = {
    total: students.length,
    male: students.filter((s) => s.gender === "male").length,
    female: students.filter((s) => s.gender === "female").length,
    withDorm: students.filter((s) => s.dorm).length,
  };

  const statusBadge = (status) => {
    const map = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      transferred: "bg-gray-200 text-gray-800",
      graduated: "bg-blue-100 text-blue-800",
      archived: "bg-gray-200 text-gray-500",
    };
    return <span className={`px-2 py-1 text-[10px] font-bold rounded capitalize ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Student Management</h2>
          <p className="text-xs text-gray-500">Admissions, profiles, and academic records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSettingsOpen(true)} title="Admissions Settings" className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg">
            <i className="fa-solid fa-sliders"></i>
          </button>
          <button onClick={openAdd} className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-md flex items-center space-x-2">
            <i className="fa-solid fa-user-plus"></i>
            <span>Admit New Student</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total (in view)" value={stats.total} icon="fa-users" />
        <StatCard label="Male" value={stats.male} icon="fa-person" />
        <StatCard label="Female" value={stats.female} icon="fa-person-dress" />
        <StatCard label="In a Dorm" value={stats.withDorm} icon="fa-bed" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-gray-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by name or admission no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange">
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange">
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
            <option value="archived">Archived</option>
          </select>

          <button onClick={exportToCSV} className="bg-black text-white hover:bg-gray-800 text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center space-x-1.5">
            <i className="fa-solid fa-file-csv text-brand-orange"></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">Admission No.</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Class / Stream</th>
                <th className="px-5 py-3.5">Dorm</th>
                <th className="px-5 py-3.5">Guardian</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400">Loading…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400">No student records match your search query.</td></tr>
              ) : (
                students.map((s) => {
                  const primary = s.guardians?.find((g) => g.isPrimaryContact) || s.guardians?.[0];
                  return (
                    <tr key={s._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{s.admissionNumber}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                        {s.displayRole && <p className="text-[10px] text-brand-orange font-semibold">{s.displayRole}</p>}
                      </td>
                      <td className="px-5 py-3.5">{s.class?.name}{s.stream ? ` (${s.stream})` : ""}</td>
                      <td className="px-5 py-3.5">{s.dorm?.name || "—"}</td>
                      <td className="px-5 py-3.5">
                        {primary ? (
                          <>
                            <p className="font-medium text-gray-800">{primary.name}</p>
                            <p className="text-[10px] text-gray-400">{primary.phone}</p>
                          </>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(s.status)}</td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button onClick={() => openEdit(s)} title="Edit Student" className="text-gray-500 hover:text-brand-orange">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        {s.status === "active" ? (
                          <button onClick={() => handleArchive(s, "suspended")} title="Suspend" className="text-gray-400 hover:text-red-600">
                            <i className="fa-solid fa-ban"></i>
                          </button>
                        ) : (
                          <button onClick={() => handleArchive(s, "active")} title="Reactivate" className="text-gray-400 hover:text-green-600">
                            <i className="fa-solid fa-rotate-left"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Showing {students.length} entries</span>
        </div>
      </div>

      {formOpen && (
        <StudentFormModal
          student={editingStudent}
          classes={classes}
          schoolConfig={schoolConfig}
          onClose={() => setFormOpen(false)}
          onSaved={loadStudents}
        />
      )}

      {settingsOpen && <AdmissionSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className="w-10 h-10 bg-brand-orange-light text-brand-orange rounded-lg flex items-center justify-center">
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}
