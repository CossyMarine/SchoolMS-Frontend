// src/components/admin/ClassRosterModal.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ClassRosterModal({ classDoc, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoles, setShowRoles] = useState(true);

  useEffect(() => {
    API.get("/students", { params: { classId: classDoc._id, status: "active" } })
      .then((res) => setStudents(res.data.students))
      .finally(() => setLoading(false));
  }, [classDoc._id]);

  const streamList = classDoc.streams.length ? classDoc.streams.map((s) => s.name) : [""];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><i className="fa-solid fa-xmark text-xl"></i></button>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{classDoc.name} — Roll Call</h3>
            <p className="text-xs text-gray-500">{students.length} active student{students.length !== 1 ? "s" : ""}</p>
          </div>
          <label className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
            <input type="checkbox" checked={showRoles} onChange={(e) => setShowRoles(e.target.checked)} />
            Show role tags
          </label>
        </div>

        {loading ? (
          <p className="text-xs text-gray-400 py-8 text-center">Loading roster…</p>
        ) : (
          streamList.map((stream) => {
            const inStream = students.filter((s) => (s.stream || "") === stream);
            return (
              <div key={stream || "main"} className="mb-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{stream || classDoc.name} ({inStream.length})</h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                  {inStream.length === 0 ? (
                    <p className="text-[11px] text-gray-400 p-3">No students in this stream yet.</p>
                  ) : (
                    inStream.map((s) => (
                      <div key={s._id} className="flex items-center justify-between px-3 py-2 text-xs">
                        <span className="text-gray-800">{s.firstName} {s.lastName} <span className="text-gray-400">· {s.admissionNumber}</span></span>
                        {showRoles && s.displayRole && (
                          <span className="px-2 py-0.5 rounded bg-brand-orange-light text-brand-orange text-[10px] font-bold">{s.displayRole}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
