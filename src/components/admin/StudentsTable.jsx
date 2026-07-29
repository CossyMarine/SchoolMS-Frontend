// src/components/admin/StudentsTable.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/students", { params: { search } });
      setStudents(res.data.students);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Student Directory</h3>
          <p className="text-xs text-gray-500">{students.length} active students</p>
        </div>
        <input
          type="text"
          placeholder="Search name or admission #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:border-brand-orange"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Admission #</th>
              <th className="px-5 py-3">Class</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No students found</td></tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-semibold text-gray-900">{s.firstName} {s.lastName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-700">{s.admissionNumber}</td>
                  <td className="px-5 py-3">{s.class?.name} {s.stream}</td>
                  <td className="px-5 py-3 capitalize">{s.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
